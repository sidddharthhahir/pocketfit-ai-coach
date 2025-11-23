import { useState } from "react";
import { Hero } from "@/components/Hero";
import { OnboardingForm, OnboardingData } from "@/components/OnboardingForm";
import { Dashboard } from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";

type ViewState = "hero" | "onboarding" | "dashboard";

const Index = () => {
  const [view, setView] = useState<ViewState>("hero");
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetStarted = () => {
    setView("onboarding");
  };

  const handleOnboardingSubmit = async (data: OnboardingData) => {
    setIsLoading(true);
    setUserData(data);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      setView("dashboard");
      toast({
        title: "Your plan is ready!",
        description: "We've created a personalized fitness plan just for you.",
      });
    }, 2000);
  };

  const handleBack = () => {
    setView("hero");
  };

  return (
    <>
      {view === "hero" && <Hero onGetStarted={handleGetStarted} />}
      {view === "onboarding" && (
        <OnboardingForm 
          onSubmit={handleOnboardingSubmit} 
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}
      {view === "dashboard" && userData && (
        <Dashboard userData={userData} aiResponse={aiResponse} />
      )}
    </>
  );
};

export default Index;
