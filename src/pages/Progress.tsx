import { ProgressTracker } from "@/components/ProgressTracker";

interface ProgressPageProps {
  userId: string;
}

export const ProgressPage = ({ userId }: ProgressPageProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Progress</h2>
        <p className="text-muted-foreground">
          Track your weight, view trends, and get weekly insights.
        </p>
      </div>

      <ProgressTracker userId={userId} />
    </div>
  );
};

export default ProgressPage;
