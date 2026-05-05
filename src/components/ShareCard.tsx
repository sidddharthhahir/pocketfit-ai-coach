import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Flame } from "lucide-react";
import { toast } from "sonner";

interface ShareCardProps {
  streak: number;
  workouts: number;
  username?: string | null;
}

export const ShareCard = ({ streak, workouts, username }: ShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generate = async () => {
    const W = 1080, H = 1080;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // gradient background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#1a0b2e");
    grad.addColorStop(1, "#7c3aed");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Glow circle
    const radial = ctx.createRadialGradient(W / 2, H / 2 - 100, 50, W / 2, H / 2 - 100, 500);
    radial.addColorStop(0, "rgba(168,85,247,0.5)");
    radial.addColorStop(1, "rgba(168,85,247,0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    // Brand
    ctx.font = "600 42px sans-serif";
    ctx.fillText("BoomStartAI", W / 2, 120);

    // Big streak
    ctx.font = "900 280px sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`${streak}`, W / 2, 540);

    ctx.font = "700 64px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("DAY STREAK 🔥", W / 2, 640);

    ctx.font = "500 40px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(`${workouts} workouts logged`, W / 2, 720);

    if (username) {
      ctx.font = "500 36px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`@${username}`, W / 2, 900);
    }

    ctx.font = "400 32px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("boomstart.lovable.app", W / 2, 980);

    const url = canvas.toDataURL("image/png");
    setPreviewUrl(url);
  };

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `boomstart-streak-${streak}.png`;
    a.click();
    toast.success("Share card downloaded!");
  };

  const share = async () => {
    if (!previewUrl) return;
    try {
      const blob = await (await fetch(previewUrl)).blob();
      const file = new File([blob], `streak-${streak}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My BoomStartAI streak" });
      } else {
        download();
      }
    } catch {
      download();
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Share your progress</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Generate a downloadable image for Instagram, WhatsApp, or X.
      </p>

      {previewUrl && (
        <img src={previewUrl} alt="Streak share card preview" className="w-full max-w-xs mx-auto rounded-lg mb-4" />
      )}

      <div className="flex gap-2 flex-wrap">
        <Button onClick={generate} variant="default">Generate card</Button>
        {previewUrl && (
          <>
            <Button onClick={download} variant="outline"><Download className="w-4 h-4 mr-1" /> Download</Button>
            <Button onClick={share} variant="outline"><Share2 className="w-4 h-4 mr-1" /> Share</Button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
};
