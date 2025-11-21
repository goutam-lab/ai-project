# Computer Vision for Packaging Analysis (Simplified)

from PIL import Image
import numpy as np

class ImageAnalyzer:
    """
    Analyzes medicine packaging images for counterfeits
    Uses simple image processing techniques
    """
    
    def __init__(self):
        self.reference_images = {}
    
    def load_reference_image(self, product_name, image_path):
        """Load reference image for authentic product"""
        try:
            img = Image.open(image_path)
            self.reference_images[product_name] = img
            return True
        except:
            return False
    
    def analyze_packaging(self, image_path, product_name=None):
        """
        Analyze packaging image for potential counterfeits
        Returns structure compatible with frontend PackagingAnalysisResult
        """
        try:
            img = Image.open(image_path)
            
            # 1. Run internal analysis helpers
            quality = self._check_image_quality(img)
            sharpness = self._check_sharpness(img)
            
            # 2. Calculate Text Clarity Score
            # Normalize sharpness variance (approx >100 is good) to a 0-10 scale
            # (Variance of 200 = 4.0)
            raw_variance = sharpness.get('variance', 0)
            text_clarity_score = min(float(raw_variance) / 50.0, 10.0)

            # 3. Identify Defects (REVISED with new 4.0 Clarity rule)
            defects = []
            
            # NEW RULE: Text Clarity must be >= 4.0
            MIN_CLARITY_THRESHOLD = 4.0
            if text_clarity_score < MIN_CLARITY_THRESHOLD:
                defects.append(f"Low Text Clarity ({text_clarity_score:.1f} < {MIN_CLARITY_THRESHOLD:.1f})")
            
            if not quality.get('is_acceptable', True):
                defects.append("Low Image Resolution")

            # 4. Compare with reference (if available)
            similarity_score = 0.0
            logo_check_skipped = True
            
            if product_name and product_name in self.reference_images:
                logo_check_skipped = False
                similarity_score = self._compare_with_reference(
                    img, 
                    self.reference_images[product_name]
                )
                if similarity_score < 0.7:
                    defects.append("Logo/Design Mismatch")
            
            # 5. Determine Authenticity 
            is_suspicious = len(defects) > 0
            is_authentic = not is_suspicious
            
            # FIX from previous step: If basic checks passed BUT logo check was skipped,
            # we must downgrade the result to inconclusive/not authentic.
            if is_authentic and product_name and logo_check_skipped:
                is_authentic = False
                defects.append("Logo/Design Check SKIPPED (Reference Image Missing)")


            # 6. Final Scores
            logo_match_percent = float(similarity_score * 100)

            # 7. Construct Response
            message = ""
            if is_authentic:
                message = "Packaging appears authentic and meets quality standards."
            else:
                 message = f"Potential issue detected. Reasons: {', '.join(defects)}"

            return {
                "is_authentic": bool(is_authentic),
                "message": message,
                "details": {
                    "defects_found": defects,
                    "logo_match_percent": logo_match_percent,
                    "text_clarity_score": text_clarity_score
                }
            }
            
        except Exception as e:
            # Return a safe failure response that won't crash the frontend
            print(f"Analysis Error: {e}")
            return {
                "is_authentic": False,
                "message": f"Analysis failed: {str(e)}",
                "details": {
                    "defects_found": ["System Error"],
                    "logo_match_percent": 0.0,
                    "text_clarity_score": 0.0
                }
            }
    
    def _check_image_quality(self, img):
        """Check basic image quality metrics"""
        width, height = img.size
        
        return {
            'resolution': f"{width}x{height}",
            'aspect_ratio': width/height,
            'is_acceptable': width >= 640 and height >= 480
        }
    
    def _analyze_colors(self, img):
        """Analyze color distribution"""
        img_array = np.array(img)
        
        if len(img_array.shape) == 3:
            mean_color = img_array.mean(axis=(0,1))
            return {
                'mean_rgb': mean_color.tolist(),
                'brightness': float(mean_color.mean())
            }
        else:
            return {'brightness': float(img_array.mean())}
    
    def _check_sharpness(self, img):
        """Check image sharpness (simple variance method)"""
        gray = img.convert('L')
        array = np.array(gray)
        variance = array.var()
        
        return {
            'variance': float(variance),
            'is_sharp': bool(variance > 100)
        }
    
    def _compare_with_reference(self, img1, img2):
        """Compare two images and return similarity score"""
        # Resize both to same size
        size = (224, 224)
        img1_resized = img1.resize(size)
        img2_resized = img2.resize(size)
        
        # Convert to arrays
        arr1 = np.array(img1_resized).flatten()
        arr2 = np.array(img2_resized).flatten()
        
        # Calculate cosine similarity
        dot_product = np.dot(arr1, arr2)
        norm1 = np.linalg.norm(arr1)
        norm2 = np.linalg.norm(arr2)
        
        similarity = dot_product / (norm1 * norm2)
        
        return float(similarity)