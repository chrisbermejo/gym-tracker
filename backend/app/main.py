import os

from fastapi import FastAPI
from sqlalchemy import text
from starlette.middleware.sessions import SessionMiddleware

from backend.app.core.database import engine
from backend.app.api.auth import router as auth_router
from backend.app.api.users import router as users_router

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=os.environ["SESSION_SECRET"])

app.include_router(auth_router)
app.include_router(users_router)

@app.get("/test")
def health():
    return {"status": "ok"}


@app.get("/test/db")
def health_db():
    with engine.connect() as conn:
        result = conn.scalar(text("select 1"))
    return {"status": "ok", "result": result}