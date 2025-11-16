import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { api } from "../lib/apiService"; // ⬅️ IMPORT API SERVICE
import { useAuth } from "../context/AuthContext"; // ⬅️ IMPORT AUTH HOOK

// Define a type for the AI response
interface QualityResponse {
  quality_score: number;
  quality_status: string;
  recommendation: string;
}

export function MyProject() {
  const { token } = useAuth(); // Get auth state
  
  // State for form inputs
  const [productId, setProductId] = useState("1");
  const [temperature, setTemperature] = useState("15.0");
  const [humidity, setHumidity] = useState("60.0");
  
  // State for results
  const [qualityResult, setQualityResult] = useState<QualityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [packageResult, setPackageResult] = useState<any>(null); // Use 'any' for unknown structure

  // Handler for Quality Prediction
  const handleQualityCheck = async () => {
    setIsLoading(true);
    setError(null);
    setQualityResult(null);

    try {
      const payload = {
        product_id: parseInt(productId),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        // Add other optional fields if needed
      };
      // 🚀 REAL API CALL
      const data = await api.post("/ai/predict-quality", payload);
      setQualityResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Package Analysis
  const handlePackageAnalysis = async () => {
    if (!selectedFile) {
        setError("Please select a file to analyze.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setPackageResult(null);

    try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        // 🚀 REAL API CALL (as multipart/form-data)
        const data = await api.post("/ai/analyze-packaging", formData as any, true);
        setPackageResult(data);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };


  // If no token, show login prompt
  if (!token) {
    return (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You must be logged in to use the AI features.
            </AlertDescription>
        </Alert>
    );
  }

  // Main component render
  return (
    <div className="container mx-auto p-4 grid gap-4 md:grid-cols-2">
      {/* Quality Prediction Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Quality Prediction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-id">Product ID</Label>
            <Input id="product-id" value={productId} onChange={(e) => setProductId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Current Temperature (°C)</Label>
            <Input id="temperature" type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="humidity">Current Humidity (%)</Label>
            <Input id="humidity" type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} />
          </div>
          <Button onClick={handleQualityCheck} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Predict Quality"}
          </Button>
          {qualityResult && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Prediction Result</AlertTitle>
              <AlertDescription>
                <p>Status: {qualityResult.quality_status}</p>
                <p>Score: {qualityResult.quality_score.toFixed(2)}</p>
                <p>Recommendation: {qualityResult.recommendation}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Package Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Package Analysis (Counterfeit)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="package-file">Upload Package Image</Label>
            <Input id="package-file" type="file" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          </div>
          <Button onClick={handlePackageAnalysis} disabled={isLoading || !selectedFile}>
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </Button>
          {packageResult && (
            <Alert variant={packageResult.is_suspicious ? "destructive" : "default"}>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Analysis Result</AlertTitle>
              <AlertDescription>
                <p>Suspicious: {packageResult.is_suspicious ? "Yes" : "No"}</p>
                <p>Confidence: {packageResult.confidence.toFixed(2)}%</p>
                <p>Reason: {packageResult.reason}</p>
                {packageResult.report_id && <p>Report ID: {packageResult.report_id}</p>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="md:col-span-2">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}