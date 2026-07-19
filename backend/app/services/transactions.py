from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.api.schemas import TransactionCreate, TransactionRead
from app.models import Transaction

def list_all(db: Session) -> list[TransactionRead]:
    rows = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    return [TransactionRead.model_validate(row) for row in rows]

def create(db: Session, payload: TransactionCreate) -> TransactionRead:
    row = Transaction(
        description=payload.description,
        amount=payload.amount,
        transaction_type=payload.transaction_type,
        category=payload.category,
        currency=payload.currency,
        merchant=payload.merchant,
        date=payload.date or datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return TransactionRead.model_validate(row)


def create_many(db: Session, payloads: list[TransactionCreate]) -> list[Transaction]:
    rows = [
        Transaction(
            description=p.description,
            amount=p.amount,
            transaction_type=p.transaction_type,
            category=p.category,
            currency=p.currency,
            merchant=p.merchant,
            date=p.date or datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
        )
        for p in payloads
    ]
    db.add_all(rows)
    db.commit()
    for row in rows:
        db.refresh(row)
    return rows


def get_summary(db: Session) -> dict[str, float]:
    rows = db.query(Transaction).all()
    income = sum(r.amount for r in rows if r.transaction_type == "income")
    expenses = sum(r.amount for r in rows if r.transaction_type == "expense")
    return {
        "income": round(income, 2),
        "expenses": round(expenses, 2),
        "balance": round(income - expenses, 2),
    }
