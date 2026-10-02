"""HustleCoin public reference backend scaffold.

This module is retained as public example/legacy code. It is NOT the
authoritative gameplay backend deployed at https://hustlecoin-backend.fly.dev
and must not be used as proof of production Admin/Game Ops, Mongo, SafeLock,
payout, marketplace, or gameplay behavior.

See README.md and PUBLIC_RUNTIME_RELATIONSHIP.md.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import users, auth, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HustleCoin Public Reference Backend")

# add your web app origin here (and localhost for dev)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mushteba.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "role": "public-reference"}

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(transactions.router)
