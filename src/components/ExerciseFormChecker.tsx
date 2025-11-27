import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const ExerciseFormChecker = () => {
  const [exerciseName, setExerciseName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeForm = async () => {
    if (!imagePreview || !exerciseName) {
      toast.error("Please select an image and enter exercise name");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-exercise-form', {
        body: { imageData: imagePreview, exerciseName }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success("Form analysis complete!");
    } catch (error: any) {
      console.error('Error analyzing form:', error);
      toast.error(error.message || 'Failed to analyze form');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent':
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'needs_improvement':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'poor':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'moderate': return 'text-yellow-500';
      case 'minor': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">AI Form Checker</h3>
            <p className="text-sm text-muted-foreground">
              Upload a photo of your exercise form for AI analysis
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Exercise Name</label>
            <Input
              placeholder="e.g., Squat, Bench Press, Deadlift"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Upload Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo or upload an image
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Select Image
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null);
                    setAnalysis(null);
                  }}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          <Button 
            onClick={analyzeForm} 
            disabled={isAnalyzing || !imagePreview || !exerciseName}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Form...
              </>
            ) : (
              'Analyze My Form'
            )}
          </Button>
        </div>
      </Card>

      {analysis && (
        <Card className="p-6 border-border shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-semibold">Form Analysis Results</h4>
            <div className="flex items-center gap-2">
              {getRatingIcon(analysis.form_rating)}
              <span className="font-semibold capitalize">{analysis.form_rating}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-accent/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Form Score</span>
                <span className="text-2xl font-bold text-primary">{analysis.form_score}/100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysis.form_score}%` }}
                />
              </div>
            </div>

            {analysis.positive_points && analysis.positive_points.length > 0 && (
              <div>
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  What You're Doing Right
                </h5>
                <ul className="space-y-1">
                  {analysis.positive_points.map((point: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.issues && analysis.issues.length > 0 && (
              <div>
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Areas for Improvement
                </h5>
                <div className="space-y-3">
                  {analysis.issues.map((issue: any, idx: number) => (
                    <div key={idx} className="p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-sm font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{issue.issue}</p>
                      <p className="text-sm text-muted-foreground">✓ {issue.correction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.body_alignment && (
              <div>
                <h5 className="font-semibold mb-2">Body Alignment Check</h5>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(analysis.body_alignment).map(([part, assessment]: [string, any]) => (
                    <div key={part} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium capitalize mb-1">{part}</p>
                      <p className="text-xs text-muted-foreground">{assessment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-secondary/5 rounded-lg">
              <h5 className="font-semibold mb-2">Overall Feedback</h5>
              <p className="text-sm text-muted-foreground">{analysis.overall_feedback}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
