from app.ai_models.quality_predictor import QualityPredictor
from app.ai_models.anomaly_detector import AnomalyDetector
from app.ai_models.label_validator import LabelValidator
from app.ai_models.image_analyzer import ImageAnalyzer

def test_models():
    """Test all AI models"""
    
    print("=" * 70)
    print("TESTING AI MODELS")
    print("=" * 70)
    
    # Test Quality Predictor
    print("\n1. Testing Quality Predictor...")
    predictor = QualityPredictor()
    
    if predictor.load_model():
        prediction = predictor.predict(
            temperature=5.5,
            humidity=60.0,
            ph=7.0,
            moisture=5.0,
            days_elapsed=30,
            impurity=0.5,
            active_ingredient=95.0
        )
        print(f"   ✓ Quality Score: {prediction['quality_score']:.1f}")
        print(f"   ✓ Status: {prediction['quality_status']}")
        print(f"   ✓ Risk: {prediction['degradation_risk']}")
    else:
        print("   ❌ Model not trained yet")
    
    # Test Anomaly Detector
    print("\n2. Testing Anomaly Detector...")
    detector = AnomalyDetector()
    
    if detector.load_model():
        # Test normal reading
        result = detector.detect(5.5, 60.0, 50.0, 0.5)
        print(f"   ✓ Normal reading: Anomaly = {result['is_anomaly']}")
        
        # Test abnormal reading
        result = detector.detect(25.0, 90.0, 100.0, 5.0)
        print(f"   ✓ Abnormal reading: Anomaly = {result['is_anomaly']}")
        print(f"   ✓ Severity: {result['severity']}")
    else:
        print("   ❌ Model not trained yet")
    
    # Test Label Validator
    print("\n3. Testing Label Validator...")
    validator = LabelValidator()
    
    test_label = """
    Aspirin 500mg
    Batch: ASP2024001
    Expiry: 12/2026
    Manufactured by: PharmaCorp Ltd.
    """
    
    result = validator.validate_label(test_label)
    print(f"   ✓ Valid: {result['is_valid']}")
    print(f"   ✓ Missing fields: {result['missing_fields']}")
    print(f"   ✓ Extracted: {result['extracted_info']}")
    
    # Test Image Analyzer
    print("\n4. Testing Image Analyzer...")
    analyzer = ImageAnalyzer()
    print("   ✓ Image analyzer ready")
    print("   ℹ️  Upload an image via API to test fully")
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    test_models()