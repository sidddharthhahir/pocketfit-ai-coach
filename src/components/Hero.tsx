import { Button } from "@/components/ui/button";
import { Dumbbell, Target, Utensils, TrendingUp, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb w-[500px] h-[500px] bg-primary/20 top-[-10%] left-[-10%]" style={{ animationDelay: '0s' }} />
      <div className="orb w-[400px] h-[400px] bg-chart-4/15 bottom-[10%] right-[-5%]" style={{ animationDelay: '-7s' }} />
      <div className="orb w-[300px] h-[300px] bg-accent/10 top-[40%] left-[50%]" style={{ animationDelay: '-14s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Radial gradient */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-glow-accent" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">AI-Powered Personal Fitness Coach</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-balance animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            Your Pocket-Sized
            <span className="block shimmer-text mt-2">
              Fitness Coach
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.35s', opacity: 0 }}>
            Personalized workout plans, nutrition guidance, and AI-powered coaching — all tailored to your body and goals.
          </p>
          
          {/* CTA */}
          <div className="flex justify-center pt-2 animate-fade-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
            <Button 
              variant="hero" 
              size="lg" 
              onClick={onGetStarted}
              className="text-base px-10 h-14 rounded-2xl group relative overflow-hidden shadow-glow-primary hover:shadow-[0_0_40px_hsl(var(--primary)/0.35)] transition-all duration-500"
            >
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </Button>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16">
            {[
              { icon: Target, label: "Goal Setting", desc: "Science-based targets", color: "text-primary", glow: "group-hover:shadow-glow-primary" },
              { icon: Dumbbell, label: "Smart Workouts", desc: "AI-generated plans", color: "text-chart-4", glow: "group-hover:shadow-[0_0_30px_hsl(var(--chart-4)/0.2)]" },
              { icon: Utensils, label: "Diet Plans", desc: "Macro-optimized meals", color: "text-accent", glow: "group-hover:shadow-glow-accent" },
              { icon: TrendingUp, label: "Track Progress", desc: "Visual analytics", color: "text-chart-3", glow: "group-hover:shadow-[0_0_30px_hsl(var(--chart-3)/0.2)]" },
            ].map((item, i) => (
              <div 
                key={item.label} 
                className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl glass-card glow-border hover:translate-y-[-4px] transition-all duration-500 cursor-default animate-fade-up ${item.glow}`}
                style={{ animationDelay: `${0.6 + i * 0.1}s`, opacity: 0 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-card to-secondary flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold block">{item.label}</span>
                  <span className="text-xs text-muted-foreground hidden md:block mt-0.5">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 pt-8 animate-fade-up" style={{ animationDelay: '1.1s', opacity: 0 }}>
            {[
              { icon: Sparkles, text: "AI-Powered" },
              { icon: Shield, text: "Data Secured" },
              { icon: Zap, text: "Real Science" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <item.icon className="w-3.5 h-3.5 text-primary/60" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};