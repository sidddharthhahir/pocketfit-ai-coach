import { Button } from "@/components/ui/button";
import { Dumbbell, Target, Utensils, TrendingUp, ArrowRight } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-primary">AI-Powered Personal Fitness Coach</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-balance">
            Your Pocket-Sized
            <span className="block bg-gradient-primary bg-clip-text text-transparent mt-1">
              Fitness Coach
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Personalized workout plans, nutrition guidance, and AI-powered coaching — all tailored to your body and goals.
          </p>
          
          <div className="flex justify-center pt-2">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={onGetStarted}
              className="text-base px-8 h-12 rounded-xl group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16">
            {[
              { icon: Target, label: "Goal Setting", color: "text-primary", bg: "bg-primary/10" },
              { icon: Dumbbell, label: "Workout Plans", color: "text-chart-4", bg: "bg-chart-4/10" },
              { icon: Utensils, label: "Diet Plans", color: "text-accent", bg: "bg-accent/10" },
              { icon: TrendingUp, label: "Track Progress", color: "text-chart-3", bg: "bg-chart-3/10" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3 p-5 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
