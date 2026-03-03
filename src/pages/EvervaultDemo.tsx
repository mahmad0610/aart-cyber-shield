import React from "react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";

export function EvervaultCardDemo() {
    return (
        <div className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-sm mx-auto p-4 relative h-[30rem] rounded-2xl bg-card transition-all hover:scale-[1.02] shadow-xl">
            <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

            <EvervaultCard text="SECURE" className="mt-4" />

            <h2 className="dark:text-white text-black mt-4 text-sm font-light">
                Hover over this card to reveal an awesome effect. Powered by advanced cryptographic randomness.
            </h2>
            <p className="text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-black dark:text-white px-2 py-0.5">
                Watch it react
            </p>
        </div>
    );
}

export default function EvervaultPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-background to-background">
            <EvervaultCardDemo />
        </div>
    )
}
