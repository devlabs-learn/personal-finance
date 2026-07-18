from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.api.schemas import DocumentParseResponse, TransactionCreate, TransactionRead
from app.database import get_db
from app.models import Transaction
from app.services.document_parser import DocumentParser, DocumentParsingError

router = APIRouter(tags=["transactions"])


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/transactions", response_model=list[TransactionRead])
def list_transactions(db: Session = Depends(get_db)) -> list[TransactionRead]:
    transactions = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    return [
        TransactionRead(
            id=transaction.id,
            description=transaction.description,
            amount=transaction.amount,
            transaction_type=transaction.transaction_type,
            category=transaction.category,
            date=transaction.date,
            created_at=transaction.created_at,
        )
        for transaction in transactions
    ]


@router.post(
    "/transactions",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
) -> TransactionRead:
    transaction = Transaction(
        description=payload.description,
        amount=payload.amount,
        transaction_type=payload.transaction_type,
        category=payload.category,
        date=payload.date or datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return TransactionRead(
        id=transaction.id,
        description=transaction.description,
        amount=transaction.amount,
        transaction_type=transaction.transaction_type,
        category=transaction.category,
        date=transaction.date,
        created_at=transaction.created_at,
    )


@router.post("/transactions/from-document", response_model=list[DocumentParseResponse])
def parse_transaction_from_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> list[DocumentParseResponse]:
    parser = DocumentParser()
    try:
        parsed_items = parser.parse(file)
    except DocumentParsingError as exc:
        raise ValueError(str(exc)) from exc

    if isinstance(parsed_items, dict):
        parsed_items = [parsed_items]

    saved_transactions: list[Transaction] = []
    for parsed in parsed_items:
        payload = TransactionCreate(
            description=parsed["description"],
            amount=parsed["amount"],
            transaction_type=parsed["transaction_type"],
            category=parsed["category"],
            date=datetime.fromisoformat(parsed["date"]) if parsed.get("date") else None,
        )

        transaction = Transaction(
            description=payload.description,
            amount=payload.amount,
            transaction_type=payload.transaction_type,
            category=payload.category,
            date=payload.date or datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
        )
        db.add(transaction)
        saved_transactions.append(transaction)

    db.commit()
    for transaction in saved_transactions:
        db.refresh(transaction)

    return [
        DocumentParseResponse(
            description=transaction.description,
            amount=transaction.amount,
            transaction_type=transaction.transaction_type,
            category=transaction.category,
            date=transaction.date.date().isoformat(),
        )
        for transaction in saved_transactions
    ]


@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)) -> dict[str, float]:
    transactions = db.query(Transaction).all()
    income = sum(item.amount for item in transactions if item.transaction_type == "income")
    expenses = sum(item.amount for item in transactions if item.transaction_type == "expense")

    return {
        "income": round(income, 2),
        "expenses": round(expenses, 2),
        "balance": round(income - expenses, 2),
    }
