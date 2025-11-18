// ai-medicheck/src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/apiService";

// --- UI Components ---
import Navigation from "@/components/Navigation"; // For the top navbar
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // For the graph
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Image,
  Loader2,
  Package,
  Thermometer,
  Zap,
} from "lucide-react";

// --- Data Interfaces ---

interface Product {
  id: number;
  name: string;
  batch_number: string;
  status: string;
}

// --- AI Model Interfaces ---

interface SmartAnalysisResult {
  product_id: number;
  product_name: string;
  quality_prediction: {
    predicted_quality: number;
    status: string;
  };
  anomaly_detection: {
    is_anomaly: boolean;
    reason: string;
  };
}

interface DegradationPoint {
  day: number;
  predicted_quality: number;
}

interface LabelValidationResult {
  is_valid: boolean;
  message: string;
  details?: { // <-- *** FIX 1: 'details' is now optional ***
    batch_number_found?: string;
    expiry_date_found?: string;
    is_expired?: boolean;
    is_known_fake?: boolean;
  };
}

interface PackagingAnalysisResult {
  is_authentic: boolean;
  message: string;
  details?: { // <-- THIS IS THE FIX
    defects_found: string[];
    logo_match_percent: number;
    text_clarity_score: number;
  };
}

// --- Helper Functions ---

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

/**
 * Main User Dashboard Component
 * Integrates all AI models into a functional UI.
 */
