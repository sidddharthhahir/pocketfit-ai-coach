import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, Flame, Dumbbell, Camera, ArrowLeft } from "lucide-react";
import { format, subDays } from "date-fns";

interface PublicData {
  username: string;
  display_name: string | null;
  bio: string | null;
  goal: string;
  workouts: number;
  checkins: number;
  streak: number;
}

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PublicData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!username) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, bio, goal, public_enabled")
        .ilike("username", username)
        .maybeSingle();

      if (!profile || !profile.public_enabled) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const since = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const [{ count: workouts }, { count: checkins }, { data: recent }] = await Promise.all([
        supabase.from("workout_logs").select("*", { count: "exact", head: true })
          .eq("user_id", profile.user_id).gte("workout_date", since),
        supabase.from("gym_checkins").select("*", { count: "exact", head: true })
          .eq("user_id", profile.user_id).gte("date", since),
        supabase.from("gym_checkins").select("date").eq("user_id", profile.user_id)
          .order("date", { ascending: false }).limit(60),
      ]);

      // streak calc
      let streak = 0;
      const dates = new Set((recent || []).map((r: any) => r.date));
      let cursor = new Date();
      while (dates.has(format(cursor, "yyyy-MM-dd"))) {
        streak++;
        cursor = subDays(cursor, 1);
      }

      setData({
        username: profile.username!,
        display_name: profile.display_name,
        bio: profile.bio,
        goal: profile.goal,
        workouts: workouts || 0,
        checkins: checkins || 0,
        streak,
      });
      setLoading(false);
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground mb-4">
            This profile doesn't exist or hasn't been made public.
          </p>
          <Link to="/" className="text-primary hover:underline">Go home</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> BoomStartAI
        </Link>

        <Card className="p-8 shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {(data.display_name || data.username)[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{data.display_name || data.username}</h1>
              <p className="text-muted-foreground">@{data.username} · Goal: {data.goal}</p>
            </div>
          </div>
          {data.bio && <p className="text-foreground/80 mb-6">{data.bio}</p>}

          <div className="grid grid-cols-3 gap-4 mt-6">
            <Stat icon={<Flame className="w-5 h-5 text-accent" />} label="Day streak" value={data.streak} />
            <Stat icon={<Dumbbell className="w-5 h-5 text-primary" />} label="Workouts (30d)" value={data.workouts} />
            <Stat icon={<Camera className="w-5 h-5 text-secondary" />} label="Check-ins (30d)" value={data.checkins} />
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Powered by <Link to="/" className="text-primary hover:underline">BoomStartAI</Link>
        </p>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="text-center p-4 rounded-lg bg-muted/40">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default PublicProfilePage;
