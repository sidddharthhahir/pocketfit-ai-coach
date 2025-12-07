import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { onboardingSchema, type OnboardingFormData } from "@/lib/validationSchemas";
import { toast } from "sonner";

export interface OnboardingData {
  weight: number;
  height: number;
  age: number;
  gender: string;
  goal: "bulk" | "cut" | "maintain";
  experience: "beginner" | "intermediate" | "advanced";
  dietaryPreference: string;
}

interface OnboardingFormProps {
  onSubmit: (data: OnboardingData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  weight?: string;
  height?: string;
  age?: string;
  gender?: string;
  goal?: string;
  experience?: string;
  dietaryPreference?: string;
}

export const OnboardingForm = ({ onSubmit, onBack, isLoading }: OnboardingFormProps) => {
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate using zod schema
    const result = onboardingSchema.safeParse(formData);
    
    if (!result.success) {
      // Map zod errors to form errors
      const newErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (field) {
          newErrors[field] = err.message;
        }
      });
      setErrors(newErrors);
      toast.error("Please fix the validation errors");
      return;
    }
    
    // Submit validated data
    onSubmit(result.data as OnboardingData);
  };

  const isFormValid = () => {
    return formData.weight && formData.height && formData.age && 
           formData.gender && formData.goal && formData.experience && 
           formData.dietaryPreference;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-card border-border">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
          <p className="text-muted-foreground">
            We need some information to create your personalized fitness plan
          </p>
        </div>

        <form onSubmit={validateAndSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                min={20}
                max={500}
                value={formData.weight || ""}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                className={errors.weight ? "border-destructive" : ""}
                required
              />
              {errors.weight && (
                <p className="text-sm text-destructive">{errors.weight}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                min={50}
                max={300}
                value={formData.height || ""}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                className={errors.height ? "border-destructive" : ""}
                required
              />
              {errors.height && (
                <p className="text-sm text-destructive">{errors.height}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                min={13}
                max={120}
                value={formData.age || ""}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className={errors.age ? "border-destructive" : ""}
                required
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger id="gender" className={errors.gender ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Fitness Goal</Label>
              <Select 
                value={formData.goal} 
                onValueChange={(value) => setFormData({ ...formData, goal: value as OnboardingData["goal"] })}
              >
                <SelectTrigger id="goal" className={errors.goal ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulk">Build Muscle (Bulk)</SelectItem>
                  <SelectItem value="cut">Lose Fat (Cut)</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                </SelectContent>
              </Select>
              {errors.goal && (
                <p className="text-sm text-destructive">{errors.goal}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select 
                value={formData.experience} 
                onValueChange={(value) => setFormData({ ...formData, experience: value as OnboardingData["experience"] })}
              >
                <SelectTrigger id="experience" className={errors.experience ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.experience && (
                <p className="text-sm text-destructive">{errors.experience}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="diet">Dietary Preference</Label>
              <Select 
                value={formData.dietaryPreference} 
                onValueChange={(value) => setFormData({ ...formData, dietaryPreference: value })}
              >
                <SelectTrigger id="diet" className={errors.dietaryPreference ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select dietary preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indian">Indian Food</SelectItem>
                  <SelectItem value="german">German Food</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="egg">Egg-based Diet</SelectItem>
                  <SelectItem value="student">Student Budget Meals</SelectItem>
                  <SelectItem value="any">No Preference</SelectItem>
                </SelectContent>
              </Select>
              {errors.dietaryPreference && (
                <p className="text-sm text-destructive">{errors.dietaryPreference}</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full text-lg"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Your Plan...
              </>
            ) : (
              "Generate My Plan"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};
