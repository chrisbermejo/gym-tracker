"""add unit_system to users

Revision ID: 129def8dc225
Revises: 6530d8ce95e1
Create Date: 2026-10-09 23:34:19.710919

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '129def8dc225'
down_revision: Union[str, Sequence[str], None] = '6530d8ce95e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("unit_system", sa.String(), nullable=False, server_default="metric"))


def downgrade() -> None:
    op.drop_column("users", "unit_system")
