import os

from fastapi import FastAPI
from sqlalchemy import text
from starlette.middleware.sessions import SessionMiddleware

from app.database import engine
from app.auth import router as auth_router

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=os.environ["SESSION_SECRET"])
app.include_router(auth_router)

@app.get("/test")
def health():
    return {"status": "ok"}


@app.get("/test/db")
def health_db():
    with engine.connect() as conn:
        result = conn.scalar(text("select 1"))
    return {"status": "ok", "result": result}