import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy, Plus, Users, Copy, Check, Flame, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  useMyChallenges, useChallenge, useChallengeMembers, useChallengeCheckins,
  useCreateChallenge, useJoinChallenge, useCheckIn, useLeaveChallenge,
  GroupChallenge,
} from "@/hooks/useGroupChallenges";

interface Props {
  userId: string;
}

export default function ChallengesPage({ userId }: Props) {
  const { data: challenges = [], isLoading } = useMyChallenges(userId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return <ChallengeDetail challengeId={selectedId} userId={userId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Group Challenges
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Push together. Show up daily.
          </p>
        </div>
        <div className="flex gap-2">
          <JoinChallengeDialog userId={userId} />
          <CreateChallengeDialog userId={userId} />
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading…</Card>
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No challenges yet"
          description="Create one with friends or join with an invite code."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} onOpen={() => setSelectedId(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

const ChallengeCard = ({ challenge, onOpen }: { challenge: GroupChallenge; onOpen: () => void }) => {
  const start = new Date(challenge.start_date);
  const day = Math.min(
    challenge.duration_days,
    Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1),
  );
  const pct = Math.round((day / challenge.duration_days) * 100);
  return (
    <Card className="p-4 cursor-pointer hover:border-primary/40 transition-all" onClick={onOpen}>
      <div className="flex justify-between items-start gap-3 mb-2">
        <div>
          <h3 className="font-semibold">{challenge.name}</h3>
          {challenge.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{challenge.description}</p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0">{challenge.challenge_type}</Badge>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        Day {day} of {challenge.duration_days}
      </div>
      <Progress value={pct} className="h-1.5" />
    </Card>
  );
};

const CreateChallengeDialog = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [challengeType, setChallengeType] = useState("custom");
  const create = useCreateChallenge(userId);

  const submit = async () => {
    if (!name.trim()) return toast.error("Name is required");
    try {
      const ch = await create.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        duration_days: parseInt(duration) || 30,
        challenge_type: challengeType,
      });
      toast.success(`Created. Invite code: ${ch.invite_code}`);
      setOpen(false); setName(""); setDescription(""); setDuration("30");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" />New</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create challenge</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="30-day no sugar" maxLength={80} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="No added sugar in any meal" maxLength={300} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Input value={challengeType} onChange={(e) => setChallengeType(e.target.value)} placeholder="diet, workout, habit…" maxLength={30} />
            </div>
            <div>
              <Label>Days</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min={1} max={365} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={create.isPending}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const JoinChallengeDialog = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const join = useJoinChallenge(userId);
  const submit = async () => {
    if (!code.trim()) return;
    try {
      await join.mutateAsync({ invite_code: code });
      toast.success("Joined challenge");
      setOpen(false); setCode("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Users className="w-4 h-4 mr-1" />Join</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Join with invite code</DialogTitle></DialogHeader>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. a1b2c3d4" maxLength={20} />
        <DialogFooter>
          <Button onClick={submit} disabled={join.isPending}>Join</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ChallengeDetail = ({ challengeId, userId, onBack }: { challengeId: string; userId: string; onBack: () => void }) => {
  const { data: challenge } = useChallenge(challengeId);
  const { data: members = [] } = useChallengeMembers(challengeId);
  const { data: checkins = [] } = useChallengeCheckins(challengeId);
  const checkIn = useCheckIn(challengeId, userId);
  const leave = useLeaveChallenge(userId);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Card className="p-8 mt-4 text-center text-muted-foreground">Loading…</Card>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const myCheckedToday = checkins.some((c) => c.user_id === userId && c.day_date === today);

  // leaderboard: total checkins per user
  const counts = new Map<string, number>();
  checkins.forEach((c) => counts.set(c.user_id, (counts.get(c.user_id) || 0) + c.value));
  const leaderboard = members
    .map((m) => ({ ...m, total: counts.get(m.user_id) || 0 }))
    .sort((a, b) => b.total - a.total);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(challenge.invite_code);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync({ value: 1, note: note.trim() || undefined });
      toast.success(myCheckedToday ? "Updated" : "Checked in 🔥");
      setNote("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleLeave = async () => {
    if (challenge.owner_id === userId) return toast.error("Owner can't leave. Delete instead.");
    if (!confirm("Leave this challenge?")) return;
    try {
      await leave.mutateAsync(challengeId);
      toast.success("Left challenge");
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const start = new Date(challenge.start_date);
  const day = Math.min(
    challenge.duration_days,
    Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1),
  );
  const pct = Math.round((day / challenge.duration_days) * 100);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold">{challenge.name}</h1>
            {challenge.description && <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>}
          </div>
          <Button size="sm" variant="outline" onClick={copyCode}>
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {challenge.invite_code}
          </Button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Day {day} of {challenge.duration_days}</span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-primary" /> Today's check-in</h3>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (how it went)"
          maxLength={200}
          className="mb-2"
        />
        <Button onClick={handleCheckIn} disabled={checkIn.isPending} className="w-full">
          {myCheckedToday ? "Update today's check-in" : "Check in for today"}
        </Button>
      </Card>

      <Tabs defaultValue="leaderboard">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="space-y-2 mt-3">
          {leaderboard.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">No members yet</Card>
          ) : leaderboard.map((m, i) => (
            <Card key={m.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold w-6 text-center text-muted-foreground">{i + 1}</span>
                <span className="font-medium">{m.display_name || (m.user_id === userId ? "You" : "Member")}</span>
                {m.user_id === challenge.owner_id && <Badge variant="secondary" className="text-[10px]">owner</Badge>}
              </div>
              <span className="text-sm font-semibold">{m.total} ✓</span>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="activity" className="space-y-2 mt-3">
          {checkins.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">No check-ins yet</Card>
          ) : checkins.slice(0, 30).map((c) => {
            const member = members.find((m) => m.user_id === c.user_id);
            return (
              <Card key={c.id} className="p-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{member?.display_name || (c.user_id === userId ? "You" : "Member")}</span>
                  <span className="text-muted-foreground text-xs">{c.day_date}</span>
                </div>
                {c.note && <p className="text-xs text-muted-foreground mt-1">{c.note}</p>}
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {challenge.owner_id !== userId && (
        <Button variant="ghost" onClick={handleLeave} className="w-full text-destructive">
          <LogOut className="w-4 h-4 mr-2" /> Leave challenge
        </Button>
      )}
    </div>
  );
};
