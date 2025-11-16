from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np
import joblib
import os

# Anomaly Detection for Sensor Data

class AnomalyDetector:
    """
    Detects anomalies in sensor readings
    Uses Isolation Forest algorithm
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = "app/ai_models/saved_models/"
        os.makedirs(self.model_path, exist_ok=True)
    
    def train_model(self, sensor_data):
        """
        Train anomaly detection model on normal sensor readings
        """
        
        print("\n🔍 Training Anomaly Detection Model...")
        
        # Prepare features
        features = ['temperature', 'humidity']
        if 'light_exposure' in sensor_data.columns:
            features.append('light_exposure')
        if 'vibration' in sensor_data.columns:
            features.append('vibration')
        
        X = sensor_data[features].dropna()
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Isolation Forest
        self.model = IsolationForest(
            contamination=0.1,  # Expect 10% anomalies
            random_state=42,
            n_estimators=100
        )
        self.model.fit(X_scaled)
        
        # Evaluate on training data
        predictions = self.model.predict(X_scaled)
        anomaly_count = np.sum(predictions == -1)
        normal_count = np.sum(predictions == 1)
        
        print(f"  ✓ Model trained on {len(X)} samples")
        print(f"  ✓ Detected {anomaly_count} anomalies ({anomaly_count/len(X)*100:.1f}%)")
        print(f"  ✓ Normal readings: {normal_count} ({normal_count/len(X)*100:.1f}%)")
        
        return anomaly_count, normal_count
    
    def save_model(self):
        """Save model to disk"""
        joblib.dump(self.model, f"{self.model_path}anomaly_detector.pkl")
        joblib.dump(self.scaler, f"{self.model_path}anomaly_scaler.pkl")
        print("  ✓ Anomaly detector saved!")
    
    def load_model(self):
        """Load model from disk"""
        try:
            self.model = joblib.load(f"{self.model_path}anomaly_detector.pkl")
            self.scaler = joblib.load(f"{self.model_path}anomaly_scaler.pkl")
            return True
        except:
            return False
    
    def detect(self, temperature, humidity, light_exposure=None, vibration=None):
        """
        Detect if current reading is anomalous
        """
        
        # Prepare features
        features = [temperature, humidity]
        if light_exposure is not None:
            features.append(light_exposure)
        if vibration is not None:
            features.append(vibration)
        
        features_array = np.array([features])
        
        # Scale and predict
        features_scaled = self.scaler.transform(features_array)
        prediction = self.model.predict(features_scaled)[0]
        anomaly_score = self.model.score_samples(features_scaled)[0]
        
        is_anomaly = prediction == -1
        
        return {
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(anomaly_score),
            'severity': self._get_severity(anomaly_score),
            'recommendation': self._get_recommendation(is_anomaly, temperature, humidity)
        }
    
    def _get_severity(self, score):
        """Convert anomaly score to severity level"""
        if score > -0.1:
            return "low"
        elif score > -0.3:
            return "medium"
        else:
            return "high"
    
    def _get_recommendation(self, is_anomaly, temp, humidity):
        """Provide recommendations based on anomaly"""
        if not is_anomaly:
            return "Conditions are normal"
        
        recommendations = []
        
        if temp < 2 or temp > 8:
            recommendations.append(f"Adjust temperature (current: {temp}°C, safe: 2-8°C)")
        
        if humidity < 45 or humidity > 75:
            recommendations.append(f"Adjust humidity (current: {humidity}%, safe: 45-75%)")
        
        return "; ".join(recommendations) if recommendations else "Check environmental conditions"
