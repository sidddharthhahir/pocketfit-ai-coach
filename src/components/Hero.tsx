import { Button } from "@/components/ui/button";
import { Dumbbell, Target, Utensils, TrendingUp } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium">AI-Powered Personal Fitness Coach</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Your Pocket-Sized
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Fitness Coach
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized workout plans, diet recommendations, and AI-powered guidance 
            tailored to your goals. Transform your fitness journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={onGetStarted}
              className="text-lg"
            >
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg"
            >
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border shadow-card hover:shadow-glow transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold">Goal Setting</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border shadow-card hover:shadow-glow transition-all">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-secondary" />
              </div>
              <span className="font-semibold">Workout Plans</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border shadow-card hover:shadow-glow transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-accent" />
              </div>
              <span className="font-semibold">Diet Plans</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border shadow-card hover:shadow-glow transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold">Track Progress</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
