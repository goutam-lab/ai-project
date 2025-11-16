# AI Prediction Endpoints
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_user
from ..ai_models.quality_predictor import QualityPredictor
from ..ai_models.anomaly_detector import AnomalyDetector
from ..ai_models.label_validator import LabelValidator
from ..ai_models.image_analyzer import ImageAnalyzer
from pydantic import BaseModel
from datetime import datetime
import os

router = APIRouter(prefix="/ai", tags=["ai-predictions"])

# Initialize AI models (load from disk)
quality_predictor = QualityPredictor()
anomaly_detector = AnomalyDetector()
label_validator = LabelValidator()
image_analyzer = ImageAnalyzer()

# Load models at startup
try:
    quality_predictor.load_model()
    anomaly_detector.load_model()
    print("✓ AI models loaded successfully")
except:
    print("⚠️  AI models not found - please train them first")

# Request/Response Schemas
class QualityPredictionRequest(BaseModel):
    product_id: int
    temperature: float
    humidity: float
    ph_level: Optional[float] = 7.0
    moisture_content: Optional[float] = 5.0
    days_since_manufacturing: Optional[int] = 0
    impurity_percentage: Optional[float] = 0.5
    active_ingredient_concentration: Optional[float] = 95.0

class AnomalyDetectionRequest(BaseModel):
    temperature: float
    humidity: float
    light_exposure: Optional[float] = None
    vibration: Optional[float] = None

class LabelValidationRequest(BaseModel):
    label_text: str
    batch_number: Optional[str] = None

class QualityPredictionResponse(BaseModel):
    quality_score: float
    quality_status: str
    confidence: dict
    degradation_risk: str
    recommendation: str

