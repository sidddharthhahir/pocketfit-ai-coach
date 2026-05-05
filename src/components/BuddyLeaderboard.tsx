import { Card } from "@/components/ui/card";
import { Trophy, Flame, Dumbbell } from "lucide-react";

interface Entry {
  id: string;
  name: string;
  isMe?: boolean;
  workouts: number;
  streak: number;
}

interface Props { entries: Entry[] }

export const BuddyLeaderboard = ({ entries }: Props) => {
  const ranked = [...entries].sort((a, b) =>
    b.streak - a.streak || b.workouts - a.workouts
  );

  if (ranked.length <= 1) return null;

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Buddy Leaderboard</h3>
      </div>
      <div className="space-y-2">
        {ranked.map((e, i) => (
          <div key={e.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              e.isMe ? "bg-primary/10 border border-primary/30" : "bg-muted/40"
            }`}>
            <div className="flex items-center gap-3">
              <span className="text-lg w-8 text-center">{medal(i)}</span>
              <span className="font-medium">{e.name}{e.isMe && " (you)"}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-accent" />{e.streak}</span>
              <span className="flex items-center gap-1"><Dumbbell className="w-4 h-4 text-primary" />{e.workouts}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
