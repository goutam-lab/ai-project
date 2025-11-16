from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    user_type = Column(String(50), default="user")  # user, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="owner")
    alerts = relationship("Alert", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    batch_number = Column(String(100), nullable=False)
    manufacturing_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    current_temperature = Column(Float, nullable=True)
    current_humidity = Column(Float, nullable=True)
    status = Column(String(50), default="Safe & Verified")  # Safe & Verified, Warning, Alert
    location = Column(String(255), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="products")
    sensor_data = relationship("SensorData", back_populates="product")
    alerts = relationship("Alert", back_populates="product")

class SensorData(Base):
    __tablename__ = "sensor_data"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    light_exposure = Column(Float, nullable=True)
    vibration = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="sensor_data")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    alert_type = Column(String(50), nullable=False)  # temperature, humidity, expiry, counterfeit
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="alerts")
    product = relationship("Product", back_populates="alerts")

class QualityPrediction(Base):
    __tablename__ = "quality_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    predicted_quality_score = Column(Float, nullable=False)
    predicted_degradation_date = Column(DateTime, nullable=True)
    confidence_level = Column(Float, nullable=False)
    prediction_timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AIModel(Base):
    __tablename__ = "ai_models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)  # computer_vision, nlp, ml_prediction
    version = Column(String(20), nullable=False)
    accuracy = Column(Float, nullable=True)
    status = Column(String(20), default="active")  # active, training, inactive
    training_data_count = Column(Integer, default=0)
    last_trained = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class TrainingData(Base):
    __tablename__ = "training_data"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"))
    data_type = Column(String(50), nullable=False)  # image, text, sensor
    file_path = Column(String(500), nullable=True)
    label = Column(String(100), nullable=False)
    is_validated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SystemConfig(Base):
    __tablename__ = "system_config"
    
    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, nullable=False)
    config_value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class IoTSensor(Base):
    __tablename__ = "iot_sensors"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(100), unique=True, nullable=False)
    sensor_type = Column(String(50), nullable=False)  # temperature, humidity, light, vibration
    location = Column(String(255), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    status = Column(String(20), default="active")  # active, inactive, maintenance
    last_reading = Column(DateTime(timezone=True), nullable=True)
    calibration_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    table_name = Column(String(100), nullable=True)
    record_id = Column(Integer, nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class SystemMetrics(Base):
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class CounterfeitReport(Base):
    __tablename__ = "counterfeit_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    reporter_id = Column(Integer, ForeignKey("users.id"))
    confidence_score = Column(Float, nullable=False)
    detection_method = Column(String(50), nullable=False)  # computer_vision, nlp, manual
    image_path = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, verified, false_positive
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class KaggleMedicineData(Base):
    __tablename__ = "kaggle_medicine_data"
    
    id = Column(Integer, primary_key=True, index=True)
    medicine_name = Column(String(255), nullable=False)
    batch_id = Column(String(100), nullable=False)
    manufacturing_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    
    # Chemical Properties
    ph_level = Column(Float, nullable=True)
    moisture_content = Column(Float, nullable=True)
    impurity_percentage = Column(Float, nullable=True)
    active_ingredient_concentration = Column(Float, nullable=True)
    
    # Physical Properties
    tablet_weight = Column(Float, nullable=True)
    tablet_thickness = Column(Float, nullable=True)
    hardness = Column(Float, nullable=True)
    friability = Column(Float, nullable=True)
    
    # Storage Conditions
    storage_temperature = Column(Float, nullable=True)
    storage_humidity = Column(Float, nullable=True)
    
    # Quality Assessment
    quality_status = Column(String(50), nullable=True)
    inspection_date = Column(DateTime, nullable=True)
    inspector_notes = Column(Text, nullable=True)
    
    # Additional fields
    manufacturer = Column(String(255), nullable=True)
    country_of_origin = Column(String(100), nullable=True)
    
    # Linking
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    imported_at = Column(DateTime(timezone=True), server_default=func.now())