import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { OnboardingForm, OnboardingData } from "@/components/OnboardingForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type ViewState = "hero" | "onboarding" | "generating";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [view, setView] = useState<ViewState>("hero");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          // User has profile, redirect to dashboard with proper navigation
          navigate("/dashboard");
        } else {
          setView("onboarding");
        }
      } else {
        setView("hero");
      }
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading, navigate]);

  const handleGetStarted = () => {
    if (user) {
      setView("onboarding");
    } else {
      navigate("/auth");
    }
  };

  const handleOnboardingSubmit = async (data: OnboardingData) => {
    if (!user) return;
    
    setIsLoading(true);
    setView("generating");

    try {
      // Save profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          weight: data.weight,
          height: data.height,
          age: data.age,
          gender: data.gender,
          goal: data.goal,
          experience: data.experience,
          dietary_preference: data.dietaryPreference,
        });

      if (profileError) throw profileError;

      // Generate fitness plan using AI
      const { error: planError } = await supabase.functions.invoke(
        'generate-fitness-plan',
        {
          body: { userData: data }
        }
      );

      if (planError) throw planError;

      toast({
        title: "Your plan is ready!",
        description: "AI has created a personalized fitness plan just for you.",
      });

      // Redirect to dashboard with proper navigation
      navigate("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      setView("onboarding");
      toast({
        variant: "destructive",
        title: "Error creating plan",
        description: error.message || "Failed to generate your fitness plan. Please try again.",
      });
    }
  };

  const handleBack = () => {
    setView("hero");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {view === "hero" && <Hero onGetStarted={handleGetStarted} />}
      {view === "onboarding" && user && (
        <OnboardingForm 
          onSubmit={handleOnboardingSubmit} 
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}
      {view === "generating" && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Creating your personalized plan...</p>
        </div>
      )}
    </>
  );
};

export default Index;
