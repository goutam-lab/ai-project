from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_admin_user
import json
from datetime import datetime

router = APIRouter(prefix="/admin/system", tags=["admin-system"])

@router.post("/config", response_model=schemas.SystemConfig)
def create_or_update_config(
    config: schemas.SystemConfigCreate,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create or update system configuration"""
    db_config = crud.create_or_update_config(db, config, admin_user.id)
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="UPDATE_SYSTEM_CONFIG",
        table_name="system_config",
        record_id=db_config.id,
        new_value=json.dumps({"key": config.config_key, "value": config.config_value})
    )
    
    return db_config

@router.get("/config", response_model=List[schemas.SystemConfig])
def get_all_configs(
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all system configurations"""
    return crud.get_all_configs(db)

@router.get("/config/{config_key}", response_model=schemas.SystemConfig)
def get_config(
    config_key: str,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific configuration by key"""
    config = crud.get_config_by_key(db, config_key)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@router.post("/metrics")
def create_system_metric(
    metric_name: str,
    metric_value: float,
    unit: str = None,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a system metric entry"""
    metric = crud.create_system_metric(db, metric_name, metric_value, unit)
    return {"message": "Metric created successfully", "metric": metric}

@router.get("/metrics", response_model=List[schemas.SystemMetrics])
def get_system_metrics(
    metric_name: str = None,
    hours: int = 24,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get system metrics"""
    return crud.get_system_metrics(db, metric_name, hours)

@router.get("/audit-logs", response_model=List[schemas.AuditLog])
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all audit logs"""
    return crud.get_audit_logs(db, skip, limit)

@router.get("/health")
def system_health_check(
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Check system health status"""
    
    # Check database connection
    try:
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Get system statistics
    active_sensors = crud.get_active_sensors_count(db)
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    
    # Get AI model status
    ai_models = crud.get_all_ai_models(db)
    active_models = len([m for m in ai_models if m.status == "active"])
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "active_sensors": active_sensors,
        "users": {
            "total": total_users,
            "active": active_users
        },
        "ai_models": {
            "total": len(ai_models),
            "active": active_models
        }
    }

@router.post("/backup")
def trigger_backup(
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Trigger system backup (placeholder)"""
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="TRIGGER_BACKUP"
    )
    
    # In production, this would trigger actual backup process
    return {
        "message": "Backup initiated",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "in_progress"
    }