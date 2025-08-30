"""Shared dependencies for application modules."""

from collections.abc import Iterator

from sqlalchemy.orm import Session

from database import SessionLocal


def get_db() -> Iterator[Session]:
    """Yield a database session and ensure it gets closed."""
    with SessionLocal() as db:
        yield db
