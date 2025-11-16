from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/", response_model=schemas.DashboardData)
def get_dashboard_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dashboard_data = crud.get_dashboard_data(db, user_id=current_user.id)
    return dashboard_data

@router.get("/products/summary", response_model=List[schemas.ProductSummary])
def get_products_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = crud.get_user_products(db, user_id=current_user.id, limit=100)
    
    product_summaries = []
    for product in products:
        summary = schemas.ProductSummary(
            id=product.id,
            name=product.name,
            batch_number=product.batch_number,
            status=product.status,
            current_temperature=product.current_temperature,
            current_humidity=product.current_humidity,
            location=product.location,
            expiry_date=product.expiry_date
        )
        product_summaries.append(summary)
    
    return product_summaries

@router.get("/analytics/temperature")
def get_temperature_analytics(
    product_id: int = None,
    hours: int = 24,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get temperature analytics for dashboard charts"""
    
    if product_id:
        # Verify product ownership
        product = crud.get_product_by_id(db, product_id=product_id, user_id=current_user.id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        sensor_data = crud.get_product_sensor_data(db, product_id=product_id, limit=50)
    else:
        # Get recent sensor data for all user products
        sensor_data = crud.get_recent_sensor_data(db, user_id=current_user.id, hours=hours)
    
    # Process data for charts
    temperature_data = []
    for data in reversed(sensor_data[-20:]):  # Last 20 readings
        temperature_data.append({
            "timestamp": data.timestamp.isoformat(),
            "temperature": data.temperature,
            "humidity": data.humidity,
            "product_id": data.product_id
        })
    
    return {"temperature_data": temperature_data}

@router.get("/analytics/alerts")
def get_alerts_analytics(
    days: int = 7,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get alerts analytics for dashboard"""
    
    # Get alerts from last N days
    time_threshold = datetime.utcnow() - timedelta(days=days)
    
    alerts = db.query(models.Alert).filter(
        models.Alert.user_id == current_user.id,
        models.Alert.created_at >= time_threshold
    ).all()
    
    # Group by alert type and severity
    alert_types = {}
    severity_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    
    for alert in alerts:
        # Count by type
        if alert.alert_type not in alert_types:
            alert_types[alert.alert_type] = 0
        alert_types[alert.alert_type] += 1
        
        # Count by severity
        severity_counts[alert.severity] += 1
    
    return {
        "total_alerts": len(alerts),
        "alert_types": alert_types,
        "severity_distribution": severity_counts,
        "period_days": days
    }