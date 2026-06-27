from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import or_

from core.database import get_db
from core.security import verify_access_token
from models.user import User
from models.child import Child
from models.assignment import TeacherStudentAssignment
from services.activity_log_service import log_activity

from pydantic import BaseModel

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
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

class ApprovalRequest(BaseModel):
    action: str  # "approve" or "reject"

@router.get("/teachers/pending")
def get_pending_teachers(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    teachers = db.query(User).filter(
        User.role == "teacher",
        User.status == "pending",
        User.deleted == False
    ).all()
    
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "email": t.email,
            "school_name": t.school_name,
            "qualification": t.qualification,
            "created_at": t.created_at.isoformat() if t.created_at else None
        }
        for t in teachers
    ]

@router.put("/teachers/{teacher_id}/approval")
def approve_teacher(teacher_id: str, payload: ApprovalRequest, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher", User.deleted == False).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
        
    if payload.action == "approve":
        teacher.status = "active"
    elif payload.action == "reject":
        teacher.status = "suspended" # or deleted
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    db.commit()
    db.refresh(teacher)
    
    return {"message": f"Teacher {payload.action}d successfully"}

class AssignmentRequest(BaseModel):
    child_ids: list[str]

@router.post("/teachers/{teacher_id}/assign")
def assign_students(teacher_id: str, payload: AssignmentRequest, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher", User.deleted == False).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
        
    # Clear existing assignments or just add new? Let's clear existing and set new.
    db.query(TeacherStudentAssignment).filter(TeacherStudentAssignment.teacher_id == teacher.id).delete()
    
    for child_id in payload.child_ids:
        assignment = TeacherStudentAssignment(
            teacher_id=teacher.id,
            child_id=child_id
        )
        db.add(assignment)
        
    db.commit()
    
    return {"message": "Students assigned successfully"}

@router.get("/teachers/{teacher_id}/assignments")
def get_teacher_assignments(teacher_id: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher", User.deleted == False).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
        
    assignments = db.query(TeacherStudentAssignment).filter(TeacherStudentAssignment.teacher_id == teacher.id).all()
    return {"child_ids": [str(a.child_id) for a in assignments]}
