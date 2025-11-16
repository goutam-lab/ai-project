import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime, timedelta
import os

# Quality Degradation Prediction Model

class QualityPredictor:
    """
    Predicts medicine quality degradation based on storage conditions
    Uses Random Forest for regression and classification
    """
    
    def __init__(self):
        self.regression_model = None
        self.classification_model = None
        self.scaler = StandardScaler()
        self.model_path = "app/ai_models/saved_models/"
        os.makedirs(self.model_path, exist_ok=True)
    
    def prepare_training_data(self, kaggle_data):
        """
        Prepare training data from Kaggle dataset
        
        Features: temperature, humidity, pH, moisture, time_elapsed
        Target (regression): quality_score (0-100)
        Target (classification): quality_status (Good/Degraded/Counterfeit)
        """
        
        df = pd.DataFrame(kaggle_data)
        
        # Calculate time elapsed since manufacturing
        df['manufacturing_date'] = pd.to_datetime(df['manufacturing_date'])
        df['inspection_date'] = pd.to_datetime(df['inspection_date'])
        df['days_elapsed'] = (df['inspection_date'] - df['manufacturing_date']).dt.days
        
        # Feature engineering
        features = [
            'storage_temperature',
            'storage_humidity',
            'ph_level',
            'moisture_content',
            'days_elapsed',
            'impurity_percentage',
            'active_ingredient_concentration'
        ]
        
        # Remove rows with missing values
        df_clean = df.dropna(subset=features + ['quality_status'])
        
        X = df_clean[features]
        
        # Create quality score from status
        quality_map = {'Good': 100, 'Degraded': 50, 'Counterfeit': 0}
        y_score = df_clean['quality_status'].map(quality_map)
        y_class = df_clean['quality_status']
        
        return X, y_score, y_class, features
    
    def train_model(self, X, y_score, y_class):
        """
        Train both regression and classification models
        """
        
        print("🤖 Training Quality Prediction Models...")
        
        # Split data
        X_train, X_test, y_score_train, y_score_test = train_test_split(
            X, y_score, test_size=0.2, random_state=42
        )
        
        _, _, y_class_train, y_class_test = train_test_split(
            X, y_class, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train regression model (quality score)
        print("  Training Regression Model...")
        self.regression_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.regression_model.fit(X_train_scaled, y_score_train)
        
        # Train classification model (quality status)
        print("  Training Classification Model...")
        self.classification_model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            random_state=42
        )
        self.classification_model.fit(X_train_scaled, y_class_train)
        
        # Evaluate models
        reg_score = self.regression_model.score(X_test_scaled, y_score_test)
        class_score = self.classification_model.score(X_test_scaled, y_class_test)
        
        print(f"\n  ✓ Regression Model Accuracy: {reg_score*100:.2f}%")
        print(f"  ✓ Classification Model Accuracy: {class_score*100:.2f}%")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': self.regression_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n  📊 Top 3 Important Features:")
        for idx, row in feature_importance.head(3).iterrows():
            print(f"     {row['feature']}: {row['importance']:.3f}")
        
        return reg_score, class_score
    
    def save_model(self):
        """Save trained models to disk"""
        joblib.dump(self.regression_model, 
                   f"{self.model_path}quality_regression.pkl")
        joblib.dump(self.classification_model, 
                   f"{self.model_path}quality_classification.pkl")
        joblib.dump(self.scaler, 
                   f"{self.model_path}scaler.pkl")
        print("\n  ✓ Models saved successfully!")
    
    def load_model(self):
        """Load trained models from disk"""
        try:
            self.regression_model = joblib.load(
                f"{self.model_path}quality_regression.pkl"
            )
            self.classification_model = joblib.load(
                f"{self.model_path}quality_classification.pkl"
            )
            self.scaler = joblib.load(
                f"{self.model_path}scaler.pkl"
            )
            print("✓ Models loaded successfully!")
            return True
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            return False
    
    def predict(self, temperature, humidity, ph, moisture, 
                days_elapsed, impurity, active_ingredient):
        """
        Make prediction for a single medicine sample
        """
        
        # Prepare features
        features = np.array([[
            temperature,
            humidity,
            ph,
            moisture,
            days_elapsed,
            impurity,
            active_ingredient
        ]])
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict quality score
        quality_score = self.regression_model.predict(features_scaled)[0]
        
        # Predict quality status
        quality_status = self.classification_model.predict(features_scaled)[0]
        
        # Predict probability for each class
        probabilities = self.classification_model.predict_proba(features_scaled)[0]
        class_names = self.classification_model.classes_
        
        prob_dict = {
            class_names[i]: float(probabilities[i]) 
            for i in range(len(class_names))
        }
        
        return {
            'quality_score': float(quality_score),
            'quality_status': quality_status,
            'confidence': prob_dict,
            'degradation_risk': 'High' if quality_score < 50 else 'Low'
        }
    
    def predict_degradation_timeline(self, current_conditions, days_ahead=30):
        """
        Predict quality degradation over time
        """
        
        predictions = []
        temp, humidity, ph, moisture, impurity, active = current_conditions
        
        for days in range(0, days_ahead, 5):
            pred = self.predict(
                temp, humidity, ph, moisture, 
                days, impurity, active
            )
            predictions.append({
                'days_from_now': days,
                'predicted_quality': pred['quality_score'],
                'predicted_status': pred['quality_status']
            })
        
        return predictions