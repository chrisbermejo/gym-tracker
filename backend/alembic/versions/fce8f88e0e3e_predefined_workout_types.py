"""predefined workout types

Revision ID: fce8f88e0e3e
Revises: e3c712d08314
Create Date: 2026-09-24 12:15:23.617660

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fce8f88e0e3e'
down_revision: Union[str, Sequence[str], None] = 'e3c712d08314'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM workout_types WHERE user_id IS NULL"))
    for name in ["Push", "Pull", "Legs", "Upper", "Lower", "Rest"]:
        conn.execute(
            sa.text("INSERT INTO workout_types (name, created_at) VALUES (:name, now())"),
            {"name": name},
        )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            "DELETE FROM workout_types WHERE user_id IS NULL AND name IN ('Push','Pull','Legs','Upper','Lower','Rest')"
        )
    )
