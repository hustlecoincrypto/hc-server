from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from pydantic import conint
from datetime import datetime

# ---------- Users ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

# ---------- Transactions ----------
class TransactionCreate(BaseModel):
    type: Literal["credit", "debit"]
    amount_hc: conint(gt=0)
    description: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    user_id: int
    type: Literal["credit", "debit"]
    amount_hc: int
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BalanceOut(BaseModel):
    balance_hc: int