# AI Prediction Endpoints
@router.post("/predict-quality")
def predict_quality(
    request: QualityPredictionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predict medicine quality based on current conditions
    Uses ML model trained on Kaggle dataset
    """
    
    try:
        # Make prediction
        prediction = quality_predictor.predict(
            temperature=request.temperature,
            humidity=request.humidity,
            ph=request.ph_level,
            moisture=request.moisture_content,
            days_elapsed=request.days_since_manufacturing,
            impurity=request.impurity_percentage,
            active_ingredient=request.active_ingredient_concentration
        )
        
        # Add recommendation
        recommendation = _generate_recommendation(prediction)
        prediction['recommendation'] = recommendation
        
        # Save prediction to database
        db_prediction = models.QualityPrediction(
            product_id=request.product_id,
            predicted_quality_score=prediction['quality_score'],
            confidence_level=max(prediction['confidence'].values()),
            prediction_timestamp=datetime.utcnow()
        )
        db.add(db_prediction)
        
        # Create alert if quality is poor
        if prediction['quality_score'] < 70:
            alert = models.Alert(
                user_id=current_user.id,
                product_id=request.product_id,
                alert_type="quality_degradation",
                severity="high" if prediction['quality_score'] < 50 else "medium",
                message=f"AI Prediction: Quality score is {prediction['quality_score']:.1f}. {recommendation}"
            )
            db.add(alert)
        
        db.commit()
        
        return prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict-degradation-timeline")
def predict_degradation_timeline(
    request: QualityPredictionRequest,
    days_ahead: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predict quality degradation over time
    Provides timeline of expected quality changes
    """
    
    try:
        current_conditions = (
            request.temperature,
            request.humidity,
            request.ph_level,
            request.moisture_content,
            request.impurity_percentage,
            request.active_ingredient_concentration
        )
        
        timeline = quality_predictor.predict_degradation_timeline(
            current_conditions,
            days_ahead
        )
        
        return {
            "product_id": request.product_id,
            "prediction_timeline": timeline,
            "warning": "Take action if quality drops below 70" if any(
                p['predicted_quality'] < 70 for p in timeline
            ) else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timeline prediction failed: {str(e)}")

@router.post("/detect-anomaly")
def detect_anomaly(
    request: AnomalyDetectionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect if current sensor readings are anomalous
    Uses Isolation Forest algorithm
    """
    
    try:
        result = anomaly_detector.detect(
            temperature=request.temperature,
            humidity=request.humidity,
            light_exposure=request.light_exposure,
            vibration=request.vibration
        )
        
        # Log to audit
        crud.create_audit_log(
            db,
            user_id=current_user.id,
            action="ANOMALY_DETECTION",
            table_name="sensor_data",
            new_value=f"Anomaly: {result['is_anomaly']}, Severity: {result['severity']}"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@router.post("/validate-label")
def validate_label(
    request: LabelValidationRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Validate medicine label using NLP
    Checks for required fields and expiry date
    """
    
    try:
        # Validate label text
        validation_result = label_validator.validate_label(request.label_text)
        
        # If batch number provided, verify authenticity
        if request.batch_number:
            # Get all authentic batch numbers from database
            authentic_batches = [
                p.batch_number for p in db.query(models.Product).all()
            ]
            authentic_batches.extend([
                k.batch_id for k in db.query(models.KaggleMedicineData).all()
            ])
            
            authenticity = label_validator.verify_batch_authenticity(
                request.batch_number,
                authentic_batches
            )
            validation_result['authenticity_check'] = authenticity
        
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Label validation failed: {str(e)}")

@router.post("/analyze-packaging")
async def analyze_packaging(
    file: UploadFile = File(...),
    product_name: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze medicine packaging image using Computer Vision
    Detects potential counterfeits
    """
    
    try:
        # Save uploaded file temporarily
        upload_dir = "uploads/packaging_analysis"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = f"{upload_dir}/{file.filename}"
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analyze image
        analysis_result = image_analyzer.analyze_packaging(file_path, product_name)
        
        # Create counterfeit report if suspicious
        if analysis_result.get('is_suspicious', False):
            # Find product
            product = None
            if product_name:
                product = db.query(models.Product).filter(
                    models.Product.name.like(f"%{product_name}%")
                ).first()
            
            if product:
                counterfeit_report = models.CounterfeitReport(
                    product_id=product.id,
                    reporter_id=current_user.id,
                    confidence_score=analysis_result.get('confidence', 50),
                    detection_method="computer_vision",
                    image_path=file_path,
                    description="Suspicious packaging detected by AI analysis",
                    status="pending"
                )
                db.add(counterfeit_report)
                db.commit()
                
                analysis_result['report_id'] = counterfeit_report.id
        
        # Clean up file
        os.remove(file_path)
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@router.get("/model-status")
def get_model_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get status of all AI models
    Shows which models are trained and active
    """
    
    models_info = []
    
    # Quality Predictor
    models_info.append({
        "name": "Quality Degradation Predictor",
        "type": "ml_prediction",
        "status": "active" if quality_predictor.regression_model else "not_trained",
        "description": "Predicts medicine quality based on storage conditions"
    })
    
    # Anomaly Detector
    models_info.append({
        "name": "Anomaly Detector",
        "type": "anomaly_detection",
        "status": "active" if anomaly_detector.model else "not_trained",
        "description": "Detects unusual sensor readings"
    })
    
    # Label Validator
    models_info.append({
        "name": "Label Validator",
        "type": "nlp",
        "status": "active",
        "description": "Validates medicine labels and batch numbers"
    })
    
    # Image Analyzer
    models_info.append({
        "name": "Packaging Analyzer",
        "type": "computer_vision",
        "status": "active",
        "description": "Analyzes packaging for counterfeits"
    })
    
    # Get from database
    db_models = crud.get_all_ai_models(db)
    
    return {
        "models": models_info,
        "database_records": db_models,
        "total_models": len(models_info)
    }

@router.post("/smart-analysis")
def smart_analysis(
    product_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Comprehensive AI analysis of a product
    Combines all AI models for complete assessment
    """
    
    try:
        # Get product
        product = crud.get_product_by_id(db, product_id, current_user.id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get latest sensor data
        sensor_data = crud.get_product_sensor_data(db, product_id, limit=1)
        
        if not sensor_data:
            raise HTTPException(
                status_code=400, 
                detail="No sensor data available for this product"
            )
        
        latest_sensor = sensor_data[0]
        
        # Calculate days since manufacturing
        days_elapsed = (datetime.utcnow() - product.manufacturing_date).days
        
        # 1. Quality Prediction
        quality_pred = quality_predictor.predict(
            temperature=latest_sensor.temperature,
            humidity=latest_sensor.humidity,
            ph=7.0,  # Default values
            moisture=5.0,
            days_elapsed=days_elapsed,
            impurity=0.5,
            active_ingredient=95.0
        )
        
        # 2. Anomaly Detection
        anomaly_result = anomaly_detector.detect(
            temperature=latest_sensor.temperature,
            humidity=latest_sensor.humidity,
            light_exposure=latest_sensor.light_exposure,
            vibration=latest_sensor.vibration
        )
        
        # 3. Comprehensive Assessment
        overall_status = "Safe" if (
            quality_pred['quality_score'] > 70 and 
            not anomaly_result['is_anomaly']
        ) else "Warning"
        
        # 4. Generate recommendations
        recommendations = []
        
        if quality_pred['quality_score'] < 70:
            recommendations.append(
                f"Quality declining: {_generate_recommendation(quality_pred)}"
            )
        
        if anomaly_result['is_anomaly']:
            recommendations.append(anomaly_result['recommendation'])
        
        # 5. Predictive warnings
        timeline = quality_predictor.predict_degradation_timeline(
            (latest_sensor.temperature, latest_sensor.humidity, 7.0, 5.0, 0.5, 95.0),
            days_ahead=30
        )
        
        future_warning = None
        for pred in timeline:
            if pred['predicted_quality'] < 70:
                future_warning = f"Quality may drop below safe levels in {pred['days_from_now']} days"
                break
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "batch_number": product.batch_number,
            "overall_status": overall_status,
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "quality_analysis": {
                "score": quality_pred['quality_score'],
                "status": quality_pred['quality_status'],
                "confidence": quality_pred['confidence'],
                "risk": quality_pred['degradation_risk']
            },
            "anomaly_detection": {
                "is_anomalous": anomaly_result['is_anomaly'],
                "severity": anomaly_result['severity'],
                "score": anomaly_result['anomaly_score']
            },
            "current_conditions": {
                "temperature": latest_sensor.temperature,
                "humidity": latest_sensor.humidity,
                "timestamp": latest_sensor.timestamp.isoformat()
            },
            "recommendations": recommendations if recommendations else ["No action needed"],
            "predictive_warning": future_warning,
            "degradation_timeline": timeline[:5]  # Next 25 days
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
# Helper Functions
def _generate_recommendation(prediction):
    """Generate actionable recommendation based on prediction"""
    
    score = prediction['quality_score']
    status = prediction['quality_status']
    
    if score > 80:
        return "Quality is excellent. Continue current storage conditions."
    elif score > 70:
        return "Quality is acceptable. Monitor conditions regularly."
    elif score > 50:
        return "Quality is degrading. Consider redistributing or using soon."
    elif score > 30:
        return "Quality is poor. Recommend immediate inspection and potential disposal."
    else:
        return "Critical quality level. Do not distribute. Quarantine immediately."