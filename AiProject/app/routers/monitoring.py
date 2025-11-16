from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.post("/products", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_product(db=db, product=product, owner_id=current_user.id)

@router.get("/products", response_model=List[schemas.Product])
def get_user_products(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = crud.get_user_products(db, user_id=current_user.id, skip=skip, limit=limit)
    return products

@router.get("/products/{product_id}", response_model=schemas.Product)
def get_product(
    product_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = crud.get_product_by_id(db, product_id=product_id, user_id=current_user.id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/sensor-data", response_model=schemas.SensorData)
def create_sensor_data(
    sensor_data: schemas.SensorDataCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify that the product belongs to the current user
    product = crud.get_product_by_id(db, product_id=sensor_data.product_id, user_id=current_user.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Create sensor data
    db_sensor_data = crud.create_sensor_data(db=db, sensor_data=sensor_data)
    
    # Check for anomalies and create alerts if needed
    check_and_create_alerts(db, sensor_data, current_user.id)
    
    return db_sensor_data

@router.get("/products/{product_id}/sensor-data", response_model=List[schemas.SensorData])
def get_product_sensor_data(
    product_id: int,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify that the product belongs to the current user
    product = crud.get_product_by_id(db, product_id=product_id, user_id=current_user.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return crud.get_product_sensor_data(db, product_id=product_id, limit=limit)

def check_and_create_alerts(db: Session, sensor_data: schemas.SensorDataCreate, user_id: int):
    """Check sensor data for anomalies and create alerts"""
    
    # Temperature thresholds (you can make these configurable)
    TEMP_MIN = 2.0  # °C
    TEMP_MAX = 8.0  # °C
    HUMIDITY_MIN = 45.0  # %
    HUMIDITY_MAX = 75.0  # %
    
    # Check temperature
    if sensor_data.temperature < TEMP_MIN or sensor_data.temperature > TEMP_MAX:
        alert = schemas.AlertCreate(
            product_id=sensor_data.product_id,
            alert_type="temperature",
            severity="high" if sensor_data.temperature < 0 or sensor_data.temperature > 25 else "medium",
            message=f"Temperature anomaly detected: {sensor_data.temperature}°C (Safe range: {TEMP_MIN}-{TEMP_MAX}°C)"
        )
        crud.create_alert(db, alert, user_id)
        
        # Update product status
        new_status = "Alert" if alert.severity == "high" else "Warning"
        crud.update_product_status(db, sensor_data.product_id, new_status)
    
    # Check humidity
    if sensor_data.humidity < HUMIDITY_MIN or sensor_data.humidity > HUMIDITY_MAX:
        alert = schemas.AlertCreate(
            product_id=sensor_data.product_id,
            alert_type="humidity",
            severity="medium",
            message=f"Humidity anomaly detected: {sensor_data.humidity}% (Safe range: {HUMIDITY_MIN}-{HUMIDITY_MAX}%)"
        )
        crud.create_alert(db, alert, user_id)
        
        # Update product status if not already in alert state
        current_product = crud.get_product_by_id(db, sensor_data.product_id, user_id)
        if current_product and current_product.status != "Alert":
            crud.update_product_status(db, sensor_data.product_id, "Warning")