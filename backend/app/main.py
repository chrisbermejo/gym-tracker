import os

from fastapi import FastAPI
from sqlalchemy import create_engine, text

app = FastAPI()

database_url = os.environ["DATABASE_URL"].replace("postgresql://", "postgresql+psycopg://", 1)
engine = create_engine(database_url)


@app.get("/test")
def health():
    return {"status": "ok"}


@app.get("/test/db")
def health_db():
    with engine.connect() as conn:
        result = conn.scalar(text("select 1"))
    return {"status": "ok", "result": result}