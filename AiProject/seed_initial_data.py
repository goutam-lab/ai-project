from app.database import SessionLocal
from app import models
from app.auth import get_password_hash
from datetime import datetime, timedelta


def seed_data():
    db = SessionLocal()
    
    try:
        print("Seeding initial data...")
        
        # 1. Create demo users
        print("\n1. Creating demo users...")
        demo_user = models.User(
            email="user@pharma.com",
            username="pharma_user",
            hashed_password=get_password_hash("User@123"),
            company_name="PharmaCorp Inc.",
            user_type="user",
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"   ✓ Created user: {demo_user.username}")
        
        # 2. Create AI Models
        print("\n2. Creating AI Models...")
        
        cv_model = models.AIModel(
            model_name="Counterfeit Detection CV",
            model_type="computer_vision",
            version="1.0.0",
            accuracy=95.5,
            status="active",
            training_data_count=1000,
            last_trained=datetime.utcnow()
        )
        
        nlp_model = models.AIModel(
            model_name="Label Verification NLP",
            model_type="nlp",
            version="1.0.0",
            accuracy=92.3,
            status="active",
            training_data_count=800,
            last_trained=datetime.utcnow()
        )
        
        ml_model = models.AIModel(
            model_name="Quality Degradation Predictor",
            model_type="ml_prediction",
            version="1.0.0",
            accuracy=88.7,
            status="active",
            training_data_count=1500,
            last_trained=datetime.utcnow()
        )
        
        db.add_all([cv_model, nlp_model, ml_model])
        db.commit()
        print(f"   ✓ Created 3 AI models")
        
        # 3. Create System Configurations
        print("\n3. Creating system configurations...")
        
        configs = [
            models.SystemConfig(
                config_key="temperature_threshold_min",
                config_value="2.0",
                description="Minimum safe temperature in Celsius"
            ),
            models.SystemConfig(
                config_key="temperature_threshold_max",
                config_value="8.0",
                description="Maximum safe temperature in Celsius"
            ),
            models.SystemConfig(
                config_key="humidity_threshold_min",
                config_value="45.0",
                description="Minimum safe humidity percentage"
            ),
            models.SystemConfig(
                config_key="humidity_threshold_max",
                config_value="75.0",
                description="Maximum safe humidity percentage"
            ),
            models.SystemConfig(
                config_key="alert_email_enabled",
                config_value="true",
                description="Enable email alerts"
            ),
            models.SystemConfig(
                config_key="alert_sms_enabled",
                config_value="true",
                description="Enable SMS alerts"
            )
        ]
        
        db.add_all(configs)
        db.commit()
        print(f"   ✓ Created {len(configs)} system configurations")
        
        # 4. Create IoT Sensors
        print("\n4. Creating IoT sensors...")
        
        sensors = [
            models.IoTSensor(
                sensor_id="TEMP_001",
                sensor_type="temperature",
                location="Warehouse A - Section 1",
                status="active",
                calibration_date=datetime.utcnow()
            ),
            models.IoTSensor(
                sensor_id="HUMID_001",
                sensor_type="humidity",
                location="Warehouse A - Section 1",
                status="active",
                calibration_date=datetime.utcnow()
            ),
            models.IoTSensor(
                sensor_id="TEMP_002",
                sensor_type="temperature",
                location="Warehouse B - Cold Storage",
                status="active",
                calibration_date=datetime.utcnow()
            ),
            models.IoTSensor(
                sensor_id="LIGHT_001",
                sensor_type="light",
                location="Warehouse A - Section 2",
                status="active",
                calibration_date=datetime.utcnow()
            )
        ]
        
        db.add_all(sensors)
        db.commit()
        print(f"   ✓ Created {len(sensors)} IoT sensors")
        
        # 5. Create demo products
        print("\n5. Creating demo products...")
        
        products = [
            models.Product(
                name="Aspirin 500mg",
                batch_number="ASP2024001",
                manufacturing_date=datetime.utcnow() - timedelta(days=30),
                expiry_date=datetime.utcnow() + timedelta(days=700),
                current_temperature=5.2,
                current_humidity=60.5,
                status="Safe & Verified",
                location="Warehouse A - Section 1",
                owner_id=demo_user.id
            ),
            models.Product(
                name="Paracetamol 650mg",
                batch_number="PAR2024002",
                manufacturing_date=datetime.utcnow() - timedelta(days=45),
                expiry_date=datetime.utcnow() + timedelta(days=685),
                current_temperature=6.1,
                current_humidity=58.2,
                status="Safe & Verified",
                location="Warehouse A - Section 2",
                owner_id=demo_user.id
            ),
            models.Product(
                name="Vaccine XYZ",
                batch_number="VAC2024003",
                manufacturing_date=datetime.utcnow() - timedelta(days=10),
                expiry_date=datetime.utcnow() + timedelta(days=355),
                current_temperature=3.8,
                current_humidity=62.0,
                status="Safe & Verified",
                location="Warehouse B - Cold Storage",
                owner_id=demo_user.id
            )
        ]
        
        db.add_all(products)
        db.commit()
        print(f"   ✓ Created {len(products)} demo products")
        
        # 6. Create sample sensor data
        print("\n6. Creating sample sensor data...")
        
        sensor_readings = []
        for product in products:
            for i in range(10):
                reading = models.SensorData(
                    product_id=product.id,
                    temperature=product.current_temperature + (i * 0.1 - 0.5),
                    humidity=product.current_humidity + (i * 0.2 - 1.0),
                    light_exposure=50.0 + (i * 2),
                    vibration=0.5 + (i * 0.05),
                    timestamp=datetime.utcnow() - timedelta(hours=10-i)
                )
                sensor_readings.append(reading)
        
        db.add_all(sensor_readings)
        db.commit()
        print(f"   ✓ Created {len(sensor_readings)} sensor readings")
        
        # 7. Create system metrics
        print("\n7. Creating system metrics...")
        
        metrics = [
            models.SystemMetrics(
                metric_name="cpu_usage",
                metric_value=45.5,
                unit="percent"
            ),
            models.SystemMetrics(
                metric_name="memory_usage",
                metric_value=62.3,
                unit="percent"
            ),
            models.SystemMetrics(
                metric_name="api_response_time",
                metric_value=125.5,
                unit="milliseconds"
            )
        ]
        
        db.add_all(metrics)
        db.commit()
        print(f"   ✓ Created {len(metrics)} system metrics")
        
        print("\n✅ Initial data seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"   - Users: 1 (+ admin)")
        print(f"   - AI Models: 3")
        print(f"   - System Configs: {len(configs)}")
        print(f"   - IoT Sensors: {len(sensors)}")
        print(f"   - Products: {len(products)}")
        print(f"   - Sensor Readings: {len(sensor_readings)}")
        print(f"   - System Metrics: {len(metrics)}")
        
        print("\n🔐 Login Credentials:")
        print("   Admin:")
        print("     Username: admin")
        print("     Password: Admin@123")
        print("   User:")
        print("     Username: pharma_user")
        print("     Password: User@123")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()