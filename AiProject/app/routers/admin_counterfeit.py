from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_admin_user
import json

router = APIRouter(prefix="/admin/counterfeit", tags=["admin-counterfeit"])

@router.post("/reports", response_model=schemas.CounterfeitReport)
def create_counterfeit_report(
    report: schemas.CounterfeitReportCreate,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a counterfeit report"""
    db_report = crud.create_counterfeit_report(db, report, admin_user.id)
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="CREATE_COUNTERFEIT_REPORT",
        table_name="counterfeit_reports",
        record_id=db_report.id
    )
    
    return db_report

@router.get("/reports", response_model=List[schemas.CounterfeitReport])
def get_counterfeit_reports(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all counterfeit reports"""
    return crud.get_all_counterfeit_reports(db, status, skip, limit)

@router.put("/reports/{report_id}/verify")
def verify_counterfeit_report(
    report_id: int,
    verification_status: str,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Verify a counterfeit report (verified, false_positive)"""
    
    if verification_status not in ["verified", "false_positive"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be 'verified' or 'false_positive'"
        )
    
    report = crud.verify_counterfeit_report(db, report_id, admin_user.id, verification_status)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="VERIFY_COUNTERFEIT_REPORT",
        table_name="counterfeit_reports",
        record_id=report_id,
        new_value=verification_status
    )
    
    # If verified, create alert for the product owner
    if verification_status == "verified":
        product = db.query(models.Product).filter(models.Product.id == report.product_id).first()
        if product:
            alert = schemas.AlertCreate(
                product_id=product.id,
                alert_type="counterfeit",
                severity="critical",
                message=f"COUNTERFEIT DETECTED: Product {product.name} (Batch: {product.batch_number}) has been verified as counterfeit with {report.confidence_score}% confidence."
            )
            crud.create_alert(db, alert, product.owner_id)
            
            # Update product status
            crud.update_product_status(db, product.id, "Alert")
    
    return {"message": f"Report {verification_status}", "report": report}

@router.get("/reports/statistics")
def get_counterfeit_statistics(
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get counterfeit detection statistics"""
    
    total_reports = db.query(models.CounterfeitReport).count()
    verified_reports = db.query(models.CounterfeitReport).filter(
        models.CounterfeitReport.status == "verified"
    ).count()
    pending_reports = db.query(models.CounterfeitReport).filter(
        models.CounterfeitReport.status == "pending"
    ).count()
    false_positives = db.query(models.CounterfeitReport).filter(
        models.CounterfeitReport.status == "false_positive"
    ).count()
    
    # Detection method breakdown
    cv_detections = db.query(models.CounterfeitReport).filter(
        models.CounterfeitReport.detection_method == "computer_vision"
    ).count()
    nlp_detections = db.query(models.CounterfeitReport).filter(
        models.CounterfeitReport.detection_method == "nlp"
    ).count()
    manual_reports = db.query(models.CounterfeitReport).filter(
        models.CounterfeitReport.detection_method == "manual"
    ).count()
    
    return {
        "total_reports": total_reports,
        "verified": verified_reports,
        "pending": pending_reports,
        "false_positives": false_positives,
        "detection_methods": {
            "computer_vision": cv_detections,
            "nlp": nlp_detections,
            "manual": manual_reports
        },
        "accuracy_rate": round((verified_reports / total_reports * 100), 2) if total_reports > 0 else 0
    }