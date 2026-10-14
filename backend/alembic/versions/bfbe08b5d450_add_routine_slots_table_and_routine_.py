"""add routine_slots table and routine_position to users

Revision ID: bfbe08b5d450
Revises: 129def8dc225
Create Date: 2026-10-14 00:53:40.582777

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bfbe08b5d450'
down_revision: Union[str, Sequence[str], None] = '129def8dc225'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "routine_slots",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("workout_type_id", sa.Integer(), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["workout_type_id"], ["workout_types.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.add_column("users", sa.Column("routine_position", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("users", "routine_position")
    op.drop_table("routine_slots")