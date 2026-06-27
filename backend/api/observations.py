from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime

from core.database import get_db
from core.security import verify_access_token
from models.observation import Observation
from models.child import Child
from models.user import User
from models.assignment import TeacherStudentAssignment
from schemas.observation import ObservationCreate, ObservationUpdate
from services.activity_log_service import log_activity

router = APIRouter(
    prefix="/api/observations",
    tags=["Observations"]
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
def create_observation(
    payload: ObservationCreate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to create observations")
        
    child = db.query(Child).filter(Child.id == payload.child_id, Child.deleted == False).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    if user.role == "teacher":
        assignment = db.query(TeacherStudentAssignment).filter(
            TeacherStudentAssignment.teacher_id == user.id,
            TeacherStudentAssignment.child_id == child.id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Not assigned to this student")

    # Assuming teacher_id in payload could be overridden, we enforce it based on current user unless admin
    teacher_id = payload.teacher_id if user.role == "admin" else user.id

    observation = Observation(
        **payload.dict(exclude={"teacher_id"}),
        teacher_id=teacher_id,
        created_by=user.id
    )

    db.add(observation)
    db.commit()
    db.refresh(observation)

    log_activity(
        db=db, user_id=str(user.id), role=user.role,
        action="Created Observation", module="Observations", request=request
    )

    return observation


@router.get("/")
def get_observations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Observation).filter(Observation.deleted == False)

    if user.role == "parent":
        children = db.query(Child).filter(Child.parent_email == user.email).all()
        child_ids = [child.id for child in children]
        observations = query.filter(Observation.child_id.in_(child_ids)).all()

    elif user.role == "teacher":
        assignments = db.query(TeacherStudentAssignment).filter(TeacherStudentAssignment.teacher_id == user.id).all()
        child_ids = [a.child_id for a in assignments]
        observations = query.filter(Observation.child_id.in_(child_ids)).all()

    elif user.role == "admin":
        observations = query.all()
    else:
        observations = []

    result = []
    for obs in observations:
        child = db.query(Child).filter(Child.id == obs.child_id).first()
        teacher = db.query(User).filter(User.id == obs.teacher_id).first()

        result.append({
            "id": str(obs.id),
            "child_id": str(obs.child_id),
            "child_name": child.name if child else "Unknown Child",
            "teacher_name": teacher.name if teacher else "Unknown Teacher",
            "skill": obs.skill,
            "skill_area": obs.skill,
            "rating": obs.rating,
            "notes": obs.notes,
            "observation_date": obs.observation_date.isoformat() if obs.observation_date else None
        })

    return result


@router.get("/child/{child_id}")
def get_child_observations(
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

    observations = db.query(Observation).filter(Observation.child_id == child_id, Observation.deleted == False).all()
    total_observations = len(observations)
    average_rating = 0

    if total_observations > 0:
        average_rating = round(sum(obs.rating for obs in observations) / total_observations, 2)

    return {
        "average_rating": average_rating,
        "total_observations": total_observations,
        "observations": observations
    }


@router.get("/{observation_id}")
def get_observation(
    observation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    observation = db.query(Observation).filter(Observation.id == observation_id, Observation.deleted == False).first()
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
        
    child = db.query(Child).filter(Child.id == observation.child_id).first()

    if user.role == "parent" and (not child or child.parent_email != user.email):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if user.role == "teacher":
        assignment = db.query(TeacherStudentAssignment).filter(
            TeacherStudentAssignment.teacher_id == user.id,
            TeacherStudentAssignment.child_id == observation.child_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Not assigned to this student")

    return observation


@router.put("/{observation_id}")
def update_observation(
    observation_id: str,
    payload: ObservationUpdate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    observation = db.query(Observation).filter(Observation.id == observation_id, Observation.deleted == False).first()
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")

    if user.role == "parent":
        raise HTTPException(status_code=403, detail="Parents cannot update observations")
        
    if user.role == "teacher":
        # Check assignment
        assignment = db.query(TeacherStudentAssignment).filter(
            TeacherStudentAssignment.teacher_id == user.id,
            TeacherStudentAssignment.child_id == observation.child_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Not assigned to this student")
        # Ensure teachers can only update their own observations
        if str(observation.created_by) != str(user.id):
            raise HTTPException(status_code=403, detail="Can only update observations you created")

    observation.skill = payload.skill
    observation.rating = payload.rating
    observation.notes = payload.notes

    db.commit()
    db.refresh(observation)

    log_activity(
        db=db, user_id=str(user.id), role=user.role,
        action="Updated Observation", module="Observations", request=request
    )

    return observation


@router.delete("/{observation_id}")
def delete_observation(
    observation_id: str,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete observations")

    observation = db.query(Observation).filter(Observation.id == observation_id, Observation.deleted == False).first()
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")

    # Soft Delete
    observation.deleted = True
    observation.deleted_by = user.id
    observation.deleted_at = datetime.utcnow()
    db.commit()

    log_activity(
        db=db, user_id=str(user.id), role=user.role,
        action="Deleted Observation", module="Observations", request=request
    )

    return {"message": "Observation deleted"}