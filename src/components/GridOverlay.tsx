import { cn } from "@/lib/utils";

const GridOverlay = ({ className }: { className?: string }) => (
  <div className={cn("absolute inset-0 grid-overlay pointer-events-none", className)} />
);

export default GridOverlay;
