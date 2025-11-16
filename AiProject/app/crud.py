from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from . import models, schemas
from .auth import get_password_hash
from datetime import datetime, timedelta

# User CRUD operations
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        company_name=user.company_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Product CRUD operations
def create_product(db: Session, product: schemas.ProductCreate, owner_id: int):
    db_product = models.Product(**product.dict(), owner_id=owner_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_user_products(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Product).filter(
        models.Product.owner_id == user_id
    ).offset(skip).limit(limit).all()

def get_product_by_id(db: Session, product_id: int, user_id: int):
    return db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.owner_id == user_id
    ).first()

def update_product_status(db: Session, product_id: int, status: str):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product:
        product.status = status
        db.commit()
        db.refresh(product)
    return product

# Sensor Data CRUD operations
def create_sensor_data(db: Session, sensor_data: schemas.SensorDataCreate):
    db_sensor_data = models.SensorData(**sensor_data.dict())
    db.add(db_sensor_data)
    
    # Update product current conditions
    product = db.query(models.Product).filter(
        models.Product.id == sensor_data.product_id
    ).first()
    if product:
        product.current_temperature = sensor_data.temperature
        product.current_humidity = sensor_data.humidity
    
    db.commit()
    db.refresh(db_sensor_data)
    return db_sensor_data

def get_product_sensor_data(db: Session, product_id: int, limit: int = 50):
    return db.query(models.SensorData).filter(
        models.SensorData.product_id == product_id
    ).order_by(desc(models.SensorData.timestamp)).limit(limit).all()

def get_recent_sensor_data(db: Session, user_id: int, hours: int = 24):
    time_threshold = datetime.utcnow() - timedelta(hours=hours)
    return db.query(models.SensorData).join(models.Product).filter(
        models.Product.owner_id == user_id,
        models.SensorData.timestamp >= time_threshold
    ).order_by(desc(models.SensorData.timestamp)).limit(20).all()

# Alert CRUD operations
def create_alert(db: Session, alert: schemas.AlertCreate, user_id: int):
    db_alert = models.Alert(**alert.dict(), user_id=user_id)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_user_alerts(db: Session, user_id: int, unread_only: bool = False, limit: int = 50):
    query = db.query(models.Alert).filter(models.Alert.user_id == user_id)
    if unread_only:
        query = query.filter(models.Alert.is_read == False)
    return query.order_by(desc(models.Alert.created_at)).limit(limit).all()

def mark_alert_as_read(db: Session, alert_id: int, user_id: int):
    alert = db.query(models.Alert).filter(
        models.Alert.id == alert_id,
        models.Alert.user_id == user_id
    ).first()
    if alert:
        alert.is_read = True
        db.commit()
        db.refresh(alert)
    return alert

def get_unread_alerts_count(db: Session, user_id: int):
    return db.query(models.Alert).filter(
        models.Alert.user_id == user_id,
        models.Alert.is_read == False
    ).count()

# Dashboard data aggregation
def get_dashboard_data(db: Session, user_id: int):
    # Get product statistics
    total_products = db.query(models.Product).filter(
        models.Product.owner_id == user_id
    ).count()
    
    safe_products = db.query(models.Product).filter(
        models.Product.owner_id == user_id,
        models.Product.status == "Safe & Verified"
    ).count()
    
    warning_products = db.query(models.Product).filter(
        models.Product.owner_id == user_id,
        models.Product.status == "Warning"
    ).count()
    
    alert_products = db.query(models.Product).filter(
        models.Product.owner_id == user_id,
        models.Product.status == "Alert"
    ).count()
    
    # Get unread alerts count
    unread_alerts = get_unread_alerts_count(db, user_id)
    
    # Get recent alerts
    recent_alerts = get_user_alerts(db, user_id, limit=5)
    
    # Get recent sensor data
    recent_sensor_data = get_recent_sensor_data(db, user_id, hours=6)
    
    return {
        "total_products": total_products,
        "safe_products": safe_products,
        "warning_products": warning_products,
        "alert_products": alert_products,
        "unread_alerts": unread_alerts,
        "recent_alerts": recent_alerts,
        "recent_sensor_data": recent_sensor_data
    }

