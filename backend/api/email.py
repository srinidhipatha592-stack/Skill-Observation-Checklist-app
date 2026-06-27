from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import base64

from core.database import get_db
from models.user import User
from models.child import Child
from services.email_service import send_email

router = APIRouter(
    prefix="/api/email",
    tags=["Email"]
)


class EmailRequest(BaseModel):
    parent_id: str
    child_id: str
    recipient_email: str
    pdf_attachment: str  # Base64 string of the PDF
    report_type: str = "monthly"


@router.post("/send-report")
def send_report(
    payload: EmailRequest,
    db: Session = Depends(get_db)
):
    # Validate Parent
    parent = db.query(User).filter(User.id == payload.parent_id, User.role == "parent").first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found.")

    # Validate Child
    child = db.query(Child).filter(Child.id == payload.child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found.")

    # Validate Relationship
    if child.parent_email != parent.email:
        raise HTTPException(status_code=400, detail="The selected child does not belong to the selected parent.")

    # Decode PDF
    try:
        # Strip out the data URL prefix if present
        b64_data = payload.pdf_attachment
        if "," in b64_data:
            b64_data = b64_data.split(",")[1]
            
        pdf_bytes = base64.b64decode(b64_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid PDF attachment format.")

    filename = f"Skill_Observation_Report_{child.name.replace(' ', '_')}.pdf"

    # Send Email
    success = send_email(
        email=payload.recipient_email,
        subject=f"Skill Observation Report - {child.name}",
        message=f"Dear Parent,\n\nPlease find attached the latest {payload.report_type} Skill Observation Checklist Report for your child, {child.name}.\n\nThe report contains:\n- Progress Summary\n- Observation History\n- Recommendations\n\nRegards,\nSchool Administration",
        attachment=pdf_bytes,
        filename=filename
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send the email report.")

    return {
        "message": f"Report sent successfully to {payload.recipient_email}"
    }
