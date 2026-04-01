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
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";
  workoutDaysPerWeek: number;
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
  activityLevel?: string;
  workoutDaysPerWeek?: string;
}

const STEPS = [
  { title: "Body Stats", subtitle: "Let's start with your measurements" },
  { title: "Your Goals", subtitle: "What do you want to achieve?" },
  { title: "Lifestyle", subtitle: "Help us understand your daily routine" },
];

export const OnboardingForm = ({ onSubmit, onBack, isLoading }: OnboardingFormProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    activityLevel: undefined,
    workoutDaysPerWeek: undefined,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = onboardingSchema.safeParse(formData);

    if (!result.success) {
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

    onSubmit(result.data as OnboardingData);
  };

  const canProceed = () => {
    if (step === 0) {
      return formData.weight && formData.height && formData.age && formData.gender;
    }
    if (step === 1) {
      return formData.goal && formData.experience && formData.dietaryPreference;
    }
    if (step === 2) {
      return formData.activityLevel && formData.workoutDaysPerWeek;
    }
    return false;
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-card border-border">
        <Button variant="ghost" onClick={step === 0 ? onBack : prevStep} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 0 ? "Back" : "Previous"}
        </Button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{STEPS[step].title}</h2>
          <p className="text-muted-foreground">{STEPS[step].subtitle}</p>
        </div>

        <form onSubmit={validateAndSubmit} className="space-y-6">
          {/* Step 1: Body Stats */}
          {step === 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  min={20}
                  max={500}
                  step="0.1"
                  value={formData.weight || ""}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className={errors.weight ? "border-destructive" : ""}
                  required
                />
                {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                <p className="text-xs text-muted-foreground">Used to calculate your TDEE and protein needs</p>
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
                {errors.height && <p className="text-sm text-destructive">{errors.height}</p>}
                <p className="text-xs text-muted-foreground">Used in the Mifflin-St Jeor BMR formula</p>
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
                {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                <p className="text-xs text-muted-foreground">Affects your basal metabolic rate</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Biological Sex</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="gender" className={errors.gender ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                <p className="text-xs text-muted-foreground">Used for BMR calculation accuracy</p>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goal">What's your primary goal?</Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => setFormData({ ...formData, goal: value as OnboardingData["goal"] })}
                >
                  <SelectTrigger id="goal" className={errors.goal ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulk">Build Muscle — calorie surplus (+300 kcal)</SelectItem>
                    <SelectItem value="cut">Lose Fat — calorie deficit (-500 kcal)</SelectItem>
                    <SelectItem value="maintain">Maintain — eat at maintenance</SelectItem>
                  </SelectContent>
                </Select>
                {errors.goal && <p className="text-sm text-destructive">{errors.goal}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Training Experience</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => setFormData({ ...formData, experience: value as OnboardingData["experience"] })}
                >
                  <SelectTrigger id="experience" className={errors.experience ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner — less than 6 months of consistent training</SelectItem>
                    <SelectItem value="intermediate">Intermediate — 6 months to 2 years</SelectItem>
                    <SelectItem value="advanced">Advanced — 2+ years of consistent training</SelectItem>
                  </SelectContent>
                </Select>
                {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
              </div>

              <div className="space-y-2">
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
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="egg">Egg-based Diet</SelectItem>
                    <SelectItem value="student">Student Budget Meals</SelectItem>
                    <SelectItem value="any">No Preference</SelectItem>
                  </SelectContent>
                </Select>
                {errors.dietaryPreference && <p className="text-sm text-destructive">{errors.dietaryPreference}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle — the key to accurate TDEE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="activityLevel">Daily Activity Level (outside gym)</Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value) => setFormData({ ...formData, activityLevel: value as OnboardingData["activityLevel"] })}
                >
                  <SelectTrigger id="activityLevel" className={errors.activityLevel ? "border-destructive" : ""}>
                    <SelectValue placeholder="How active are you day-to-day?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary — desk job, minimal walking</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active — walk 4,000-7,000 steps/day</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active — on feet at work, 7,000-10,000 steps</SelectItem>
                    <SelectItem value="very_active">Very Active — physical job, 10,000+ steps</SelectItem>
                    <SelectItem value="extra_active">Extra Active — manual labor or athlete</SelectItem>
                  </SelectContent>
                </Select>
                {errors.activityLevel && <p className="text-sm text-destructive">{errors.activityLevel}</p>}
                <p className="text-xs text-muted-foreground">
                  This is the #1 factor in calculating your daily calorie needs (TDEE). Be honest — overestimating leads to wrong calorie targets.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workoutDays">How many days per week can you realistically train?</Label>
                <Select
                  value={formData.workoutDaysPerWeek?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, workoutDaysPerWeek: Number(value) })}
                >
                  <SelectTrigger id="workoutDays" className={errors.workoutDaysPerWeek ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select workout days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 days — full body recommended</SelectItem>
                    <SelectItem value="3">3 days — full body or push/pull/legs</SelectItem>
                    <SelectItem value="4">4 days — upper/lower or push/pull split</SelectItem>
                    <SelectItem value="5">5 days — push/pull/legs or bro split</SelectItem>
                    <SelectItem value="6">6 days — PPL twice or high volume</SelectItem>
                  </SelectContent>
                </Select>
                {errors.workoutDaysPerWeek && <p className="text-sm text-destructive">{errors.workoutDaysPerWeek}</p>}
                <p className="text-xs text-muted-foreground">
                  Your workout plan will be built around this. Pick what you can stick to, not what sounds impressive.
                </p>
              </div>

              <Card className="p-4 bg-muted/30 border-border">
                <h4 className="font-medium text-sm mb-2">📐 How your plan is calculated</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>BMR</strong> = Mifflin-St Jeor equation (weight, height, age, sex)</li>
                  <li>• <strong>TDEE</strong> = BMR × activity multiplier</li>
                  <li>• <strong>Protein</strong> = 1.8g per kg bodyweight (range: 1.6–2.2g)</li>
                  <li>• <strong>Calorie target</strong> = TDEE ± surplus/deficit based on your goal</li>
                  <li>• <strong>Workout split</strong> = matched to your experience + available days</li>
                </ul>
              </Card>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="hero"
                size="lg"
                className="w-full text-lg"
                disabled={!canProceed()}
                onClick={nextStep}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full text-lg"
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Your Plan...
                  </>
                ) : (
                  "Generate My Personalized Plan"
                )}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
