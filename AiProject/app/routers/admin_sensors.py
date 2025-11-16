from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_admin_user
import json

router = APIRouter(prefix="/admin/sensors", tags=["admin-sensors"])

@router.post("/", response_model=schemas.IoTSensor)
def create_iot_sensor(
    sensor: schemas.IoTSensorCreate,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new IoT sensor"""
    db_sensor = crud.create_iot_sensor(db, sensor)
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="CREATE_IOT_SENSOR",
        table_name="iot_sensors",
        record_id=db_sensor.id,
        new_value=json.dumps({"sensor_id": sensor.sensor_id, "type": sensor.sensor_type})
    )
    
    return db_sensor

@router.get("/", response_model=List[schemas.IoTSensor])
def get_all_sensors(
    skip: int = 0,
    limit: int = 100,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all IoT sensors"""
    return crud.get_all_sensors(db, skip, limit)

@router.get("/{sensor_id}", response_model=schemas.IoTSensor)
def get_sensor(
    sensor_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific sensor by ID"""
    sensor = crud.get_sensor_by_id(db, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.put("/{sensor_id}/status")
def update_sensor_status(
    sensor_id: int,
    status: str,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update sensor status (active, inactive, maintenance)"""
    sensor = crud.update_sensor_status(db, sensor_id, status)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="UPDATE_SENSOR_STATUS",
        table_name="iot_sensors",
        record_id=sensor_id,
        new_value=status
    )
    
    return {"message": f"Sensor status updated to {status}", "sensor": sensor}

@router.delete("/{sensor_id}")
def delete_sensor(
    sensor_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a sensor"""
    sensor = crud.get_sensor_by_id(db, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    db.delete(sensor)
    db.commit()
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="DELETE_SENSOR",
        table_name="iot_sensors",
        record_id=sensor_id
    )
    
    return {"message": "Sensor deleted successfully"}

@router.put("/{sensor_id}/calibrate")
def calibrate_sensor(
    sensor_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Calibrate a sensor"""
    sensor = crud.get_sensor_by_id(db, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    from datetime import datetime
    sensor.calibration_date = datetime.utcnow()
    db.commit()
    db.refresh(sensor)
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="CALIBRATE_SENSOR",
        table_name="iot_sensors",
        record_id=sensor_id
    )
    
    return {"message": "Sensor calibrated successfully", "sensor": sensor}