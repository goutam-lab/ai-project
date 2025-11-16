from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    company_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    user_type: str
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    batch_number: str
    manufacturing_date: datetime
    expiry_date: datetime
    location: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    current_temperature: Optional[float]
    current_humidity: Optional[float]
    status: str
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Sensor Data Schemas
class SensorDataBase(BaseModel):
    temperature: float
    humidity: float
    light_exposure: Optional[float] = None
    vibration: Optional[float] = None

class SensorDataCreate(SensorDataBase):
    product_id: int

class SensorData(SensorDataBase):
    id: int
    product_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    alert_type: str
    severity: str
    message: str

class AlertCreate(AlertBase):
    product_id: int

class Alert(AlertBase):
    id: int
    user_id: int
    product_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardData(BaseModel):
    total_products: int
    safe_products: int
    warning_products: int
    alert_products: int
    unread_alerts: int
    recent_alerts: List[Alert]
    recent_sensor_data: List[SensorData]

class ProductSummary(BaseModel):
    id: int
    name: str
    batch_number: str
    status: str
    current_temperature: Optional[float]
    current_humidity: Optional[float]
    location: Optional[str]
    expiry_date: datetime

# AI Model Schemas
class AIModelBase(BaseModel):
    model_name: str
    model_type: str
    version: str

class AIModelCreate(AIModelBase):
    pass

class AIModel(AIModelBase):
    id: int
    accuracy: Optional[float]
    status: str
    training_data_count: int
    last_trained: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Training Data Schemas
class TrainingDataBase(BaseModel):
    data_type: str
    label: str
    file_path: Optional[str] = None

class TrainingDataCreate(TrainingDataBase):
    model_id: int

class TrainingData(TrainingDataBase):
    id: int
    model_id: int
    is_validated: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# System Config Schemas
class SystemConfigBase(BaseModel):
    config_key: str
    config_value: str
    description: Optional[str] = None

class SystemConfigCreate(SystemConfigBase):
    pass

class SystemConfig(SystemConfigBase):
    id: int
    updated_by: Optional[int]
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# IoT Sensor Schemas
class IoTSensorBase(BaseModel):
    sensor_id: str
    sensor_type: str
    location: Optional[str] = None
    product_id: Optional[int] = None

class IoTSensorCreate(IoTSensorBase):
    pass

class IoTSensor(IoTSensorBase):
    id: int
    status: str
    last_reading: Optional[datetime]
    calibration_date: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLog(BaseModel):
    id: int
    user_id: int
    action: str
    table_name: Optional[str]
    record_id: Optional[int]
    timestamp: datetime
    
    class Config:
        from_attributes = True

# System Metrics Schema
class SystemMetrics(BaseModel):
    id: int
    metric_name: str
    metric_value: float
    unit: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Counterfeit Report Schemas
class CounterfeitReportBase(BaseModel):
    product_id: int
    confidence_score: float
    detection_method: str
    description: Optional[str] = None

class CounterfeitReportCreate(CounterfeitReportBase):
    image_path: Optional[str] = None

class CounterfeitReport(CounterfeitReportBase):
    id: int
    reporter_id: int
    status: str
    verified_by: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Admin Dashboard Schema
class AdminDashboardData(BaseModel):
    total_users: int
    total_products: int
    total_alerts: int
    active_sensors: int
    system_uptime: str
    ai_models_status: List[AIModel]
    recent_audit_logs: List[AuditLog]
    system_metrics: dict

# Kaggle Medicine Data Schemas
class KaggleMedicineDataBase(BaseModel):
    medicine_name: str
    batch_id: str
    manufacturing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    ph_level: Optional[float] = None
    moisture_content: Optional[float] = None
    impurity_percentage: Optional[float] = None
    active_ingredient_concentration: Optional[float] = None
    tablet_weight: Optional[float] = None
    tablet_thickness: Optional[float] = None
    hardness: Optional[float] = None
    friability: Optional[float] = None
    storage_temperature: Optional[float] = None
    storage_humidity: Optional[float] = None
    quality_status: Optional[str] = None
    manufacturer: Optional[str] = None
    country_of_origin: Optional[str] = None

class KaggleMedicineDataCreate(KaggleMedicineDataBase):
    pass

class KaggleMedicineData(KaggleMedicineDataBase):
    id: int
    product_id: Optional[int]
    imported_at: datetime
    
    class Config:
        from_attributes = True

class KaggleDataStatistics(BaseModel):
    total_records: int
    quality_distribution: dict
    average_ph: Optional[float]
    average_moisture: Optional[float]
    average_temperature: Optional[float]
    average_humidity: Optional[float]
    manufacturers_count: int
    countries_count: int