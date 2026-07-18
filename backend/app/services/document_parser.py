from __future__ import annotations

import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import UploadFile


class DocumentParsingError(Exception):
    pass


class DocumentParser:
    def __init__(self) -> None:
        self.use_crewai = os.getenv("USE_CREWAI", "false").lower() == "true"

    def parse(self, file: UploadFile) -> list[dict[str, Any]]:
        content = self._read_text(file)

        if not content:
            raise DocumentParsingError("No text could be extracted from the uploaded document.")

        try:
            from crewai import Agent, Crew, Task
        except Exception:  # pragma: no cover - optional dependency
            self.use_crewai = False
        else:
            if self.use_crewai:
                return self._parse_with_crewai(content)

        return self._parse_with_rules(content)

    def _read_text(self, file: UploadFile) -> str:
        if file.filename and file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
            return self._extract_text_with_fallback(file)

        content = file.file.read()
        file.file.seek(0)
        if isinstance(content, bytes):
            try:
                return content.decode("utf-8")
            except UnicodeDecodeError:
                return content.decode("utf-8", errors="ignore")
        return str(content)

    def _extract_text_with_fallback(self, file: UploadFile) -> str:
        print("_extract_text_with_fallback")
        filename = (file.filename or "upload").lower()
        content = file.file.read()
        file.file.seek(0)

        if filename.endswith(".pdf"):
            try:
                from pypdf import PdfReader
            except Exception as ex:
                PdfReader = None
                print(ex)
            else:
                try:
                    temp_path = Path(file.filename or "upload")
                    temp_path.write_bytes(content)
                    reader = PdfReader(str(temp_path))
                    text_blocks = [page.extract_text() or "" for page in reader.pages]
                    temp_path.unlink(missing_ok=True)
                    return "\n".join(text_blocks)
                except Exception as ex:
                    print(ex)

        if filename.endswith((".png", ".jpg", ".jpeg")):
            try:
                from PIL import Image
                import pytesseract
            except Exception as ex:
                print(ex)
                return ""

            try:
                image = Image.open(file.file)
                return pytesseract.image_to_string(image)
            except Exception as ex:
                print(ex)
                return ""

        return ""

    def _parse_with_crewai(self, content: str) -> list[dict[str, Any]]:
        from crewai import Agent, Crew, Task

        extraction_agent = Agent(
            role="Receipt parser",
            goal="Extract financial transactions from receipts and documents",
            backstory="You interpret merchant names, amounts, dates, and categorize expenses or income.",
            verbose=True,
            allow_delegation=False,
        )

        task = Task(
            description="""
                From the following document text, return a JSON array of objects with keys:
                description, amount, transaction_type, category, date.
                f"Document text:\n{content}"
            """,
            expected_output="return a JSON array of objects with keys: description, amount, transaction_type, category, date",
            agent=extraction_agent,
        )

        result = Crew(agents=[extraction_agent], tasks=[task], verbose=True).kickoff(inputs={"content": content})

        parsed_text = str(result).strip()

        return self._parse_with_rules(parsed_text)

    def _parse_with_rules(self, content: str) -> list[dict[str, Any]]:
        transactions = self._extract_transactions(content)
        if not transactions:
            raise DocumentParsingError("Could not infer a monetary amount from the document.")
        return transactions

    def _extract_transactions(self, content: str) -> list[dict[str, Any]]:
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        transactions: list[dict[str, Any]] = []
        pending_description: str | None = None

        for line in lines:
            amount = self._extract_amount_from_line(line)
            if amount is not None:
                description = self._extract_description_from_line(line, pending_description)
                transactions.append(
                    {
                        "description": description or "Unknown Transaction",
                        "amount": round(amount, 2),
                        "transaction_type": "expense",
                        "category": self._infer_category(description),
                        "date": self._find_date(content),
                    }
                )
                pending_description = None
                continue

            if self._is_noise(line):
                continue

            pending_description = self._clean_description(line)

        if transactions:
            return transactions

        single_amount = self._find_amount(content)
        if single_amount is None:
            return []

        description = self._find_description(content)
        return [
            {
                "description": description or "Unknown Transaction",
                "amount": round(single_amount, 2),
                "transaction_type": "expense",
                "category": self._infer_category(description),
                "date": self._find_date(content),
            }
        ]

    def _extract_amount_from_line(self, line: str) -> float | None:
        match = re.search(r"(\d+(?:\.\d{1,2})?)", line)
        if not match:
            return None

        value = float(match.group(1))
        if value <= 0:
            return None
        return value

    def _extract_description_from_line(self, line: str, fallback: str | None) -> str | None:
        if fallback:
            return fallback

        cleaned = re.sub(r"\b(?:amount|total|subtotal|balance|date)\b[^\w]*", "", line, flags=re.IGNORECASE)
        cleaned = re.sub(r"\$|,", "", cleaned)
        cleaned = re.sub(r"\d+(?:\.\d{1,2})?", "", cleaned)
        cleaned = cleaned.strip(" -:;")
        return cleaned or None

    def _clean_description(self, line: str) -> str | None:
        if self._is_noise(line):
            return None

        cleaned = re.sub(r"\b(?:amount|total|subtotal|balance|date)\b", "", line, flags=re.IGNORECASE)
        cleaned = cleaned.strip(" -:;")
        return cleaned or None

    def _is_noise(self, line: str) -> bool:
        lowered = line.lower()
        if any(keyword in lowered for keyword in ["amount", "total", "subtotal", "balance", "date", "receipt"]):
            return True
        return False

    def _find_description(self, content: str) -> str | None:
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        for line in lines:
            if re.search(r"amount|date|total|subtotal|balance", line, re.IGNORECASE):
                continue
            if re.match(r"^\d+(\.\d+)?$", line):
                continue
            if len(line) > 2:
                return line
        return None

    def _find_amount(self, content: str) -> float | None:
        matches = re.findall(r"(?:^|\D)(\d+(?:\.\d{1,2})?)(?:\D|$)", content)
        if not matches:
            return None

        for candidate in matches:
            value = float(candidate)
            if value > 0:
                return value
        return None

    def _find_date(self, content: str) -> str | None:
        date_patterns = [
            r"\b(\d{4}-\d{2}-\d{2})\b",
            r"\b(\d{2}/\d{2}/\d{4})\b",
            r"\b(\d{2}-\d{2}-\d{4})\b",
        ]
        for pattern in date_patterns:
            match = re.search(pattern, content)
            if match:
                return match.group(1)
        return datetime.now(timezone.utc).date().isoformat()

    def _infer_category(self, description: str | None) -> str:
        text = (description or "").lower()
        if any(keyword in text for keyword in ["coffee", "cafe", "restaurant", "food", "grocer"]):
            return "Food"
        if any(keyword in text for keyword in ["fuel", "gas", "uber", "taxi"]):
            return "Transport"
        if any(keyword in text for keyword in ["salary", "payroll", "income"]):
            return "Income"
        return "Uncategorized"
