from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class DocumentParseResponse(BaseModel):
    description: str
    amount: float
    transaction_type: Literal["income", "expense"]
    category: str
    date: str | None = None


class TransactionCreate(BaseModel):
    description: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    transaction_type: Literal["income", "expense"]
    category: str = Field(default="Uncategorized")
    date: datetime | None = None


class TransactionRead(TransactionCreate):
    id: int
    created_at: datetime
