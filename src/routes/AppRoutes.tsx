import { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { OnboardingData } from "@/components/OnboardingForm";

// Pages
import DashboardPage from "@/pages/Dashboard";
import WorkoutsPage from "@/pages/Workouts";
import NutritionPage from "@/pages/Nutrition";
import ProgressPage from "@/pages/Progress";
import PhotosPage from "@/pages/Photos";
import AccountabilityPage from "@/pages/Accountability";
import CommitmentsPage from "@/pages/Commitments";
import ProfilePage from "@/pages/Profile";

export const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setUserData({
            weight: Number(profile.weight),
            height: Number(profile.height),
            age: profile.age,
            gender: profile.gender,
            goal: profile.goal as "bulk" | "cut" | "maintain",
            experience: profile.experience as
              | "beginner"
              | "intermediate"
              | "advanced",
            dietaryPreference: profile.dietary_preference,
          });
        } else {
          // No profile, redirect to onboarding
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout onSignOut={handleSignOut}>
      <Routes>
        <Route
          path="/"
          element={
            location.pathname === "/dashboard" ? (
              <DashboardPage userData={userData} userId={user!.id} />
            ) : location.pathname === "/workouts" ? (
              <WorkoutsPage userData={userData} userId={user!.id} />
            ) : location.pathname === "/nutrition" ? (
              <NutritionPage userData={userData} userId={user!.id} />
            ) : location.pathname === "/progress" ? (
              <ProgressPage userId={user!.id} />
            ) : location.pathname === "/photos" ? (
              <PhotosPage userId={user!.id} />
            ) : location.pathname === "/accountability" ? (
              <AccountabilityPage userId={user!.id} />
            ) : location.pathname === "/commitments" ? (
              <CommitmentsPage userId={user!.id} />
            ) : location.pathname === "/profile" ? (
              <ProfilePage userId={user!.id} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
      </Routes>
    </MainLayout>
  );
};
