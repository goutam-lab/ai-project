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
        """
        
        try:
            img = Image.open(image_path)
            
            results = {
                'image_quality': self._check_image_quality(img),
                'color_analysis': self._analyze_colors(img),
                'sharpness': self._check_sharpness(img),
                'is_suspicious': False,
                'confidence': 0
            }
            
            # Compare with reference if available
            if product_name and product_name in self.reference_images:
                similarity = self._compare_with_reference(
                    img, 
                    self.reference_images[product_name]
                )
                results['similarity_score'] = similarity
                results['is_suspicious'] = similarity < 0.7
                results['confidence'] = abs(similarity - 0.7) * 100
            
            return results
            
        except Exception as e:
            return {'error': str(e)}
    
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
            'is_sharp': variance > 100
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