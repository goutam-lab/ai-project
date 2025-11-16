import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash
from app.models import (
    User, Product, SensorData, Alert, AIModel, IoTSensor, SystemConfig
)

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def seed_data():
    """Seed the database with initial data"""
    db = SessionLocal()
    print("Seeding initial data...\n")

    try:
        # 1. --- Create Demo Users ---
        print("1. Creating demo users...")
        
        # --- THIS IS THE FIX ---
        # Check if user already exists
        existing_user = db.query(User).filter_by(email="user@pharma.com").first()
        if not existing_user:
            demo_user = User(
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
            print("   ✓ Created demo user 'pharma_user'")
        else:
            demo_user = existing_user
            print("   ⚠️  Demo user 'pharma_user' already exists, skipping.")
        # --- END OF FIX ---

        # 2. --- Create AI Models ---
        print("\n2. Seeding AI Models...")
        
        models_to_seed = [
            {'model_name': 'Quality Degradation Predictor', 'model_type': 'ml_prediction', 'version': '1.0.0', 'status': 'active', 'accuracy': 88.5},
            {'model_name': 'Sensor Anomaly Detector', 'model_type': 'anomaly_detection', 'version': '1.0.0', 'status': 'active', 'accuracy': 95.0},
            {'model_name': 'Packaging CV Analyzer', 'model_type': 'computer_vision', 'version': '1.0.0', 'status': 'active', 'accuracy': 92.0},
            {'model_name': 'Label NLP Validator', 'model_type': 'nlp', 'version': '1.0.0', 'status': 'active', 'accuracy': 99.0}
        ]

        for model_data in models_to_seed:
            existing_model = db.query(AIModel).filter_by(model_name=model_data['model_name']).first()
            if not existing_model:
                model = AIModel(**model_data)
                db.add(model)
        
        db.commit()
        print("   ✓ AI models seeded.")

        # 3. --- Create System Config ---
        print("\n3. Seeding System Configuration...")
        
        configs_to_seed = [
            {'config_key': 'temperature_threshold_max', 'config_value': '25.0', 'description': 'Maximum safe temperature in °C'},
            {'config_key': 'temperature_threshold_min', 'config_value': '15.0', 'description': 'Minimum safe temperature in °C'},
            {'config_key': 'humidity_threshold_max', 'config_value': '60.0', 'description': 'Maximum safe humidity in %'},
            {'config_key': 'humidity_threshold_min', 'config_value': '40.0', 'description': 'Minimum safe humidity in %'}
        ]
        
        for config_data in configs_to_seed:
            existing_config = db.query(SystemConfig).filter_by(config_key=config_data['config_key']).first()
            if not existing_config:
                config = SystemConfig(**config_data)
                db.add(config)
                
        db.commit()
        print("   ✓ System configuration seeded.")

        # 4. --- Create IoT Sensors ---
        print("\n4. Seeding IoT Sensors...")
        
        sensors_to_seed = [
            {'sensor_id': 'TEMP_001', 'sensor_type': 'temperature', 'location': 'Warehouse A', 'status': 'active'},
            {'sensor_id': 'HUM_001', 'sensor_type': 'humidity', 'location': 'Warehouse A', 'status': 'active'},
            {'sensor_id': 'TEMP_002', 'sensor_type': 'temperature', 'location': 'Warehouse B', 'status': 'maintenance'},
            {'sensor_id': 'HUM_002', 'sensor_type': 'humidity', 'location': 'Warehouse B', 'status': 'active'},
            {'sensor_id': 'LIGHT_001', 'sensor_type': 'light', 'location': 'Cold Storage 1', 'status': 'active'}
        ]

        for sensor_data in sensors_to_seed:
            existing_sensor = db.query(IoTSensor).filter_by(sensor_id=sensor_data['sensor_id']).first()
            if not existing_sensor:
                sensor = IoTSensor(**sensor_data)
                db.add(sensor)
                
        db.commit()
        print("   ✓ IoT sensors seeded.")

        # 5. --- Create Demo Products ---
        print("\n5. Seeding Demo Products...")
        
        products_to_seed = [
            {
                'name': 'Aspirin 81mg',
                'batch_number': 'A-1001',
                'manufacturing_date': datetime.now() - timedelta(days=180),
                'expiry_date': datetime.now() + timedelta(days=540),
                'current_temperature': 20.5,
                'current_humidity': 55.2,
                'status': 'Safe & Verified',
                'location': 'Warehouse A',
                'owner_id': demo_user.id
            },
            {
                'name': 'Metformin 500mg',
                'batch_number': 'M-2002',
                'manufacturing_date': datetime.now() - timedelta(days=90),
                'expiry_date': datetime.now() + timedelta(days=630),
                'current_temperature': 28.0,
                'current_humidity': 65.0,
                'status': 'Warning',
                'location': 'Warehouse B',
                'owner_id': demo_user.id
            },
            {
                'name': 'Atorvastatin 20mg',
                'batch_number': 'AT-3003',
                'manufacturing_date': datetime.now() - timedelta(days=30),
                'expiry_date': datetime.now() + timedelta(days=700),
                'current_temperature': 22.0,
                'current_humidity': 50.0,
                'status': 'Safe & Verified',
                'location': 'Cold Storage 1',
                'owner_id': demo_user.id
            }
        ]

        product_objects = []
        for prod_data in products_to_seed:
            existing_prod = db.query(Product).filter_by(batch_number=prod_data['batch_number']).first()
            if not existing_prod:
                product = Product(**prod_data)
                db.add(product)
                product_objects.append(product)
            else:
                product_objects.append(existing_prod)
        
        db.commit()
        for prod in product_objects:
            db.refresh(prod)
            
        print("   ✓ Demo products seeded.")

        # 6. --- Create Sensor Data ---
        print("\n6. Seeding Sensor Data...")
        
        if product_objects:
            sensor_readings = [
                {'product_id': product_objects[0].id, 'temperature': 20.5, 'humidity': 55.2, 'light_exposure': 100.0, 'vibration': 0.1},
                {'product_id': product_objects[0].id, 'temperature': 20.6, 'humidity': 55.0, 'light_exposure': 100.0, 'vibration': 0.1},
                {'product_id': product_objects[1].id, 'temperature': 28.0, 'humidity': 65.0, 'light_exposure': 150.0, 'vibration': 0.2},
                {'product_id': product_objects[1].id, 'temperature': 28.1, 'humidity': 65.5, 'light_exposure': 150.0, 'vibration': 0.2},
                {'product_id': product_objects[2].id, 'temperature': 22.0, 'humidity': 50.0, 'light_exposure': 50.0, 'vibration': 0.05}
            ]
            
            for reading_data in sensor_readings:
                # Check if a reading for that product at that temp exists
                existing_reading = db.query(SensorData).filter_by(product_id=reading_data['product_id'], temperature=reading_data['temperature']).first()
                if not existing_reading:
                    reading = SensorData(**reading_data)
                    db.add(reading)
            
            db.commit()
            print("   ✓ Sensor data seeded.")
        else:
            print("   ⚠️  No products found, skipping sensor data.")

        # 7. --- Create Alerts ---
        print("\n7. Seeding Alerts...")
        
        if product_objects and len(product_objects) > 1:
            alert = Alert(
                user_id=demo_user.id,
                product_id=product_objects[1].id,
                alert_type="temperature",
                severity="high",
                message="Temperature exceeded threshold (28.0°C).",
                is_read=False
            )
            
            existing_alert = db.query(Alert).filter_by(product_id=alert.product_id, alert_type=alert.alert_type).first()
            if not existing_alert:
                db.add(alert)
                db.commit()
            
            print("   ✓ Alerts seeded.")
        else:
            print("   ⚠️  Not enough products, skipping alerts.")

        print("\n" + "="*30)
        print("✅ SEEDING COMPLETE!")
        print("="*30)

    except IntegrityError as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
    except Exception as e:
        db.rollback()
        print(f"❌ An unexpected error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()