export function Dashboard() {
  const { user, token } = useAuth();

  // --- Data States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- AI Result States ---
  const [analysisResult, setAnalysisResult] =
    useState<SmartAnalysisResult | null>(null);
  const [degradationData, setDegradationData] = useState<DegradationPoint[]>(
    [],
  );
  const [labelResult, setLabelResult] = useState<LabelValidationResult | null>(
    null,
  );
  const [packagingResult, setPackagingResult] =
    useState<PackagingAnalysisResult | null>(null);

  // --- Form Input States ---
  const [labelText, setLabelText] = useState("");
  const [packageImage, setPackageImage] = useState<File | null>(null);

  // --- Loading & Error States ---
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isLabelLoading, setIsLabelLoading] = useState(false);
  const [isPackagingLoading, setIsPackagingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Initial Data Fetch (User's Products) ---
  useEffect(() => {
    // This effect runs once the user is confirmed to be logged in
    if (token && user) {
      api
        .get("/dashboard/products/summary") // <-- Corrected path
        .then(setProducts)
        .catch((err) =>
          setError(err.message || "Failed to fetch products."),
        )
        .finally(() => setIsProductsLoading(false));
    }
  }, [token, user]); // Runs when auth status is confirmed

  // --- AI Function: Smart Analysis & Degradation (Model 1 & 2) ---
  const handleProductSelect = async (product: Product) => {
    setSelectedProduct(product);
    setIsAnalysisLoading(true);
    setAnalysisResult(null);
    setDegradationData([]);

    try {
      // Run both AI predictions in parallel
      const [analysis, degradation] = await Promise.all([
        api.post("/ai/smart-analysis", { product_id: product.id }),
        api.post("/ai/predict-degradation-timeline", {
          product_id: product.id,
        }),
      ]);
      setAnalysisResult(analysis);
      setDegradationData(degradation.timeline);
    } catch (err: any) {
      setError(err.message || "Failed to run AI analysis.");
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  // --- AI Function: Label Validation (Model 3) ---
  const handleLabelValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelText) return;
    setIsLabelLoading(true);
    setLabelResult(null);
    try {
      const result = await api.post("/ai/validate-label", {
        label_text: labelText,
      });
      setLabelResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to validate label.");
    } finally {
      setIsLabelLoading(false);
    }
  };

  // --- AI Function: Packaging Analysis (Model 4) ---
  const handlePackagingAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageImage) return;
    setIsPackagingLoading(true);
    setPackagingResult(null);

    const formData = new FormData();
    formData.append("file", packageImage);

    try {
      const result = await api.post(
        "/ai/analyze-packaging",
        formData as any,
        true,
      );
      setPackagingResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze packaging.");
    } finally {
      setIsPackagingLoading(false);
    }
  };

  // --- Auth Guards ---
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!user) {
    return <Skeleton className="h-screen w-full" />;
  }

  // --- Render Component ---
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navigation />
      <main className="flex-grow bg-muted/40 p-4 md:p-8">
        <div className="container mx-auto">
          <Tabs defaultValue="dashboard">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="dashboard">
                <Package className="mr-2 h-4 w-4" />
                My Products
              </TabsTrigger>
              <TabsTrigger value="counterfeit">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Counterfeit Check
              </TabsTrigger>
            </TabsList>

            {/* --- TAB 1: USER PRODUCT DASHBOARD --- */}
            <TabsContent value="dashboard">
              <Card>
                <CardHeader>
                  <CardTitle>Product Dashboard</CardTitle>
                  <CardDescription>
                    Select a product from your list to run AI analysis and
                    forecast its quality.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left Column: Product List */}
                  <div className="lg:col-span-1">
                    <ProductList
                      products={products}
                      isLoading={isProductsLoading}
                      onSelect={handleProductSelect}
                      selectedProductId={selectedProduct?.id}
                    />
                  </div>

                  {/* Right Column: AI Analysis */}
                  <div className="lg:col-span-2">
                    {!selectedProduct ? (
                      <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-background/50">
                        <p className="text-muted-foreground">
                          Select a product to view AI insights
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <SmartAnalysisCard
                          result={analysisResult}
                          isLoading={isAnalysisLoading}
                        />
                        <DegradationChart
                          data={degradationData}
                          isLoading={isAnalysisLoading}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 2: COUNTERFEIT CHECK --- */}
            <TabsContent value="counterfeit">
              <Card>
                <CardHeader>
                  <CardTitle>Counterfeit Check Tools</CardTitle>
                  <CardDescription>
                    Use our AI models to detect signs of counterfeit
                    medication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Label Validator Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Label Validator (NLP)
                      </CardTitle>
                      <CardDescription>
                        Paste text from a label to check for fake batch
                        numbers or expired dates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleLabelValidate}
                        className="flex flex-col gap-4"
                      >
                        <Input
                          placeholder="Paste label text here..."
                          value={labelText}
                          onChange={(e) => setLabelText(e.target.value)}
                        />
                        <Button
                          type="submit"
                          disabled={isLabelLoading || !labelText}
                        >
                          {isLabelLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Validate Label
                        </Button>
                      </form>
                      {labelResult && (
                        <LabelResultAlert result={labelResult} />
                      )}
                    </CardContent>
                  </Card>

                  {/* Packaging Analyzer Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Image className="mr-2 h-5 w-5" />
                        Packaging Analyzer (CV)
                      </CardTitle>
                      <CardDescription>
                        Upload a photo of the packaging to check for visual
                        defects or logo mismatch.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handlePackagingAnalyze}
                        className="flex flex-col gap-4"
                      >
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setPackageImage(e.target.files?.[0] || null)
                          }
                        />
                        <Button
                          type="submit"
                          disabled={isPackagingLoading || !packageImage}
                        >
                          {isPackagingLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Analyze Packaging
                        </Button>
                      </form>
                      {packagingResult && (
                        <PackagingResultAlert result={packagingResult} />
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Global Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Sub-components for Readability ---

/**
 * Renders the list of user's products.
 */
function ProductList({
  products,
  isLoading,
  onSelect,
  selectedProductId,
}: {
  products: Product[];
  isLoading: boolean;
  onSelect: (product: Product) => void;
  selectedProductId?: number;
}) {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Batch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                onClick={() => onSelect(product)}
                className={`cursor-pointer ${
                  selectedProductId === product.id ? "bg-muted" : ""
                }`}
              >
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.batch_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * Renders the "Smart Analysis" result card.
 */
function SmartAnalysisCard({
  result,
  isLoading,
}: {
  result: SmartAnalysisResult | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }
  if (!result) {
    return null; // No product selected yet
  }

  const isAnomaly = result.anomaly_detection.is_anomaly;
  const quality = result.quality_prediction.predicted_quality.toFixed(0);

  return (
    <Card
      className={
        isAnomaly ? "border-red-500" : "border-green-500"
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Smart Analysis for {result.product_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
          <span className="text-sm text-muted-foreground">
            Predicted Quality
          </span>
          <span
            className={`text-5xl font-bold ${
              +quality > 80 ? "text-green-600" : "text-amber-600"
            }`}
          >
            {quality}%
          </span>
          <span className="text-lg">
            {result.quality_prediction.status}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
          <span className="text-sm text-muted-foreground">
            Storage Anomaly
          </span>
          {isAnomaly ? (
            <>
              <AlertTriangle className="h-12 w-12 text-red-600" />
              <span className="mt-2 text-lg font-bold text-red-600">
                Anomaly Detected!
              </span>
              <span className="text-center text-sm">
                {result.anomaly_detection.reason}
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="h-12 w-12 text-green-600" />
              <span className="mt-2 text-lg font-bold text-green-600">
                Conditions Normal
              </span>
              <span className="text-sm">
                {result.anomaly_detection.reason}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Renders the "Degradation Timeline" graph.
 */
function DegradationChart({
  data,
  isLoading,
}: {
  data: DegradationPoint[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  if (data.length === 0) {
    return null; // No data to show
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Quality Forecast</CardTitle>
        <CardDescription>
          Predicted quality degradation over the next 30 days under current
          conditions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", offset: -5 }} />
            <YAxis
              dataKey="predicted_quality"
              domain={[0, 100]}
              label={{ value: "Quality %", angle: -90, position: "insideLeft", offset: 10 }}
            />
            <Tooltip
              formatter={(value: number) => [
                `${value.toFixed(1)}%`,
                "Quality",
              ]}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="predicted_quality"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
              name="Predicted Quality"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Renders the result of the Label Validation.
 */
function LabelResultAlert({ result }: { result: LabelValidationResult }) {
  // --- *** FIX 2: This is the updated component *** ---
  const isValid = result.is_valid;
  return (
    <Alert
      variant={isValid ? "default" : "destructive"}
      className="mt-4"
    >
      {isValid ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertTitle>{isValid ? "Label Valid" : "Label Invalid"}</AlertTitle>
      <AlertDescription>
        {result.message}
        {/* We only render the <ul> if 'details' exists */}
        {result.details && (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {/* We use optional chaining (?.) for safety */}
            {result.details?.batch_number_found && (
              <li>
                Batch: <strong>{result.details.batch_number_found}</strong>
              </li>
            )}
            {result.details?.expiry_date_found && (
              <li>
                Expiry: <strong>{result.details.expiry_date_found}</strong>
              </li>
            )}
            {result.details?.is_expired && (
              <li className="font-bold">This product is EXPIRED.</li>
            )}
            {result.details?.is_known_fake && (
              <li className="font-bold">
                This batch number is a KNOWN FAKE.
              </li>
            )}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Renders the result of the Packaging Analysis.
 */
function PackagingResultAlert({
  result,
}: {
  result: PackagingAnalysisResult;
}) {
  const isAuth = result.is_authentic;
  return (
    <Alert variant={isAuth ? "default" : "destructive"} className="mt-4">
      {isAuth ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertTitle>
        {isAuth ? "Packaging Authentic" : "Counterfeit Warning"}
      </AlertTitle>
      <AlertDescription>
        {result.message}
        {/* --- THIS IS THE FIX --- */}
        {/* Only render the <ul> if 'details' exists */}
        {result.details && (
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>
              Logo Match:{" "}
              <strong>{result.details.logo_match_percent.toFixed(1)}%</strong>
            </li>
            <li>
              Text Clarity:{" "}
              <strong>
                {result.details.text_clarity_score.toFixed(1)} / 10
              </strong>
            </li>
            {result.details.defects_found.length > 0 && (
              <li>
                Defects:{" "}
                <strong>{result.details.defects_found.join(", ")}</strong>
              </li>
            )}
          </ul>
        )}
        {/* --- END OF FIX --- */}
      </AlertDescription>
    </Alert>
  );
}