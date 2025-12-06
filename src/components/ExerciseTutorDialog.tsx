import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, CheckCircle, AlertTriangle, Video, Image } from "lucide-react";
import { getExerciseMediaGuide, type ExerciseMediaGuide } from "@/data/exerciseMediaGuides";

interface ExerciseTutorDialogProps {
  exerciseName: string;
  trigger?: React.ReactNode;
}

export const ExerciseTutorDialog = ({ exerciseName, trigger }: ExerciseTutorDialogProps) => {
  const guide = getExerciseMediaGuide(exerciseName);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Info className="h-4 w-4 text-primary" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {guide?.videoUrl ? (
              <Video className="h-5 w-5 text-primary" />
            ) : (
              <Image className="h-5 w-5 text-primary" />
            )}
            {exerciseName} - Form Guide
          </DialogTitle>
        </DialogHeader>

        {guide ? (
          <div className="space-y-4">
            {/* Media Section */}
            {guide.videoUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <video
                  src={guide.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  poster={guide.imageUrl}
                />
              </div>
            ) : guide.imageUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={guide.imageUrl}
                  alt={`${exerciseName} form demonstration`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Key Cues Section */}
            <Card className="p-4 border-primary/20 bg-primary/5">
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-primary">
                <CheckCircle className="h-4 w-4" />
                Key Form Cues
              </h4>
              <ul className="space-y-2">
                {guide.keyCues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-foreground">{cue}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Safety Tips Section */}
            <Card className="p-4 border-accent/20 bg-accent/5">
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-accent">
                <AlertTriangle className="h-4 w-4" />
                Safety Tips
              </h4>
              <ul className="space-y-2">
                {guide.safetyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Info className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-2">No Visual Guide Available</h4>
            <p className="text-sm text-muted-foreground">
              We don't have a visual guide for "{exerciseName}" yet.
              <br />
              Check back later or search online for proper form tips.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
