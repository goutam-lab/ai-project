import re
from datetime import datetime

# NLP-based Label Validation (Simplified)

class LabelValidator:
    """
    Validates medicine labels using NLP techniques
    Checks expiry dates, batch numbers, and label text
    """
    
    def __init__(self):
        self.required_fields = [
            'medicine_name',
            'batch_number',
            'expiry_date',
            'manufacturer'
        ]
    
    def validate_label(self, label_text):
        """
        Extract and validate information from label text
        """
        
        results = {
            'is_valid': True,
            'missing_fields': [],
            'warnings': [],
            'extracted_info': {}
        }
        
        # Extract expiry date
        expiry = self._extract_expiry_date(label_text)
        if expiry:
            results['extracted_info']['expiry_date'] = expiry
            if self._is_expired(expiry):
                results['warnings'].append("Medicine is expired")
                results['is_valid'] = False
        else:
            results['missing_fields'].append('expiry_date')
        
        # Extract batch number
        batch = self._extract_batch_number(label_text)
        if batch:
            results['extracted_info']['batch_number'] = batch
        else:
            results['missing_fields'].append('batch_number')
        
        # Check for required text
        if not self._contains_manufacturer_info(label_text):
            results['missing_fields'].append('manufacturer')
        
        results['is_valid'] = len(results['missing_fields']) == 0
        
        return results
    
    def _extract_expiry_date(self, text):
        """Extract expiry date from text"""
        # Common patterns: EXP: MM/YYYY, Expiry: DD/MM/YYYY
        patterns = [
            r'EXP[:\s]+(\d{2}/\d{4})',
            r'Expiry[:\s]+(\d{2}/\d{2}/\d{4})',
            r'Best Before[:\s]+(\d{2}/\d{4})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def _extract_batch_number(self, text):
        """Extract batch number from text"""
        # Pattern: Batch: XXXNNNN or Lot: XXXNNNN
        pattern = r'(?:Batch|Lot)[:\s]+([A-Z0-9]+)'
        match = re.search(pattern, text, re.IGNORECASE)
        
        if match:
            return match.group(1)
        
        return None
    
    def _is_expired(self, expiry_str):
        """Check if medicine is expired"""
        try:
            # Try different date formats
            formats = ['%m/%Y', '%d/%m/%Y', '%m/%d/%Y']
            expiry_date = None
            
            for fmt in formats:
                try:
                    expiry_date = datetime.strptime(expiry_str, fmt)
                    break
                except:
                    continue
            
            if expiry_date:
                return expiry_date < datetime.now()
        except:
            pass
        
        return False
    
    def _contains_manufacturer_info(self, text):
        """Check if manufacturer information is present"""
        keywords = ['manufactured by', 'mfg by', 'made by', 'produced by']
        return any(keyword in text.lower() for keyword in keywords)
    
    def verify_batch_authenticity(self, batch_number, database_batches):
        """
        Verify if batch number exists in authentic database
        """
        
        if batch_number in database_batches:
            return {
                'is_authentic': True,
                'confidence': 100,
                'message': "Batch number verified in database"
            }
        else:
            # Check for similar batch numbers (possible typo)
            similar = self._find_similar_batches(batch_number, database_batches)
            
            if similar:
                return {
                    'is_authentic': False,
                    'confidence': 50,
                    'message': f"Batch not found. Did you mean: {similar[0]}?",
                    'suggestions': similar
                }
            else:
                return {
                    'is_authentic': False,
                    'confidence': 0,
                    'message': "Batch number not found in database - possible counterfeit"
                }
    
    def _find_similar_batches(self, batch, database, max_distance=2):
        """Find similar batch numbers using Levenshtein distance"""
        from difflib import get_close_matches
        return get_close_matches(batch, database, n=3, cutoff=0.6)