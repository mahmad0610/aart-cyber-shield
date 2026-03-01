interface StatsCardProps {
  value: string;
  label: string;
}

const StatsCard = ({ value, label }: StatsCardProps) => (
  <div className="text-left">
    <div className="font-heading text-3xl md:text-4xl font-bold text-primary">{value}</div>
    <div className="text-muted-foreground text-sm mt-1">{label}</div>
  </div>
);

export default StatsCard;
