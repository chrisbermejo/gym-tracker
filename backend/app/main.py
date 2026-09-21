from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine

app = FastAPI()

@app.get("/test")
def health():
    return {"status": "ok"}


@app.get("/test/db")
def health_db():
    with engine.connect() as conn:
        result = conn.scalar(text("select 1"))
    return {"status": "ok", "result": result}