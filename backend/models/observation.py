import uuid

from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Boolean

from sqlalchemy.dialects.postgresql import UUID

from datetime import datetime, timezone

from core.database import Base


class Observation(Base):

    __tablename__ = "observations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    child_id = Column(
        UUID(as_uuid=True),
        ForeignKey("children.id"),
        nullable=False
    )

    teacher_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    skill = Column(
        String,
        nullable=False
    )

    rating = Column(
        Integer,
        nullable=False
    )

    notes = Column(
        String
    )

    observation_date = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    # Soft delete fields
    deleted = Column(Boolean, default=False)
    deleted_by = Column(UUID(as_uuid=True), nullable=True)
    deleted_at = Column(DateTime, nullable=True)
