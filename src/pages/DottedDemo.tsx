import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from '@/lib/utils';
import { Header } from "@/components/ui/header-2";

export default function DottedDemo() {
    return (
        <div className="relative min-h-screen w-full bg-background overflow-hidden">
            <Header />
            <DottedSurface className="size-full">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        aria-hidden="true"
                        className={cn(
                            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
                            'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]',
                            'blur-[100px]',
                        )}
                    />
                    <div className="z-10 text-center space-y-4">
                        <h1 className="font-heading text-6xl md:text-8xl font-bold tracking-tighter uppercase text-gradient-primary">
                            Dotted Surface
                        </h1>
                        <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
                            Three.js Particle Wave Simulation
                        </p>
                    </div>
                </div>
            </DottedSurface>
        </div>
    );
}
