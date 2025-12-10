import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Copy,
  Check,
  UserPlus,
  Loader2,
  Dumbbell,
  Camera,
  Flame,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek, subDays } from "date-fns";

interface AccountabilityPageProps {
  userId: string;
}

interface Buddy {
  id: string;
  user_id: string;
  buddy_user_id: string;
  created_at: string;
  buddyEmail?: string;
  stats?: {
    workouts_count: number;
    checkins_count: number;
    current_streak: number;
  };
}

interface Invite {
  id: string;
  invite_code: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export const AccountabilityPage = ({ userId }: AccountabilityPageProps) => {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [myInvite, setMyInvite] = useState<Invite | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myStats, setMyStats] = useState({
    workouts_count: 0,
    checkins_count: 0,
    current_streak: 0,
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadBuddies(), loadMyInvite(), loadMyStats()]);
    setIsLoading(false);
  };

  const loadBuddies = async () => {
    try {
      const { data, error } = await supabase
        .from("buddies")
        .select("*")
        .or(`user_id.eq.${userId},buddy_user_id.eq.${userId}`);

      if (error) throw error;

      // Get stats for each buddy
      const buddiesWithStats = await Promise.all(
        (data || []).map(async (buddy) => {
          const buddyUserId =
            buddy.user_id === userId ? buddy.buddy_user_id : buddy.user_id;
          const weekStart = format(
            startOfWeek(new Date(), { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          );

          const { data: statsData } = await supabase.rpc("get_buddy_weekly_stats", {
            target_user_id: buddyUserId,
            week_start: weekStart,
          });

          return {
            ...buddy,
            stats: statsData?.[0] || {
              workouts_count: 0,
              checkins_count: 0,
              current_streak: 0,
            },
          };
        })
      );

      setBuddies(buddiesWithStats);
    } catch (error) {
      console.error("Error loading buddies:", error);
    }
  };

  const loadMyInvite = async () => {
    try {
      const { data, error } = await supabase
        .from("buddy_invites")
        .select("*")
        .eq("inviter_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setMyInvite(data);
    } catch (error) {
      console.error("Error loading invite:", error);
    }
  };

  const loadMyStats = async () => {
    try {
      const weekStart = format(
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );

      const { data } = await supabase.rpc("get_buddy_weekly_stats", {
        target_user_id: userId,
        week_start: weekStart,
      });

      if (data?.[0]) {
        setMyStats(data[0]);
      }
    } catch (error) {
      console.error("Error loading my stats:", error);
    }
  };

  const createInvite = async () => {
    setIsCreatingInvite(true);
    try {
      // Generate unique code
      const { data: codeData } = await supabase.rpc("generate_invite_code");
      const code = codeData || Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data, error } = await supabase
        .from("buddy_invites")
        .insert({
          inviter_id: userId,
          invite_code: code,
        })
        .select()
        .single();

      if (error) throw error;
      setMyInvite(data);
      toast.success("Invite code created!");
    } catch (error: any) {
      console.error("Error creating invite:", error);
      toast.error("Failed to create invite");
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const copyInviteCode = () => {
    if (myInvite) {
      navigator.clipboard.writeText(myInvite.invite_code);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const acceptInvite = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setIsAccepting(true);
    try {
      // Use secure lookup function to find the invite (bypasses RLS safely)
      const { data: inviteData, error: findError } = await supabase.rpc(
        "lookup_buddy_invite",
        { p_invite_code: inviteCode }
      );

      if (findError) throw findError;
      
      const invite = inviteData?.[0];
      if (!invite) {
        toast.error("Invalid or expired invite code");
        return;
      }

      if (invite.inviter_id === userId) {
        toast.error("You can't accept your own invite!");
        return;
      }

      // Create buddy relationship (both directions)
      const { error: buddyError1 } = await supabase.from("buddies").insert({
        user_id: userId,
        buddy_user_id: invite.inviter_id,
      });

      if (buddyError1) throw buddyError1;

      const { error: buddyError2 } = await supabase.from("buddies").insert({
        user_id: invite.inviter_id,
        buddy_user_id: userId,
      });

      if (buddyError2) throw buddyError2;

      // Update invite status
      await supabase
        .from("buddy_invites")
        .update({ status: "accepted", invitee_id: userId })
        .eq("id", invite.id);

      setInviteCode("");
      await loadBuddies();
      toast.success("Buddy added successfully! 🎉");
    } catch (error: any) {
      console.error("Error accepting invite:", error);
      toast.error(error.message || "Failed to accept invite");
    } finally {
      setIsAccepting(false);
    }
  };

  const removeBuddy = async (buddyId: string) => {
    try {
      await supabase.from("buddies").delete().eq("id", buddyId);
      setBuddies(buddies.filter((b) => b.id !== buddyId));
      toast.success("Buddy removed");
    } catch (error) {
      console.error("Error removing buddy:", error);
      toast.error("Failed to remove buddy");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Accountability Buddy</h2>
        <p className="text-muted-foreground">
          Stay motivated with friends who can see your consistency.
        </p>
      </div>

      {/* My Stats Card */}
      <Card className="p-6 border-border shadow-card">
        <h3 className="font-semibold mb-4">Your This Week</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">{myStats.workouts_count}</div>
            <div className="text-xs text-muted-foreground">Workouts</div>
          </div>
          <div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
              <Camera className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-2xl font-bold">{myStats.checkins_count}</div>
            <div className="text-xs text-muted-foreground">Check-ins</div>
          </div>
          <div>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-6 h-6 text-accent" />
            </div>
            <div className="text-2xl font-bold">{myStats.current_streak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </Card>

      {/* Invite/Accept Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Generate Invite */}
        <Card className="p-6 border-border shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Invite a Friend</h3>
              <p className="text-sm text-muted-foreground">
                Share your code with a workout buddy
              </p>
            </div>
          </div>

          {myInvite ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={myInvite.invite_code}
                  readOnly
                  className="font-mono text-lg text-center"
                />
                <Button variant="outline" size="icon" onClick={copyInviteCode}>
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Expires{" "}
                {format(new Date(myInvite.expires_at), "MMM d, yyyy")}
              </p>
            </div>
          ) : (
            <Button
              onClick={createInvite}
              disabled={isCreatingInvite}
              className="w-full"
            >
              {isCreatingInvite ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Generate Invite Code
            </Button>
          )}
        </Card>

        {/* Accept Invite */}
        <Card className="p-6 border-border shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">Join a Friend</h3>
              <p className="text-sm text-muted-foreground">
                Enter their invite code
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Enter code (e.g. ABC12345)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="font-mono text-center"
              maxLength={8}
            />
            <Button
              onClick={acceptInvite}
              disabled={isAccepting || !inviteCode.trim()}
              className="w-full"
              variant="secondary"
            >
              {isAccepting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Accept Invite
            </Button>
          </div>
        </Card>
      </div>

      {/* Buddies List */}
      {buddies.length > 0 && (
        <Card className="p-6 border-border shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Buddies ({buddies.length})
          </h3>

          <div className="space-y-4">
            {buddies.map((buddy) => (
              <div
                key={buddy.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    B
                  </div>
                  <div>
                    <p className="font-medium">Buddy</p>
                    <p className="text-xs text-muted-foreground">
                      Connected {format(new Date(buddy.created_at), "MMM d")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {buddy.stats?.workouts_count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-secondary">
                      {buddy.stats?.checkins_count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Check-ins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent">
                      {buddy.stats?.current_streak || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBuddy(buddy.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {buddies.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground border-border shadow-card">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No buddies yet</p>
          <p className="text-sm mt-1">
            Invite a friend or enter their code to get started!
          </p>
        </Card>
      )}
    </div>
  );
};

export default AccountabilityPage;
