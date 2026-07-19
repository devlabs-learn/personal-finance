from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.schemas import DocumentParseResponse, TransactionCreate, TransactionRead
from app.database import get_db
from app.services import transactions as transaction_service
from app.services.document_parser import DocumentParser, DocumentParsingError

router = APIRouter(tags=["transactions"])


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/transactions", response_model=list[TransactionRead])
def list_transactions(db: Session = Depends(get_db)) -> list[TransactionRead]:
    return transaction_service.list_all(db)


@router.post("/transactions", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)) -> TransactionRead:
    return transaction_service.create(db, payload)


@router.post("/transactions/from-document", response_model=list[DocumentParseResponse])
def parse_transactions_from_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> list[DocumentParseResponse]:
    try:
        parsed_items = DocumentParser().parse(file)
    except DocumentParsingError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    
    print(parsed_items)
    
    payloads = [
        TransactionCreate(
            description=item["description"],
            amount=item["amount"],
            transaction_type=item["transaction_type"],
            category=item["category"],
            merchant=item["merchant"],
            currency=item["currency"],
            date=datetime.fromisoformat(item["date"]) if item.get("date") else None,
        )
        for item in parsed_items
    ]
    saved = transaction_service.create_many(db, payloads)

    return [
        DocumentParseResponse(
            description=t.description,
            amount=t.amount,
            transaction_type=t.transaction_type,
            category=t.category,
            merchant=t.merchant,
            currency=t.currency,
            date=t.date.date().isoformat(),
        )
        for t in saved
    ]


@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)) -> dict[str, float]:
    return transaction_service.get_summary(db)
