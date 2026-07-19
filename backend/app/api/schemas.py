from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class DocumentParseResponse(BaseModel):
    description: str
    amount: float
    transaction_type: Literal["income", "expense"]
    category: str
    currency: str
    merchant: str | None = None
    date: str | None = None


class TransactionCreate(BaseModel):
    description: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    transaction_type: Literal["income", "expense"]
    category: str = Field(default="Uncategorized")
    currency: str = Field(default="INR")
    merchant: str | None = None
    date: datetime | None = None


class TransactionRead(TransactionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
