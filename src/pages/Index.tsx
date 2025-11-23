import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { OnboardingForm, OnboardingData } from "@/components/OnboardingForm";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type ViewState = "hero" | "onboarding" | "dashboard";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [view, setView] = useState<ViewState>("hero");
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
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
          setHasProfile(true);
          setUserData({
            weight: Number(profile.weight),
            height: Number(profile.height),
            age: profile.age,
            gender: profile.gender,
            goal: profile.goal as "bulk" | "cut" | "maintain",
            experience: profile.experience as "beginner" | "intermediate" | "advanced",
            dietaryPreference: profile.dietary_preference
          });
          setView("dashboard");
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
  }, [user, authLoading]);

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
    setUserData(data);

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
      const { data: planData, error: planError } = await supabase.functions.invoke(
        'generate-fitness-plan',
        {
          body: { userData: data }
        }
      );

      if (planError) throw planError;

      setIsLoading(false);
      setHasProfile(true);
      setView("dashboard");
      
      toast({
        title: "Your plan is ready!",
        description: "AI has created a personalized fitness plan just for you.",
      });
    } catch (error: any) {
      setIsLoading(false);
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
      {view === "dashboard" && user && userData && (
        <Dashboard userData={userData} userId={user.id} />
      )}
    </>
  );
};

export default Index;
