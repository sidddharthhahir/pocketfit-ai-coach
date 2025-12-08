import { ProfileSection } from "@/components/ProfileSection";
import { PlanAdjustment } from "@/components/PlanAdjustment";

interface ProfilePageProps {
  userId: string;
}

export const ProfilePage = ({ userId }: ProfilePageProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Profile</h2>
        <p className="text-muted-foreground">
          Manage your fitness profile and adjust your plans.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSection userId={userId} />
        <PlanAdjustment />
      </div>
    </div>
  );
};

export default ProfilePage;
