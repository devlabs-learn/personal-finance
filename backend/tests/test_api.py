import os
import unittest
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.main import app


class FinanceApiTests(unittest.TestCase):
    def setUp(self):
        db_path = Path(__file__).resolve().parents[1] / "app" / "finance_tracker.db"
        if db_path.exists():
            db_path.unlink()
            
        os.environ.pop("DATABASE_URL", None)
        self.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_list_transactions(self):
        response = self.client.get("/api/v1/transactions")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_create_transaction(self):
        payload = {
            "description": "Groceries",
            "amount": 42.5,
            "transaction_type": "expense",
            "category": "Food",
        }
        response = self.client.post("/api/v1/transactions", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["description"], payload["description"])

    def test_dashboard_summary(self):
        response = self.client.get("/api/v1/dashboard/summary")
        self.assertEqual(response.status_code, 200)
        self.assertIn("income", response.json())
        self.assertIn("expenses", response.json())

    def test_transaction_persisted_to_database(self):
        payload = {
            "description": "Salary",
            "amount": 1200.0,
            "transaction_type": "income",
            "category": "Salary",
        }
        response = self.client.post("/api/v1/transactions", json=payload)
        self.assertEqual(response.status_code, 201)

        db_path = Path(__file__).resolve().parents[1] / "app" / "finance_tracker.db"
        self.assertTrue(db_path.exists())

        engine = create_engine(f"sqlite:///{db_path}")
        with engine.connect() as connection:
            row_count = connection.execute(text("SELECT COUNT(*) FROM transactions")).scalar_one()

        self.assertEqual(row_count, 1)

    def test_parse_transaction_from_document_upload(self):
        response = self.client.post(
            "/api/v1/transactions/from-document",
            files={
                "file": (
                    "receipt.txt",
                    b"Coffee Shop\nAmount: 8.75\nDate: 2026-07-16",
                    "text/plain",
                )
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["description"], "Coffee Shop")
        self.assertEqual(response.json()[0]["amount"], 8.75)
        self.assertEqual(response.json()[0]["transaction_type"], "expense")

    def test_parse_transaction_from_document_upload_saves_multiple_transactions(self):
        response = self.client.post(
            "/api/v1/transactions/from-document",
            files={
                "file": (
                    "receipt.txt",
                    b"Coffee Shop\nAmount: 8.75\nTaxi\nAmount: 12.50\nDate: 2026-07-16",
                    "text/plain",
                )
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload), 2)
        self.assertEqual([item["description"] for item in payload], ["Coffee Shop", "Taxi"])

        db_path = Path(__file__).resolve().parents[1] / "app" / "finance_tracker.db"
        engine = create_engine(f"sqlite:///{db_path}")
        with engine.connect() as connection:
            row_count = connection.execute(text("SELECT COUNT(*) FROM transactions")).scalar_one()

        self.assertEqual(row_count, 2)


if __name__ == "__main__":
    unittest.main()
