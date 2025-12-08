import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera,
  Grid,
  Columns,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { GymCheckin } from "@/components/GymCheckin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PhotosPageProps {
  userId: string;
}

interface CheckinData {
  id: string;
  user_id: string;
  date: string;
  photo_url: string;
  ai_is_gym: boolean | null;
  ai_comment: string | null;
  created_at: string;
  signedUrl?: string;
}

async function getSignedUrl(photoPath: string): Promise<string | null> {
  try {
    let path = photoPath;
    if (photoPath.includes("/storage/v1/object/public/checkins/")) {
      path = photoPath.split("/storage/v1/object/public/checkins/")[1];
    } else if (photoPath.includes("/storage/v1/object/sign/checkins/")) {
      const urlObj = new URL(photoPath);
      path = urlObj.pathname.split("/checkins/")[1]?.split("?")[0] || "";
    }

    if (!path) return null;

    const { data, error } = await supabase.storage
      .from("checkins")
      .createSignedUrl(path, 3600);

    if (error) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export const PhotosPage = ({ userId }: PhotosPageProps) => {
  const [allCheckins, setAllCheckins] = useState<CheckinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<CheckinData | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState<CheckinData[]>([]);

  useEffect(() => {
    loadCheckins();
  }, [userId]);

  const loadCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from("gym_checkins")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;

      const checkins = (data || []) as CheckinData[];
      const checkinsWithSignedUrls = await Promise.all(
        checkins.map(async (checkin) => {
          const signedUrl = await getSignedUrl(checkin.photo_url);
          return { ...checkin, signedUrl: signedUrl || checkin.photo_url };
        })
      );

      setAllCheckins(checkinsWithSignedUrls);
    } catch (error) {
      console.error("Error loading checkins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComparePhoto = (checkin: CheckinData) => {
    if (comparePhotos.find((p) => p.id === checkin.id)) {
      setComparePhotos(comparePhotos.filter((p) => p.id !== checkin.id));
    } else if (comparePhotos.length < 2) {
      setComparePhotos([...comparePhotos, checkin]);
    }
  };

  const groupedByMonth = allCheckins.reduce((acc, checkin) => {
    const month = format(parseISO(checkin.date), "MMMM yyyy");
    if (!acc[month]) acc[month] = [];
    acc[month].push(checkin);
    return acc;
  }, {} as Record<string, CheckinData[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Photos & Check-ins</h2>
          <p className="text-muted-foreground">
            Track your gym attendance and progress photos.
          </p>
        </div>
      </div>

      <Tabs defaultValue="checkin" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Check-in</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            <span>Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <Columns className="w-4 h-4" />
            <span>Compare</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkin">
          <GymCheckin userId={userId} />
        </TabsContent>

        <TabsContent value="timeline">
          {isLoading ? (
            <Card className="p-8 text-center text-muted-foreground">
              Loading photos...
            </Card>
          ) : allCheckins.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No check-in photos yet.</p>
              <p className="text-sm mt-2">
                Start checking in at the gym to build your timeline!
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByMonth).map(([month, checkins]) => (
                <div key={month}>
                  <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                    {month}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {checkins.map((checkin) => (
                      <button
                        key={checkin.id}
                        onClick={() => setSelectedPhoto(checkin)}
                        className="aspect-square rounded-lg overflow-hidden bg-muted relative group focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <img
                          src={checkin.signedUrl || checkin.photo_url}
                          alt={`Check-in ${checkin.date}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-xs font-medium">
                            {format(parseISO(checkin.date), "MMM d")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="compare">
          <Card className="p-6 border-border shadow-card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Compare Photos</h3>
              <p className="text-sm text-muted-foreground">
                Select two photos to compare side-by-side
              </p>
            </div>

            {comparePhotos.length === 2 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {comparePhotos.map((photo, index) => (
                    <div key={photo.id} className="relative">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                        <img
                          src={photo.signedUrl || photo.photo_url}
                          alt={`Comparison ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs font-medium">
                        {format(parseISO(photo.date), "MMM d, yyyy")}
                      </div>
                      <button
                        onClick={() =>
                          setComparePhotos(
                            comparePhotos.filter((p) => p.id !== photo.id)
                          )
                        }
                        className="absolute top-2 right-2 bg-background/80 p-1 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setComparePhotos([])}
                  className="w-full"
                >
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  {comparePhotos.length === 0
                    ? "Select your first photo"
                    : "Select your second photo"}
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-96 overflow-y-auto">
                  {allCheckins.map((checkin) => {
                    const isSelected = comparePhotos.find(
                      (p) => p.id === checkin.id
                    );
                    return (
                      <button
                        key={checkin.id}
                        onClick={() => toggleComparePhoto(checkin)}
                        className={`aspect-square rounded-lg overflow-hidden bg-muted relative focus:outline-none transition-all ${
                          isSelected
                            ? "ring-2 ring-primary scale-95"
                            : "hover:ring-2 hover:ring-muted-foreground"
                        }`}
                      >
                        <img
                          src={checkin.signedUrl || checkin.photo_url}
                          alt={`Check-in ${checkin.date}`}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                              {comparePhotos.findIndex(
                                (p) => p.id === checkin.id
                              ) + 1}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Photo Detail Dialog */}
      <Dialog
        open={!!selectedPhoto}
        onOpenChange={() => setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPhoto &&
                format(parseISO(selectedPhoto.date), "EEEE, MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedPhoto.signedUrl || selectedPhoto.photo_url}
                  alt={`Check-in ${selectedPhoto.date}`}
                  className="w-full h-full object-contain"
                />
              </div>
              {selectedPhoto.ai_comment && (
                <p className="text-sm text-muted-foreground italic text-center">
                  "{selectedPhoto.ai_comment}"
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotosPage;
