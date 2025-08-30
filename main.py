from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import users, auth, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HustleCoin Backend")

# add your web app origin here (and localhost for dev)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-frontend-domain.com", # <-- replace with Mushteba domain when you have it
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
    return {"status": "ok"}

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(transactions.router)
