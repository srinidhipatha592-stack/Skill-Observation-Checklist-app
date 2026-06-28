from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db

from models.audit_log import AuditLog
from models.user import User

router = APIRouter(
    prefix="/api/activity-logs",
    tags=["Activity Logs"]
)

@router.get("/")
def get_activity_logs(
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog, User.name).outerjoin(User, AuditLog.user_id == User.id).order_by(AuditLog.timestamp.desc()).all()
    
    result = []
    for log, user_name in logs:
        result.append({
            "id": str(log.id),
            "action": log.action,
            "module": log.module,
            "user_name": user_name,
            "role": log.role,
            "created_at": log.timestamp.isoformat() if log.timestamp else None,
            "description": f"{log.action} in {log.module}",
        })
    return result
