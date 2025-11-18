// ai-medicheck/src/pages/AdminModels.tsx

import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Cpu,
  RefreshCw,
  Gauge,
  FileText,
  Image,
  Calendar,
  Zap,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is available for notifications

// --- Data Interfaces ---
interface AIModel {
  id: string;
  name: string;
  type: "Regression" | "Classification" | "NLP" | "Computer Vision";
  task: string;
  version: string;
  status: "Active" | "Training" | "Needs Retrain" | "Deployed";
  accuracy: number; // or F1-Score
  lastTrained: string;
}

// --- Mock Data ---
const mockModels: AIModel[] = [
  {
    id: "M001",
    name: "Quality Predictor",
    type: "Regression",
    task: "Predict remaining product quality (%)",
    version: "2.1.0",
    status: "Deployed",
    accuracy: 94.5,
    lastTrained: "2024-10-20",
  },
  {
    id: "M002",
    name: "Anomaly Detector",
    type: "Classification",
    task: "Detect abnormal storage conditions",
    version: "1.5.2",
    status: "Needs Retrain",
    accuracy: 88.2,
    lastTrained: "2024-08-15",
  },
  {
    id: "M003",
    name: "Label Validator (NLP)",
    type: "NLP",
    task: "Extract and validate label information",
    version: "3.0.1",
    status: "Active",
    accuracy: 99.1,
    lastTrained: "2024-11-01",
  },
  {
    id: "M004",
    name: "Packaging Analyzer (CV)",
    type: "Computer Vision",
    task: "Identify packaging defects and logo authenticity",
    version: "2.2.0",
    status: "Deployed",
    accuracy: 96.7,
    lastTrained: "2024-10-15",
  },
];

const getStatusBadgeVariant = (status: AIModel["status"]) => {
  switch (status) {
    case "Active":
    case "Deployed":
      return "default";
    case "Training":
      return "secondary";
    case "Needs Retrain":
      return "destructive";
    default:
      return "outline";
  }
};

export default function AdminModels() {
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [trainingModelId, setTrainingModelId] = useState<string | null>(null);

  const handleRetrain = (modelId: string, modelName: string) => {
    if (trainingModelId) return; // Prevent multiple training sessions

    setTrainingModelId(modelId);
    toast.info(`Retraining ${modelName} started...`, {
      description: "This process may take several minutes.",
    });

    // Simulate API call for retraining
    setTimeout(() => {
      setModels((prevModels) =>
        prevModels.map((model) =>
          model.id === modelId
            ? {
                ...model,
                status: "Active",
                accuracy: 95.0 + Math.random() * 2, // Simulate improved accuracy
                lastTrained: new Date().toISOString().slice(0, 10),
              }
            : model,
        ),
      );
      setTrainingModelId(null);
      toast.success(`${modelName} Retrained Successfully!`, {
        description: "New accuracy achieved.",
        icon: <CheckCircle className="h-4 w-4" />,
      });
    }, 5000); // 5 second simulation
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Cpu className="mr-3 h-7 w-7" />
          AI Model Management
        </h1>
        <Button onClick={() => toast.info("Synchronization triggered.")}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync from Registry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployed AI Models</CardTitle>
          <CardDescription>
            Overview and management of core machine learning models in the AI
            MediCheck system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Trained</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">
                    {model.name}
                    <Badge variant="outline" className="ml-2 text-xs">
                      v{model.version}
                    </Badge>
                  </TableCell>
                  <TableCell>{model.task}</TableCell>
                  <TableCell>{model.type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={model.accuracy}
                        className="w-16 h-2"
                      />
                      <span className="text-sm font-semibold">
                        {model.accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(model.status)}>
                      {model.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1 inline-block" />
                    {model.lastTrained}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetrain(model.id, model.name)}
                      disabled={model.status === "Training" || trainingModelId === model.id}
                    >
                      {trainingModelId === model.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="mr-2 h-4 w-4" />
                      )}
                      {trainingModelId === model.id ? "Training..." : "Retrain"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModelStatCard
          icon={Gauge}
          title="Average Accuracy"
          value="94.6%"
          description="Across all deployed models."
        />
        <ModelStatCard
          icon={RefreshCw}
          title="Models Needing Retrain"
          value={models.filter(m => m.status === "Needs Retrain").length}
          description="Check for data drift."
        />
        <ModelStatCard
          icon={Cpu}
          title="Active Model Version"
          value={mockModels.reduce((max, m) => (m.version > max ? m.version : max), "")}
          description="Highest version deployed."
        />
      </div>
    </div>
  );
}

// --- Helper Component for Stats ---
function ModelStatCard({ icon: Icon, title, value, description }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}