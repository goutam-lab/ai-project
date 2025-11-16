from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_admin_user

router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])

@router.get("/", response_model=schemas.AdminDashboardData)
def get_admin_dashboard(
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive admin dashboard data"""
    dashboard_data = crud.get_admin_dashboard_data(db)
    
    # Log admin access
    crud.create_audit_log(
        db, 
        user_id=admin_user.id, 
        action="VIEW_ADMIN_DASHBOARD"
    )
    
    return dashboard_data

@router.get("/stats")
def get_system_stats(
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed system statistics"""
    
    # User statistics
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    
    # Product statistics
    total_products = db.query(models.Product).count()
    safe_products = db.query(models.Product).filter(models.Product.status == "Safe & Verified").count()
    warning_products = db.query(models.Product).filter(models.Product.status == "Warning").count()
    alert_products = db.query(models.Product).filter(models.Product.status == "Alert").count()
    
    # Alert statistics
    total_alerts = db.query(models.Alert).count()
    unread_alerts = db.query(models.Alert).filter(models.Alert.is_read == False).count()
    critical_alerts = db.query(models.Alert).filter(models.Alert.severity == "critical").count()
    
    # Sensor statistics
    total_sensors = db.query(models.IoTSensor).count()
    active_sensors = crud.get_active_sensors_count(db)
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users
        },
        "products": {
            "total": total_products,
            "safe": safe_products,
            "warning": warning_products,
            "alert": alert_products
        },
        "alerts": {
            "total": total_alerts,
            "unread": unread_alerts,
            "critical": critical_alerts
        },
        "sensors": {
            "total": total_sensors,
            "active": active_sensors,
            "inactive": total_sensors - active_sensors
        }
    }