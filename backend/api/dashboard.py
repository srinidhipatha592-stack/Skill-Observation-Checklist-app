from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func

from core.database import get_db
from core.security import verify_access_token
from models.user import User
from models.child import Child
from models.observation import Observation
from models.notification import Notification
from models.assignment import TeacherStudentAssignment
from models.audit_log import AuditLog

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
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

@router.get("/stats")
def dashboard_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "admin":
        users = db.query(User).filter(User.is_active == True, User.deleted == False).all()
        return {
            "total_users": len(users),
            "total_admins": sum(1 for u in users if u.role == "admin"),
            "total_teachers": sum(1 for u in users if u.role == "teacher"),
            "total_parents": sum(1 for u in users if u.role == "parent"),
            "total_children": db.query(Child).filter(Child.deleted == False).count(),
            "total_observations": db.query(Observation).filter(Observation.deleted == False).count(),
            "total_notifications": db.query(Notification).count(),
            "total_activity_logs": db.query(AuditLog).count(),
            "trends": {
                "total_children": "+ 12%",
                "total_observations": "+ 5%",
                "total_teachers": "+ 2%",
                "total_notifications": "- 10%",
                "total_users": "+ 3%",
                "total_admins": "- 0%",
                "total_parents": "+ 5%",
                "total_activity_logs": "+ 8%"
            }
        }
    elif user.role == "teacher":
        assignments = db.query(TeacherStudentAssignment).filter(TeacherStudentAssignment.teacher_id == user.id).all()
        child_ids = [a.child_id for a in assignments]
        return {
            "total_children": len(child_ids),
            "total_observations": db.query(Observation).filter(Observation.created_by == user.id, Observation.deleted == False).count(),
            "total_teachers": db.query(User).filter(User.role == "teacher", User.is_active == True, User.deleted == False).count(),
            "total_notifications": db.query(Notification).count(),
        }
    elif user.role == "parent":
        children = db.query(Child).filter(Child.parent_email == user.email, Child.deleted == False).all()
        child_ids = [c.id for c in children]
        return {
            "total_children": len(child_ids),
            "total_observations": db.query(Observation).filter(Observation.child_id.in_(child_ids), Observation.deleted == False).count(),
        }

@router.get("/child-progress")
def child_progress(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Child).filter(Child.deleted == False)

    if user.role == "parent":
        children = query.filter(Child.parent_email == user.email).all()
    elif user.role == "teacher":
        assignments = db.query(TeacherStudentAssignment).filter(TeacherStudentAssignment.teacher_id == user.id).all()
        child_ids = [a.child_id for a in assignments]
        children = query.filter(Child.id.in_(child_ids)).all()
    elif user.role == "admin":
        children = query.all()
    else:
        children = []

    results = []
    for child in children:
        observations = db.query(Observation).filter(Observation.child_id == child.id, Observation.deleted == False).all()
        total_observations = len(observations)
        average_rating = 0
        if total_observations > 0:
            average_rating = round(sum(obs.rating for obs in observations) / total_observations, 1)

        results.append({
            "child_id": str(child.id),
            "child_name": child.name,
            "total_observations": total_observations,
            "average_rating": average_rating
        })

    return results

@router.get("/top-child")
def top_child(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Child).filter(Child.deleted == False)

    if user.role == "parent":
        children = query.filter(Child.parent_email == user.email).all()
    elif user.role == "teacher":
        assignments = db.query(TeacherStudentAssignment).filter(TeacherStudentAssignment.teacher_id == user.id).all()
        child_ids = [a.child_id for a in assignments]
        children = query.filter(Child.id.in_(child_ids)).all()
    elif user.role == "admin":
        children = query.all()
    else:
        children = []

    best_child = None
    highest_rating = 0

    for child in children:
        observations = db.query(Observation).filter(Observation.child_id == child.id, Observation.deleted == False).all()
        if len(observations) == 0:
            continue
        
        average_rating = round(sum(obs.rating for obs in observations) / len(observations), 1)

        if average_rating > highest_rating:
            highest_rating = average_rating
            best_child = {
                "child_id": str(child.id),
                "child_name": child.name,
                "average_rating": average_rating,
                "total_observations": len(observations)
            }

    if not best_child:
        return {
            "child_id": None,
            "child_name": "No Data",
            "average_rating": 0,
            "total_observations": 0
        }

    return best_child