# AI Model CRUD Operations
def create_ai_model(db: Session, model: schemas.AIModelCreate):
    db_model = models.AIModel(**model.dict())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def get_all_ai_models(db: Session):
    return db.query(models.AIModel).all()

def get_ai_model_by_id(db: Session, model_id: int):
    return db.query(models.AIModel).filter(models.AIModel.id == model_id).first()

def update_ai_model(db: Session, model_id: int, accuracy: float = None, status: str = None):
    model = db.query(models.AIModel).filter(models.AIModel.id == model_id).first()
    if model:
        if accuracy is not None:
            model.accuracy = accuracy
        if status is not None:
            model.status = status
        model.last_trained = datetime.utcnow()
        db.commit()
        db.refresh(model)
    return model

# Training Data CRUD Operations
def create_training_data(db: Session, training_data: schemas.TrainingDataCreate):
    db_data = models.TrainingData(**training_data.dict())
    db.add(db_data)
    
    # Update model training data count
    model = db.query(models.AIModel).filter(models.AIModel.id == training_data.model_id).first()
    if model:
        model.training_data_count += 1
    
    db.commit()
    db.refresh(db_data)
    return db_data

def get_training_data_by_model(db: Session, model_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.TrainingData).filter(
        models.TrainingData.model_id == model_id
    ).offset(skip).limit(limit).all()

def validate_training_data(db: Session, data_id: int):
    data = db.query(models.TrainingData).filter(models.TrainingData.id == data_id).first()
    if data:
        data.is_validated = True
        db.commit()
        db.refresh(data)
    return data

# System Config CRUD Operations
def create_or_update_config(db: Session, config: schemas.SystemConfigCreate, user_id: int):
    existing_config = db.query(models.SystemConfig).filter(
        models.SystemConfig.config_key == config.config_key
    ).first()
    
    if existing_config:
        existing_config.config_value = config.config_value
        existing_config.description = config.description
        existing_config.updated_by = user_id
        db.commit()
        db.refresh(existing_config)
        return existing_config
    else:
        db_config = models.SystemConfig(**config.dict(), updated_by=user_id)
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        return db_config

def get_all_configs(db: Session):
    return db.query(models.SystemConfig).all()

def get_config_by_key(db: Session, config_key: str):
    return db.query(models.SystemConfig).filter(
        models.SystemConfig.config_key == config_key
    ).first()

# IoT Sensor CRUD Operations
def create_iot_sensor(db: Session, sensor: schemas.IoTSensorCreate):
    db_sensor = models.IoTSensor(**sensor.dict())
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

def get_all_sensors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.IoTSensor).offset(skip).limit(limit).all()

def get_sensor_by_id(db: Session, sensor_id: int):
    return db.query(models.IoTSensor).filter(models.IoTSensor.id == sensor_id).first()

def update_sensor_status(db: Session, sensor_id: int, status: str):
    sensor = db.query(models.IoTSensor).filter(models.IoTSensor.id == sensor_id).first()
    if sensor:
        sensor.status = status
        db.commit()
        db.refresh(sensor)
    return sensor

def get_active_sensors_count(db: Session):
    return db.query(models.IoTSensor).filter(models.IoTSensor.status == "active").count()

# Audit Log CRUD Operations
def create_audit_log(db: Session, user_id: int, action: str, table_name: str = None, 
                     record_id: int = None, old_value: str = None, new_value: str = None):
    audit_log = models.AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_value=old_value,
        new_value=new_value
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log

def get_audit_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AuditLog).order_by(
        desc(models.AuditLog.timestamp)
    ).offset(skip).limit(limit).all()

