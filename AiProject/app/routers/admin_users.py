from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_admin_user
import json

router = APIRouter(prefix="/admin/users", tags=["admin-users"])

@router.get("/", response_model=List[schemas.User])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = crud.get_all_users_admin(db, skip, limit)
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="VIEW_ALL_USERS"
    )
    
    return users

@router.get("/{user_id}", response_model=schemas.User)
def get_user_by_id(
    user_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get specific user details"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/{user_id}/status")
def update_user_status(
    user_id: int,
    is_active: bool,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Activate or deactivate a user"""
    user = crud.update_user_status(db, user_id, is_active)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="UPDATE_USER_STATUS",
        table_name="users",
        record_id=user_id,
        new_value=f"Active: {is_active}"
    )
    
    return {"message": f"User {'activated' if is_active else 'deactivated'}", "user": user}

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="DELETE_USER",
        table_name="users",
        record_id=user_id
    )
    
    return {"message": "User deleted successfully"}

@router.get("/{user_id}/products", response_model=List[schemas.Product])
def get_user_products(
    user_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all products for a specific user"""
    products = crud.get_user_products(db, user_id)
    return products

@router.get("/{user_id}/alerts", response_model=List[schemas.Alert])
def get_user_alerts(
    user_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all alerts for a specific user"""
    alerts = crud.get_user_alerts(db, user_id)
    return alerts

@router.get("/{user_id}/audit-logs", response_model=List[schemas.AuditLog])
def get_user_audit_logs(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get audit logs for a specific user"""
    logs = crud.get_user_audit_logs(db, user_id, skip, limit)
    return logs