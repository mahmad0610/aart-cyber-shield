import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: string;
  className?: string;
}

const FeatureCard = ({ icon: Icon, title, description, index, className }: FeatureCardProps) => (
  <Card className={cn("bg-card/40 border-border/50 hover:border-primary transition-colors duration-500 group relative overflow-hidden backdrop-blur-sm", className)}>
    <div className="absolute inset-0 grid-overlay pointer-events-none opacity-50" />

    {/* Giant Background Number for Hacktron feel */}
    {index && (
      <span className="absolute -top-4 -right-4 text-7xl font-mono font-bold text-white/5 group-hover:text-primary/10 transition-colors duration-500 max-w-none pointer-events-none select-none z-0">
        {index}
      </span>
    )}

    <CardContent className="p-8 relative z-10 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-start mb-auto">
        <Icon className="w-8 h-8 text-primary/80 group-hover:text-primary transition-colors drop-shadow-[0_0_8px_hsl(237,93%,73%,0.5)]" />
        {index && <span className="text-xs font-mono tracking-widest text-primary font-bold">[{index}]</span>}
      </div>

      <div className="mt-8">
        <h3 className="font-heading text-lg font-bold uppercase tracking-[0.1em] text-white mb-4 leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="font-mono text-xs tracking-wide text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
          {description}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default FeatureCard;