def get_user_audit_logs(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    return db.query(models.AuditLog).filter(
        models.AuditLog.user_id == user_id
    ).order_by(desc(models.AuditLog.timestamp)).offset(skip).limit(limit).all()

# System Metrics CRUD Operations
def create_system_metric(db: Session, metric_name: str, metric_value: float, unit: str = None):
    metric = models.SystemMetrics(
        metric_name=metric_name,
        metric_value=metric_value,
        unit=unit
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric

def get_system_metrics(db: Session, metric_name: str = None, hours: int = 24):
    time_threshold = datetime.utcnow() - timedelta(hours=hours)
    query = db.query(models.SystemMetrics).filter(
        models.SystemMetrics.timestamp >= time_threshold
    )
    
    if metric_name:
        query = query.filter(models.SystemMetrics.metric_name == metric_name)
    
    return query.order_by(desc(models.SystemMetrics.timestamp)).all()

# Counterfeit Report CRUD Operations
def create_counterfeit_report(db: Session, report: schemas.CounterfeitReportCreate, reporter_id: int):
    db_report = models.CounterfeitReport(**report.dict(), reporter_id=reporter_id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_all_counterfeit_reports(db: Session, status: str = None, skip: int = 0, limit: int = 100):
    query = db.query(models.CounterfeitReport)
    
    if status:
        query = query.filter(models.CounterfeitReport.status == status)
    
    return query.order_by(desc(models.CounterfeitReport.created_at)).offset(skip).limit(limit).all()

def verify_counterfeit_report(db: Session, report_id: int, admin_id: int, status: str):
    report = db.query(models.CounterfeitReport).filter(
        models.CounterfeitReport.id == report_id
    ).first()
    
    if report:
        report.status = status
        report.verified_by = admin_id
        db.commit()
        db.refresh(report)
    
    return report

# Admin Dashboard Data
def get_admin_dashboard_data(db: Session):
    # Get counts
    total_users = db.query(models.User).count()
    total_products = db.query(models.Product).count()
    total_alerts = db.query(models.Alert).count()
    active_sensors = get_active_sensors_count(db)
    
    # Get AI models status
    ai_models = get_all_ai_models(db)
    
    # Get recent audit logs
    recent_audit_logs = get_audit_logs(db, limit=10)
    
    # Get system metrics summary
    cpu_metrics = get_system_metrics(db, "cpu_usage", hours=1)
    memory_metrics = get_system_metrics(db, "memory_usage", hours=1)
    
    avg_cpu = sum([m.metric_value for m in cpu_metrics]) / len(cpu_metrics) if cpu_metrics else 0
    avg_memory = sum([m.metric_value for m in memory_metrics]) / len(memory_metrics) if memory_metrics else 0
    
    system_metrics = {
        "avg_cpu_usage": round(avg_cpu, 2),
        "avg_memory_usage": round(avg_memory, 2),
        "total_api_calls": len(recent_audit_logs)
    }
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_alerts": total_alerts,
        "active_sensors": active_sensors,
        "system_uptime": "99.9%",  # This should be calculated from actual uptime data
        "ai_models_status": ai_models,
        "recent_audit_logs": recent_audit_logs,
        "system_metrics": system_metrics
    }

def get_all_users_admin(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user_status(db: Session, user_id: int, is_active: bool):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.is_active = is_active
        db.commit()
        db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

# Kaggle Data CRUD Operations
def get_kaggle_data(db: Session, skip: int = 0, limit: int = 100):
    """Get all Kaggle medicine data"""
    return db.query(models.KaggleMedicineData).offset(skip).limit(limit).all()

def get_kaggle_data_by_id(db: Session, data_id: int):
    """Get specific Kaggle data by ID"""
    return db.query(models.KaggleMedicineData).filter(
        models.KaggleMedicineData.id == data_id
    ).first()

def search_kaggle_data(db: Session, medicine_name: str = None, batch_id: str = None, 
                       quality_status: str = None, skip: int = 0, limit: int = 100):
    """Search Kaggle data with filters"""
    query = db.query(models.KaggleMedicineData)
    
    if medicine_name:
        query = query.filter(models.KaggleMedicineData.medicine_name.like(f"%{medicine_name}%"))
    
    if batch_id:
        query = query.filter(models.KaggleMedicineData.batch_id == batch_id)
    
    if quality_status:
        query = query.filter(models.KaggleMedicineData.quality_status == quality_status)
    
    return query.offset(skip).limit(limit).all()

def get_kaggle_data_statistics(db: Session):
    """Get statistics from Kaggle dataset"""
    
    total_records = db.query(models.KaggleMedicineData).count()
    
    # Quality distribution
    quality_dist = db.query(
        models.KaggleMedicineData.quality_status,
        func.count(models.KaggleMedicineData.id)
    ).group_by(models.KaggleMedicineData.quality_status).all()
    
    quality_distribution = {status: count for status, count in quality_dist}
    
    # Average values
    avg_stats = db.query(
        func.avg(models.KaggleMedicineData.ph_level).label('avg_ph'),
        func.avg(models.KaggleMedicineData.moisture_content).label('avg_moisture'),
        func.avg(models.KaggleMedicineData.storage_temperature).label('avg_temp'),
        func.avg(models.KaggleMedicineData.storage_humidity).label('avg_humidity')
    ).first()
    
    # Count unique manufacturers and countries
    manufacturers_count = db.query(
        func.count(func.distinct(models.KaggleMedicineData.manufacturer))
    ).scalar()
    
    countries_count = db.query(
        func.count(func.distinct(models.KaggleMedicineData.country_of_origin))
    ).scalar()
    
    return {
        "total_records": total_records,
        "quality_distribution": quality_distribution,
        "average_ph": float(avg_stats.avg_ph) if avg_stats.avg_ph else None,
        "average_moisture": float(avg_stats.avg_moisture) if avg_stats.avg_moisture else None,
        "average_temperature": float(avg_stats.avg_temp) if avg_stats.avg_temp else None,
        "average_humidity": float(avg_stats.avg_humidity) if avg_stats.avg_humidity else None,
        "manufacturers_count": manufacturers_count,
        "countries_count": countries_count
    }

def get_quality_trends(db: Session):
    """Get quality trends by manufacturer or country"""
    
    # Quality by manufacturer
    quality_by_mfr = db.query(
        models.KaggleMedicineData.manufacturer,
        models.KaggleMedicineData.quality_status,
        func.count(models.KaggleMedicineData.id).label('count')
    ).group_by(
        models.KaggleMedicineData.manufacturer,
        models.KaggleMedicineData.quality_status
    ).all()
    
    # Quality by country
    quality_by_country = db.query(
        models.KaggleMedicineData.country_of_origin,
        models.KaggleMedicineData.quality_status,
        func.count(models.KaggleMedicineData.id).label('count')
    ).group_by(
        models.KaggleMedicineData.country_of_origin,
        models.KaggleMedicineData.quality_status
    ).all()
    
    return {
        "by_manufacturer": [
            {"manufacturer": m, "quality": q, "count": c} 
            for m, q, c in quality_by_mfr
        ],
        "by_country": [
            {"country": c, "quality": q, "count": cnt} 
            for c, q, cnt in quality_by_country
        ]
    }

def get_medicines_by_quality(db: Session, quality_status: str):
    """Get all medicines with specific quality status"""
    return db.query(models.KaggleMedicineData).filter(
        models.KaggleMedicineData.quality_status == quality_status
    ).all()

def get_expired_medicines(db: Session):
    """Get medicines that are expired or close to expiry"""
    from datetime import datetime, timedelta
    
    today = datetime.now().date()
    warning_date = today + timedelta(days=30)  # 30 days before expiry
    
    return db.query(models.KaggleMedicineData).filter(
        models.KaggleMedicineData.expiry_date.isnot(None),
        models.KaggleMedicineData.expiry_date <= warning_date
    ).all()