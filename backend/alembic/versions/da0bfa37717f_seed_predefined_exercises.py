"""seed predefined exercises

Revision ID: da0bfa37717f
Revises: 942c827fb45d
Create Date: 2026-09-26 12:29:13.577819

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da0bfa37717f'
down_revision: Union[str, Sequence[str], None] = '942c827fb45d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    exercises = [
        ("Bench Press", "Chest"),
        ("Overhead Press", "Shoulders"),
        ("Barbell Row", "Back"),
        ("Pull-up", "Back"),
        ("Squat", "Legs"),
        ("Deadlift", "Back"),
        ("Bicep Curl", "Arms"),
        ("Tricep Pushdown", "Arms"),
    ]
    for name, muscle_group in exercises:
        conn.execute(
            sa.text("INSERT INTO exercises (name, muscle_group, created_at) VALUES (:name, :muscle_group, now())"),
            {"name": name, "muscle_group": muscle_group},
        )


def downgrade() -> None:
    names = ["Bench Press", "Overhead Press", "Barbell Row", "Pull-up", "Squat", "Deadlift", "Bicep Curl", "Tricep Pushdown"]
    op.get_bind().execute(sa.text("DELETE FROM exercises WHERE user_id IS NULL AND name = ANY(:names)"), {"names": names})