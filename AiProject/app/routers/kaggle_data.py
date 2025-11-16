from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user, get_admin_user

router = APIRouter(prefix="/kaggle-data", tags=["kaggle-data"])

@router.get("/", response_model=List[schemas.KaggleMedicineData])
def get_kaggle_dataset(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Kaggle medicine quality dataset"""
    return crud.get_kaggle_data(db, skip, limit)

@router.get("/search", response_model=List[schemas.KaggleMedicineData])
def search_kaggle_data(
    medicine_name: Optional[str] = None,
    batch_id: Optional[str] = None,
    quality_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search Kaggle data with filters"""
    return crud.search_kaggle_data(
        db, 
        medicine_name=medicine_name,
        batch_id=batch_id,
        quality_status=quality_status,
        skip=skip,
        limit=limit
    )

@router.get("/statistics", response_model=schemas.KaggleDataStatistics)
def get_statistics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistical analysis of Kaggle dataset"""
    return crud.get_kaggle_data_statistics(db)

@router.get("/quality-trends")
def get_quality_trends(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get quality trends by manufacturer and country"""
    return crud.get_quality_trends(db)

@router.get("/quality/{quality_status}", response_model=List[schemas.KaggleMedicineData])
def get_by_quality(
    quality_status: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get medicines by quality status (Good, Degraded, Counterfeit)"""
    return crud.get_medicines_by_quality(db, quality_status)

@router.get("/expired", response_model=List[schemas.KaggleMedicineData])
def get_expired_medicines(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get expired or soon-to-expire medicines"""
    return crud.get_expired_medicines(db)

@router.get("/{data_id}", response_model=schemas.KaggleMedicineData)
def get_kaggle_data_detail(
    data_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about specific Kaggle data entry"""
    data = crud.get_kaggle_data_by_id(db, data_id)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")
    return data

@router.post("/", response_model=schemas.KaggleMedicineData)
def create_kaggle_data(
    data: schemas.KaggleMedicineDataCreate,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create new Kaggle data entry (Admin only)"""
    db_data = models.KaggleMedicineData(**data.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="CREATE_KAGGLE_DATA",
        table_name="kaggle_medicine_data",
        record_id=db_data.id
    )
    
    return db_data

@router.delete("/{data_id}")
def delete_kaggle_data(
    data_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete Kaggle data entry (Admin only)"""
    data = crud.get_kaggle_data_by_id(db, data_id)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")
    
    db.delete(data)
    db.commit()
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="DELETE_KAGGLE_DATA",
        table_name="kaggle_medicine_data",
        record_id=data_id
    )
    
    return {"message": "Data deleted successfully"}

@router.get("/analytics/comparison")
def compare_with_live_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare Kaggle dataset with live sensor data"""
    
    # Get average values from Kaggle data
    kaggle_stats = crud.get_kaggle_data_statistics(db)
    
    # Get average values from live sensor data
    live_avg = db.query(
        func.avg(models.SensorData.temperature).label('avg_temp'),
        func.avg(models.SensorData.humidity).label('avg_humidity')
    ).first()
    
    return {
        "kaggle_dataset": {
            "avg_temperature": kaggle_stats.get("average_temperature"),
            "avg_humidity": kaggle_stats.get("average_humidity"),
            "avg_ph": kaggle_stats.get("average_ph"),
            "avg_moisture": kaggle_stats.get("average_moisture")
        },
        "live_sensors": {
            "avg_temperature": float(live_avg.avg_temp) if live_avg.avg_temp else None,
            "avg_humidity": float(live_avg.avg_humidity) if live_avg.avg_humidity else None
        },
        "comparison": {
            "temperature_variance": abs(
                (kaggle_stats.get("average_temperature") or 0) - 
                (float(live_avg.avg_temp) if live_avg.avg_temp else 0)
            ),
            "humidity_variance": abs(
                (kaggle_stats.get("average_humidity") or 0) - 
                (float(live_avg.avg_humidity) if live_avg.avg_humidity else 0)
            )
        }
    }

@router.get("/manufacturers/list")
def get_manufacturers(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all manufacturers in dataset"""
    manufacturers = db.query(
        models.KaggleMedicineData.manufacturer,
        func.count(models.KaggleMedicineData.id).label('product_count')
    ).group_by(
        models.KaggleMedicineData.manufacturer
    ).all()
    
    return [
        {"manufacturer": m, "product_count": c} 
        for m, c in manufacturers if m and m != 'Unknown'
    ]

@router.get("/countries/list")
def get_countries(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all countries in dataset"""
    countries = db.query(
        models.KaggleMedicineData.country_of_origin,
        func.count(models.KaggleMedicineData.id).label('product_count')
    ).group_by(
        models.KaggleMedicineData.country_of_origin
    ).all()
    
    return [
        {"country": c, "product_count": cnt} 
        for c, cnt in countries if c and c != 'Unknown'
    ]