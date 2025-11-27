import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { User, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface ProfileSectionProps {
  userId: string;
}

export const ProfileSection = ({ userId }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setEditedProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          weight: editedProfile.weight,
          height: editedProfile.height,
          age: editedProfile.age,
          goal: editedProfile.goal,
          experience: editedProfile.experience,
          dietary_preference: editedProfile.dietary_preference,
        })
        .eq('user_id', userId);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-border shadow-card">
        <p className="text-muted-foreground">Loading profile...</p>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6 border-border shadow-card">
        <p className="text-muted-foreground">Profile not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                Manage your fitness profile and goals
              </p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedProfile.weight}
                  onChange={(e) => setEditedProfile({...editedProfile, weight: parseFloat(e.target.value)})}
                />
              ) : (
                <p className="text-lg font-semibold">{profile.weight} kg</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Height (cm)</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedProfile.height}
                  onChange={(e) => setEditedProfile({...editedProfile, height: parseFloat(e.target.value)})}
                />
              ) : (
                <p className="text-lg font-semibold">{profile.height} cm</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Age</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedProfile.age}
                  onChange={(e) => setEditedProfile({...editedProfile, age: parseInt(e.target.value)})}
                />
              ) : (
                <p className="text-lg font-semibold">{profile.age} years</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <p className="text-lg font-semibold capitalize">{profile.gender}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Goal</label>
              {isEditing ? (
                <Select value={editedProfile.goal} onValueChange={(value) => setEditedProfile({...editedProfile, goal: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulk">Bulk (Gain Muscle)</SelectItem>
                    <SelectItem value="cut">Cut (Lose Fat)</SelectItem>
                    <SelectItem value="maintain">Maintain</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg font-semibold capitalize">{profile.goal}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Experience Level</label>
              {isEditing ? (
                <Select value={editedProfile.experience} onValueChange={(value) => setEditedProfile({...editedProfile, experience: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg font-semibold capitalize">{profile.experience}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Dietary Preference</label>
              {isEditing ? (
                <Select value={editedProfile.dietary_preference} onValueChange={(value) => setEditedProfile({...editedProfile, dietary_preference: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                    <SelectItem value="pescatarian">Pescatarian</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg font-semibold capitalize">{profile.dietary_preference}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
