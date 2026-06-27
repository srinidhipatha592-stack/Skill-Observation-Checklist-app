from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi.responses import Response

from sqlalchemy.orm import Session

from core.database import get_db

from models.child import Child
from models.observation import Observation

from services.recommendation_service import (
    generate_recommendation
)

from services.report_service import (
    generate_child_report
)

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.get("/summary")
def reports_summary(
    db: Session = Depends(get_db)
):

    observations = db.query(
        Observation
    ).all()

    total_observations = len(
        observations
    )

    average_rating = 0

    if total_observations > 0:

        average_rating = round(
            sum(
                float(obs.rating)
                for obs in observations
            ) / total_observations,
            2
        )

    skill_scores = {}

    for obs in observations:

        if obs.skill not in skill_scores:

            skill_scores[obs.skill] = []

        skill_scores[obs.skill].append(
            obs.rating
        )

    highest_skill = None
    lowest_skill = None

    if skill_scores:

        skill_averages = {

            skill: sum(scores) / len(scores)

            for skill, scores
            in skill_scores.items()

        }

        highest_skill = max(
            skill_averages,
            key=lambda k: skill_averages[k]
        )

        lowest_skill = min(
            skill_averages,
            key=lambda k: skill_averages[k]
        )

    recent_observations = [

        {
            "skill": obs.skill,
            "rating": obs.rating,
            "notes": obs.notes
        }

        for obs in observations[-5:]

    ]

    return {

        "total_observations":
        total_observations,

        "average_rating":
        average_rating,

        "highest_skill":
        highest_skill,

        "lowest_skill":
        lowest_skill,

        "recent_observations":
        recent_observations

    }


@router.post("/generate/")
def generate_and_send_report(
    payload: dict,
    db: Session = Depends(get_db)
):
    child_id = payload.get("child_id")
    parent_email = payload.get("parent_email")

    if not child_id or not parent_email:
        raise HTTPException(status_code=400, detail="Missing child_id or parent_email")

    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    observations = db.query(Observation).filter(Observation.child_id == child_id).all()
    recommendation = generate_recommendation(observations)
    
    pdf = generate_child_report(child, observations, recommendation)

    # Use a basic mock email sender for now since this is just a demo.
    from services.email_service import send_email
    send_email(
        email=parent_email,
        subject=f"Skill Observation Report - {child.name}",
        message=f"Dear Parent,\n\nPlease find attached the Skill Observation Checklist Report for {child.name}.\n\nRegards,\nSchool Administration",
        attachment=pdf,
        filename=f"{child.name}_report.pdf"
    )

    return {"message": "Report generated and sent successfully."}

@router.get("/{child_id}")
def generate_report(
    child_id: str,
    db: Session = Depends(get_db)
):

    child = db.query(
        Child
    ).filter(
        Child.id == child_id
    ).first()

    if not child:

        raise HTTPException(
            status_code=404,
            detail="Child not found"
        )

    observations = db.query(
        Observation
    ).filter(
        Observation.child_id == child_id
    ).all()

    recommendation = (
        generate_recommendation(
            observations
        )
    )

    pdf = generate_child_report(
        child,
        observations,
        recommendation
    )

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            f"attachment; filename={child.name}.pdf"
        }
    )
