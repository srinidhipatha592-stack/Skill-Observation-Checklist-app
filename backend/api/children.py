from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timezone

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

    child = Child(**payload.model_dump())
    db.add(child)
    db.commit()
    db.refresh(child)

    # Automatically assign the new child to all existing teachers
    teachers = db.query(User).filter(User.role == "teacher").all()
    for teacher in teachers:
        assignment = TeacherStudentAssignment(
            teacher_id=teacher.id,
            child_id=child.id
        )
        db.add(assignment)
    db.commit()

    log_activity(
        db=db, user_id=str(user.id), role=str(user.role),
        action="Created Child", module="Children", request=request
    )
    return child


@router.get("/")
def get_children(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from models.observation import Observation
    
    query = db.query(Child).filter(Child.deleted == False)
    all_children = query.all()

    # Calculate global ranks for all children
    all_obs = db.query(Observation).filter(Observation.deleted == False).all()
    
    child_stats = {}
    for obs in all_obs:
        if obs.child_id not in child_stats:
            child_stats[obs.child_id] = {"total": 0, "count": 0}
        child_stats[obs.child_id]["total"] += obs.rating
        child_stats[obs.child_id]["count"] += 1
        
    averages = []
    for c in all_children:
        c_id = c.id
        if c_id in child_stats:
            avg = child_stats[c_id]["total"] / child_stats[c_id]["count"]
        else:
            avg = 0
        averages.append((c_id, avg))
        
    averages.sort(key=lambda x: x[1], reverse=True)
    ranks = {c_id: rank + 1 for rank, (c_id, avg) in enumerate(averages)}
    
    if user.role == "parent":
        filtered_children = [c for c in all_children if c.parent_email == user.email]
    elif user.role == "teacher":
        assignments = db.query(TeacherStudentAssignment).filter(TeacherStudentAssignment.teacher_id == user.id).all()
        child_ids = {a.child_id for a in assignments}
        filtered_children = [c for c in all_children if c.id in child_ids]
    elif user.role == "admin":
        filtered_children = all_children
    else:
        filtered_children = []

    result = []
    for c in filtered_children:
        c_dict = {
            "id": str(c.id),
            "name": c.name,
            "age": c.age,
            "gender": c.gender,
            "parent_name": c.parent_name,
            "parent_email": c.parent_email,
            "parent_phone": c.parent_phone,
            "classroom": c.classroom,
            "admission_date": c.admission_date.isoformat() if c.admission_date else None,
            "allergies": c.allergies,
            "medical_notes": c.medical_notes,
            "global_rank": ranks.get(c.id, len(all_children)),
            "global_avg": round(child_stats[c.id]["total"] / child_stats[c.id]["count"], 2) if c.id in child_stats else 0
        }
        result.append(c_dict)

    return result


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

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(child, key, value)

    db.commit()
    db.refresh(child)

    log_activity(
        db=db, user_id=str(user.id), role=str(user.role),
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
    child.deleted_at = datetime.now(timezone.utc)
    db.commit()

    log_activity(
        db=db, user_id=str(user.id), role=str(user.role),
        action="Deleted Child", module="Children", request=request
    )

    return {"message": "Child deleted successfully"}
