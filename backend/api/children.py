from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime

from core.database import get_db
from core.security import verify_access_token
from models.child import Child
from models.user import User
from models.assignment import TeacherStudentAssignment
from schemas.child import ChildCreate, ChildUpdate
from services.activity_log_service import log_activity

router = APIRouter(
    prefix="/api/children",
    tags=["Children"]
)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub"), User.is_active == True, User.deleted == False).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    if user.status != "active":
        raise HTTPException(status_code=403, detail="Account not active")
    return user

@router.post("/")
def create_child(
    payload: ChildCreate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to create children")

    child = Child(**payload.dict())
    db.add(child)
    db.commit()
    db.refresh(child)

    log_activity(
        db=db, user_id=str(user.id), role=user.role,
        action="Created Child", module="Children", request=request
    )
    return child


@router.get("/")
def get_children(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Child).filter(Child.deleted == False)

    if user.role == "parent":
        return query.filter(Child.parent_email == user.email).all()
        
    elif user.role == "teacher":
        assignments = db.query(TeacherStudentAssignment).filter(TeacherStudentAssignment.teacher_id == user.id).all()
        child_ids = [a.child_id for a in assignments]
        return query.filter(Child.id.in_(child_ids)).all()
        
    elif user.role == "admin":
        return query.all()
        
    return []


@router.get("/{child_id}")
def get_child(
    child_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    child = db.query(Child).filter(Child.id == child_id, Child.deleted == False).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    if user.role == "parent" and child.parent_email != user.email:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if user.role == "teacher":
        assignment = db.query(TeacherStudentAssignment).filter(
            TeacherStudentAssignment.teacher_id == user.id,
            TeacherStudentAssignment.child_id == child.id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Not assigned to this student")

    return child


@router.put("/{child_id}")
def update_child(
    child_id: str,
    payload: ChildUpdate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    child = db.query(Child).filter(Child.id == child_id, Child.deleted == False).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    if user.role == "teacher":
        assignment = db.query(TeacherStudentAssignment).filter(
            TeacherStudentAssignment.teacher_id == user.id,
            TeacherStudentAssignment.child_id == child.id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Not assigned to this student")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(child, key, value)

    db.commit()
    db.refresh(child)

    log_activity(
        db=db, user_id=str(user.id), role=user.role,
        action="Updated Child", module="Children", request=request
    )
    return child


@router.delete("/{child_id}")
def delete_child(
    child_id: str,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete records")

    child = db.query(Child).filter(Child.id == child_id, Child.deleted == False).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Soft Delete
    child.deleted = True
    child.deleted_by = user.id
    child.deleted_at = datetime.utcnow()
    db.commit()

    log_activity(
        db=db, user_id=str(user.id), role=user.role,
        action="Deleted Child", module="Children", request=request
    )

    return {"message": "Child deleted successfully"}