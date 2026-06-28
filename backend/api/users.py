from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from core.database import get_db
from core.security import verify_access_token, hash_password
from models.user import User
from schemas.user import CreateUserRequest
from services.activity_log_service import log_activity

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)

security = HTTPBearer()

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.id == payload.get("sub"), User.is_active == True, User.deleted == False).first()
    if not user:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def get_current_admin_or_teacher(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_access_token(token)
    if not payload or payload.get("role") not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Admin or Teacher access required")
    user = db.query(User).filter(User.id == payload.get("sub"), User.is_active == True, User.deleted == False).first()
    if not user:
        raise HTTPException(status_code=403, detail="Admin or Teacher access required")
    return user

@router.get("/")
def get_users(current_user: User = Depends(get_current_admin_or_teacher), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.deleted == False).all()
    return [
        {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "is_active": user.is_active
        }
        for user in users
    ]

@router.post("/")
def create_user(
    payload: CreateUserRequest,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
        status="active"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(
        db=db, user_id=str(admin.id), role=str(admin.role),
        action="User Created", module="User Management", request=request
    )

    return {"message": "User created successfully"}

@router.put("/{user_id}")
def update_user(
    user_id: str,
    payload: CreateUserRequest,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id, User.deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = db.query(User).filter(User.email == payload.email, User.id != user_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    user.name = payload.name
    user.email = payload.email
    user.role = payload.role
    if payload.password: # Only hash if provided
        user.password_hash = hash_password(payload.password)

    db.commit()
    db.refresh(user)

    log_activity(
        db=db, user_id=str(admin.id), role=str(admin.role),
        action="User Updated", module="User Management", request=request
    )

    return {"message": "User updated successfully"}


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id, User.deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.deleted = True
    user.deleted_by = admin.id
    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False # Deactivate as well
    db.commit()

    log_activity(
        db=db, user_id=str(admin.id), role=str(admin.role),
        action="User Deleted", module="User Management", request=request
    )

    return {"message": "User deactivated successfully"}
