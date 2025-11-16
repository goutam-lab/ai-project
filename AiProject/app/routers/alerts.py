from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[schemas.Alert])
def get_user_alerts(
    unread_only: bool = False,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = crud.get_user_alerts(db, user_id=current_user.id, unread_only=unread_only, limit=limit)
    return alerts

@router.get("/count")
def get_unread_alerts_count(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = crud.get_unread_alerts_count(db, user_id=current_user.id)
    return {"unread_count": count}

@router.put("/{alert_id}/mark-read", response_model=schemas.Alert)
def mark_alert_as_read(
    alert_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = crud.mark_alert_as_read(db, alert_id=alert_id, user_id=current_user.id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.post("/", response_model=schemas.Alert)
def create_alert(
    alert: schemas.AlertCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify that the product belongs to the current user
    product = crud.get_product_by_id(db, product_id=alert.product_id, user_id=current_user.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return crud.create_alert(db=db, alert=alert, user_id=current_user.id)