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
  <Card className={cn("bg-card border-border hover:border-primary transition-colors duration-300 group relative overflow-hidden", className)}>
    <div className="absolute inset-0 grid-overlay pointer-events-none" />
    <CardContent className="p-6 md:p-8 relative">
      {index && (
        <span className="text-primary font-heading font-bold text-sm tracking-wider mb-4 block">
          {index}
        </span>
      )}
      <Icon className="w-6 h-6 text-primary mb-4" />
      <h3 className="font-heading text-lg md:text-xl font-bold uppercase tracking-tight text-foreground mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </CardContent>
  </Card>
);

export default FeatureCard;
