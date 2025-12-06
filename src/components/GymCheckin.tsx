import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, CheckCircle2, Loader2, Calendar, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";

interface GymCheckinProps {
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
}

// Stub function for AI verification - can be replaced with real vision model later
async function analyzeGymPhoto(photoUrl: string): Promise<{ isGym: boolean; comment: string }> {
  // Placeholder implementation - returns positive result with encouraging comment
  // In production, this would call a vision AI API to verify the photo
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  
  const comments = [
    "Great job showing up today! Consistency is key! 💪",
    "Another day, another workout! Keep crushing it! 🔥",
    "You're building great habits! Proud of you! ⭐",
    "Every gym visit counts. You're doing amazing! 🏆",
  ];
  
  return {
    isGym: true,
    comment: comments[Math.floor(Math.random() * comments.length)]
  };
}

export const GymCheckin = ({ userId }: GymCheckinProps) => {
  const [todayCheckin, setTodayCheckin] = useState<CheckinData | null>(null);
  const [allCheckins, setAllCheckins] = useState<CheckinData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadCheckins();
  }, [userId]);

  const loadCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from('gym_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      const checkins = (data || []) as CheckinData[];
      setAllCheckins(checkins);
      
      const todayData = checkins.find(c => c.date === today);
      setTodayCheckin(todayData || null);
    } catch (error: any) {
      console.error('Error loading checkins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${today}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('checkins')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('checkins')
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      // Create checkin record
      const { data: checkinData, error: insertError } = await supabase
        .from('gym_checkins')
        .insert({
          user_id: userId,
          date: today,
          photo_url: photoUrl
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Run AI analysis (stub)
      const analysis = await analyzeGymPhoto(photoUrl);

      // Update with AI results
      const { error: updateError } = await supabase
        .from('gym_checkins')
        .update({
          ai_is_gym: analysis.isGym,
          ai_comment: analysis.comment
        })
        .eq('id', checkinData.id);

      if (updateError) console.error('Failed to update AI analysis:', updateError);

      // Refresh data
      await loadCheckins();
      
      toast.success(analysis.comment);
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Calculate streak
  const calculateStreak = (): number => {
    let streak = 0;
    let currentDate = new Date();
    
    // If today has a checkin, start counting from today
    // Otherwise start from yesterday
    if (!allCheckins.find(c => c.date === format(currentDate, 'yyyy-MM-dd'))) {
      currentDate = subDays(currentDate, 1);
    }
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const hasCheckin = allCheckins.find(c => c.date === dateStr && c.ai_is_gym !== false);
      
      if (hasCheckin) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate attendance rate (last 30 days)
  const calculateAttendanceRate = (): number => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentCheckins = allCheckins.filter(c => {
      const checkinDate = new Date(c.date);
      return checkinDate >= thirtyDaysAgo && c.ai_is_gym !== false;
    });
    return Math.round((recentCheckins.length / 30) * 100);
  };

  // Get days for current month calendar
  const getCalendarDays = () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return eachDayOfInterval({ start, end });
  };

  const streak = calculateStreak();
  const attendanceRate = calculateAttendanceRate();

  if (isLoading) {
    return (
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Check-in Card */}
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Daily Check-In</h3>
            <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>

        {todayCheckin ? (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={todayCheckin.photo_url}
                alt="Today's gym check-in"
                className="w-full h-full object-cover"
              />
              {todayCheckin.ai_is_gym && (
                <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Attended
                </div>
              )}
            </div>
            {todayCheckin.ai_comment && (
              <p className="text-sm text-muted-foreground italic text-center">
                "{todayCheckin.ai_comment}"
              </p>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-2">No check-in yet today</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a photo from the gym to mark your attendance
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Habit Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-border shadow-card text-center">
          <div className="text-3xl font-bold text-primary">{streak}</div>
          <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
        </Card>
        <Card className="p-4 border-border shadow-card text-center">
          <div className="text-3xl font-bold text-secondary">{attendanceRate}%</div>
          <p className="text-sm text-muted-foreground">Last 30 Days</p>
        </Card>
      </div>

      {/* Month Calendar */}
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{format(new Date(), 'MMMM yyyy')}</h3>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-xs text-muted-foreground py-1">{day}</div>
          ))}
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startOfMonth(new Date()).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {getCalendarDays().map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const hasCheckin = allCheckins.find(c => c.date === dateStr);
            const isVerified = hasCheckin?.ai_is_gym;
            
            return (
              <div
                key={dateStr}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm
                  ${isToday(day) ? 'ring-2 ring-primary' : ''}
                  ${hasCheckin && isVerified ? 'bg-accent text-accent-foreground' : ''}
                  ${hasCheckin && !isVerified ? 'bg-muted' : ''}
                `}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Gallery */}
      {allCheckins.length > 0 && (
        <Card className="p-6 border-border shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Check-in Gallery</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {allCheckins.slice(0, 9).map((checkin) => (
              <div
                key={checkin.id}
                className="aspect-square rounded-lg overflow-hidden bg-muted relative group cursor-pointer"
              >
                <img
                  src={checkin.photo_url}
                  alt={`Check-in ${checkin.date}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-xs font-medium">{format(new Date(checkin.date), 'MMM d')}</span>
                </div>
              </div>
            ))}
          </div>
          {allCheckins.length > 9 && (
            <p className="text-sm text-muted-foreground text-center mt-3">
              + {allCheckins.length - 9} more check-ins
            </p>
          )}
        </Card>
      )}
    </div>
  );
};
