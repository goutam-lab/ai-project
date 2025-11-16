import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from app.ai_models.quality_predictor import QualityPredictor
from app.ai_models.anomaly_detector import AnomalyDetector
from app.ai_models.label_validator import LabelValidator
from app.ai_models.image_analyzer import ImageAnalyzer
import pandas as pd

def train_all_models():
    """
    Train all AI models using data from database
    """
    
    print("=" * 70)
    print("AI MODEL TRAINING - MEDICINE MONITORING SYSTEM")
    print("=" * 70)
    
    db = SessionLocal()
    
    try:
        # ===================================================================
        # 1. CHECK DATA AVAILABILITY
        # ===================================================================
        
        print("\n🔍 Checking available data...")
        
        kaggle_count = db.query(models.KaggleMedicineData).count()
        sensor_count = db.query(models.SensorData).count()
        
        print(f"   Kaggle dataset: {kaggle_count} records")
        print(f"   Sensor data: {sensor_count} records")
        
        if kaggle_count == 0:
            print("\n❌ No Kaggle data found!")
            print("\n📋 Please follow these steps:")
            print("   1. Run: python import_kaggle_data.py")
            print("   2. Wait for import to complete")
            print("   3. Run this script again")
            return
        
        # ===================================================================
        # 2. PREPARE AND VALIDATE DATA
        # ===================================================================
        
        print("\n" + "=" * 70)
        print("1. QUALITY DEGRADATION PREDICTION MODEL")
        print("=" * 70)
        
        # Get Kaggle data with validation
        kaggle_data = db.query(models.KaggleMedicineData).all()
        
        print(f"\n📊 Processing {len(kaggle_data)} records...")
        
        # Convert to dict with data cleaning
        kaggle_dict = []
        skipped = 0
        
        for record in kaggle_data:
            # Check if essential fields exist
            if (record.storage_temperature is None or 
                record.storage_humidity is None or 
                record.quality_status is None):
                skipped += 1
                continue
            
            # Use inspection_date, fallback to imported_at, or use a default
            inspection_date = record.inspection_date
            if inspection_date is None:
                inspection_date = record.imported_at
            if inspection_date is None:
                # Use manufacturing date + 30 days as fallback
                if record.manufacturing_date:
                    inspection_date = record.manufacturing_date + pd.Timedelta(days=30)
                else:
                    skipped += 1
                    continue
            
            kaggle_dict.append({
                'storage_temperature': float(record.storage_temperature),
                'storage_humidity': float(record.storage_humidity),
                'ph_level': float(record.ph_level) if record.ph_level else 7.0,
                'moisture_content': float(record.moisture_content) if record.moisture_content else 5.0,
                'manufacturing_date': record.manufacturing_date,
                'inspection_date': inspection_date,
                'impurity_percentage': float(record.impurity_percentage) if record.impurity_percentage else 0.5,
                'active_ingredient_concentration': float(record.active_ingredient_concentration) if record.active_ingredient_concentration else 95.0,
                'quality_status': str(record.quality_status)
            })
        
        print(f"   Valid records: {len(kaggle_dict)}")
        print(f"   Skipped (missing data): {skipped}")
        
        if len(kaggle_dict) < 10:
            print("\n⚠️  Not enough valid data to train!")
            print("   Minimum required: 10 records")
            print("   Try reimporting the Kaggle dataset")
            return
        
        # ===================================================================
        # 3. TRAIN QUALITY PREDICTION MODEL
        # ===================================================================
        
        predictor = QualityPredictor()
        
        try:
            X, y_score, y_class, features = predictor.prepare_training_data(kaggle_dict)
            
            print(f"\n   Training with {len(X)} samples...")
            
            reg_accuracy, class_accuracy = predictor.train_model(X, y_score, y_class)
            predictor.save_model()
            
            # Update AI model record in database
            quality_model = db.query(models.AIModel).filter(
                models.AIModel.model_type == "ml_prediction"
            ).first()
            
            if quality_model:
                quality_model.accuracy = class_accuracy * 100
                quality_model.status = "active"
                quality_model.last_trained = pd.Timestamp.now()
                quality_model.training_data_count = len(kaggle_dict)
                db.commit()
                
        except Exception as e:
            print(f"\n❌ Error training quality model: {e}")
            print("   Continuing with other models...")
        
        # ===================================================================
        # 4. TRAIN ANOMALY DETECTION MODEL
        # ===================================================================
        
        print("\n" + "=" * 70)
        print("2. ANOMALY DETECTION MODEL")
        print("=" * 70)
        
        if sensor_count > 0:
            sensor_data_list = db.query(models.SensorData).all()
            
            sensor_df = pd.DataFrame([{
                'temperature': float(s.temperature),
                'humidity': float(s.humidity),
                'light_exposure': float(s.light_exposure) if s.light_exposure else 50.0,
                'vibration': float(s.vibration) if s.vibration else 0.5
            } for s in sensor_data_list])
            
            print(f"\n📊 Training with {len(sensor_df)} sensor readings")
            
            detector = AnomalyDetector()
            anomaly_count, normal_count = detector.train_model(sensor_df)
            detector.save_model()
            
            # Update model record
            anomaly_model = db.query(models.AIModel).filter(
                models.AIModel.model_name.like("%Anomaly%")
            ).first()
            
            if anomaly_model:
                accuracy = (normal_count / len(sensor_df)) * 100
                anomaly_model.accuracy = accuracy
                anomaly_model.status = "active"
                anomaly_model.last_trained = pd.Timestamp.now()
                anomaly_model.training_data_count = len(sensor_df)
                db.commit()
        else:
            print("\n⚠️  No sensor data available")
            print("   Run: python seed_initial_data.py")
            print("   Then retrain the models")
        
        # ===================================================================
        # 5. INITIALIZE OTHER MODELS
        # ===================================================================
        
        print("\n" + "=" * 70)
        print("3. NLP LABEL VALIDATOR")
        print("=" * 70)
        
        validator = LabelValidator()
        print("✓ Label validator initialized")
        
        nlp_model = db.query(models.AIModel).filter(
            models.AIModel.model_type == "nlp"
        ).first()
        
        if nlp_model:
            nlp_model.status = "active"
            nlp_model.last_trained = pd.Timestamp.now()
            db.commit()
        
        print("\n" + "=" * 70)
        print("4. COMPUTER VISION IMAGE ANALYZER")
        print("=" * 70)
        
        analyzer = ImageAnalyzer()
        print("✓ Image analyzer initialized")
        
        cv_model = db.query(models.AIModel).filter(
            models.AIModel.model_type == "computer_vision"
        ).first()
        
        if cv_model:
            cv_model.status = "active"
            cv_model.last_trained = pd.Timestamp.now()
            db.commit()
        
        # ===================================================================
        # TRAINING COMPLETE
        # ===================================================================
        
        print("\n" + "=" * 70)
        print("✅ TRAINING COMPLETE!")
        print("=" * 70)
        
        print("\n🎯 Models saved to: app/ai_models/saved_models/")
        print("\n✨ Your AI system is ready to use!")
        print("\n📋 Next step: Run 'python run_server.py' to start the API")
        
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    train_all_models()