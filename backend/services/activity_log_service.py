from sqlalchemy.orm import Session
from fastapi import Request
from models.audit_log import AuditLog

def log_activity(
    db: Session,
    user_id: str,
    role: str,
    action: str,
    module: str,
    request: Request = None
):
    ip_address = None
    device = None
    if request:
        ip_address = request.client.host if request.client else None
        device = request.headers.get("user-agent")

    activity = AuditLog(
        user_id=user_id,
        role=role,
        action=action,
        module=module,
        ip_address=ip_address,
        device=device
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity