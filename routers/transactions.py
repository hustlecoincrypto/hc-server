from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Transaction, User
from schemas import TransactionCreate, TransactionOut, BalanceOut
from routers.auth import get_current_user

from dependencies import get_db

router = APIRouter(prefix="/transactions", tags=["transactions"])

def get_balance(db: Session, user_id: int) -> int:
    credits = db.query(func.coalesce(func.sum(Transaction.amount_hc), 0))\
                .filter(Transaction.user_id == user_id, Transaction.type == "credit")\
                .scalar()
    debits = db.query(func.coalesce(func.sum(Transaction.amount_hc), 0))\
               .filter(Transaction.user_id == user_id, Transaction.type == "debit")\
               .scalar()
    return int(credits - debits)

@router.get("", response_model=list[TransactionOut])
def list_my_transactions(
    type: str | None = Query(None, pattern="^(credit|debit)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if type:
        q = q.filter(Transaction.type == type)
    return q.order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/balance", response_model=BalanceOut)
def my_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"balance_hc": get_balance(db, current_user.id)}

@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.type == "debit":
        bal = get_balance(db, current_user.id)
        if payload.amount_hc > bal:
            raise HTTPException(status_code=400, detail="Insufficient balance")

    tx = Transaction(
        user_id=current_user.id,
        type=payload.type,
        amount_hc=payload.amount_hc,
        description=payload.description,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
