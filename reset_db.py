import asyncio
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from core.database import Base, engine, SessionLocal
from models.user import User
from models.child import Child
from models.observation import Observation
from models.assignment import TeacherStudentAssignment
from models.audit_log import AuditLog
from core.security import hash_password

def reset_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Create an admin user
        admin = User(
            name="Admin User",
            email="admin@school.com",
            password_hash=hash_password("admin123"),
            role="admin",
            status="active"
        )
        db.add(admin)
        db.commit()
        print("Admin user created: admin@school.com / admin123")
    except Exception as e:
        print("Error seeding data:", e)
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
