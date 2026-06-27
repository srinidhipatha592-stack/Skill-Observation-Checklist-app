import uuid

from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import DateTime

from sqlalchemy.dialects.postgresql import UUID

from core.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name = Column(
        String,
        nullable=False
    )

    username = Column(
        String,
        unique=True,
        nullable=True
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Teacher specific fields
    school_name = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    qualification = Column(String, nullable=True)

    # Status control (pending, active, suspended)
    status = Column(String, default="active")

    # Soft delete fields
    deleted = Column(Boolean, default=False)
    deleted_by = Column(UUID(as_uuid=True), nullable=True)
    deleted_at = Column(DateTime, nullable=True)