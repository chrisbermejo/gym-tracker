"""predefined upper lower split

Revision ID: 5f0ebbfcc143
Revises: 5f8747828a2b
Create Date: 2026-09-23 14:26:05.819011

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5f0ebbfcc143'
down_revision: Union[str, Sequence[str], None] = '5f8747828a2b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    result = conn.execute(
        sa.text("INSERT INTO workout_splits (name, created_at) VALUES (:name, now()) RETURNING id"),
        {"name": "Upper/Lower"},
    )
    split_id = result.scalar_one()

    days = [
        (0, "Rest"),   # Sunday
        (1, "Upper"),  # Monday
        (2, "Lower"),  # Tuesday
        (3, "Rest"),   # Wednesday
        (4, "Upper"),  # Thursday
        (5, "Lower"),  # Friday
        (6, "Rest"),   # Saturday
    ]
    for day_of_week, label in days:
        conn.execute(
            sa.text("INSERT INTO split_days (split_id, day_of_week, label) VALUES (:split_id, :day_of_week, :label)"),
            {"split_id": split_id, "day_of_week": day_of_week, "label": label},
        )


def downgrade() -> None:
    op.get_bind().execute(sa.text("DELETE FROM workout_splits WHERE name = 'Upper/Lower' AND user_id IS NULL"))
