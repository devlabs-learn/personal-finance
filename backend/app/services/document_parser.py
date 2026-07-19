from __future__ import annotations

import json

from datetime import datetime, timezone
from typing import Any

from fastapi import UploadFile

from app.agent.extract_agent import extract_transactions
from app.parser.pdf_parser import parse_transactions
from app.parser.image_parser import text_from_image


class DocumentParsingError(Exception):
    pass

class DocumentParser:
    def parse(self, file: UploadFile) -> list[dict[str, Any]]:
        content = self._read_text(file)
        if not content:
            raise DocumentParsingError("No text could be extracted from the uploaded document.")

        response = extract_transactions(content)
        try:
            return json.loads(response)
        except Exception as ex:
            print(ex)
            # print(response)
            return []

    def _read_text(self, file: UploadFile) -> str:
        if file.filename and file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
            return self._extract_text_with_fallback(file)

        # Read file content
        content = file.file.read()
        file.file.seek(0)

        if isinstance(content, bytes):
            return content.decode("utf-8", errors="ignore")
        
        return str(content)

    def _extract_text_with_fallback(self, file: UploadFile) -> str:
        filename = (file.filename or "upload").lower()

        # Extract text from pdf document
        if filename.endswith(".pdf"):
            return parse_transactions(file.file)

        # Extract text from Images using OCR capability
        if filename.endswith((".png", ".jpg", ".jpeg")):
            return text_from_image(file.file)

        return ""

    
