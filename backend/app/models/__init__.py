from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    google_id: Mapped[str] = mapped_column(String, unique=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    weight: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    height: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    current_split_id: Mapped[int | None] = mapped_column(ForeignKey("workout_splits.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class WorkoutSplit(Base):
    __tablename__ = "workout_splits"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SplitDay(Base):
    __tablename__ = "split_days"
    __table_args__ = (UniqueConstraint("split_id", "day_of_week"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    split_id: Mapped[int] = mapped_column(ForeignKey("workout_splits.id"))
    day_of_week: Mapped[int]
    label: Mapped[str] = mapped_column(String)