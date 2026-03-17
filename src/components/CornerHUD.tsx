import React, { useEffect, useState } from "react";

export const CornerHUD = () => {
    const [time, setTime] = useState("");
    const [unix, setUnix] = useState("");
    const [viewport, setViewport] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toISOString().split("T")[1].split(".")[0] + " UTC");
            setUnix(Math.floor(Date.now() / 1000).toString());
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);

        const updateSize = () => {
            setViewport({ width: window.innerWidth, height: window.innerHeight });
        };
        updateSize();
        window.addEventListener("resize", updateSize);

        return () => {
            clearInterval(timer);
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden opacity-40">
            {/* Bottom Left */}
            <div className="absolute bottom-6 left-8 font-mono text-[9px] md:text-[10px] text-white/40 leading-tight flex flex-col gap-2 tracking-[0.3em] uppercase italic">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-[1px] bg-primary animate-pulse" />
                    <div className="w-1 h-3 border border-white/20" />
                    <div className="w-2 h-3 border border-primary/30" />
                </div>
                <div>SEC_PROTOCOL: <span className="text-white/80 font-bold not-italic">AART-X9</span></div>
                <div>
                    RES: {viewport.width}×{viewport.height} <span className="text-primary/60 ml-2">● CALIBRATED</span>
                </div>
                <div>SIGNAL_STRENGTH: <span className="text-white/60">STABLE</span></div>
            </div>

            {/* Bottom Right */}
            <div className="absolute bottom-6 right-8 font-mono text-[9px] md:text-[10px] text-white/40 leading-tight text-right flex flex-col gap-2 tracking-[0.3em] uppercase italic">
                <div>UTC_TIMESTAMP: <span className="text-white/80 font-bold not-italic">{time}</span></div>
                <div>UNIX_EPOCH_REF: <span className="text-white/60">{unix}</span></div>
                <div className="flex items-center justify-end gap-3 mt-2">
                    <span className="flex items-center gap-2">
                        STATUS: <span className="text-primary animate-pulse shadow-[0_0_10px_rgba(125,131,250,0.5)]">●</span> <span className="text-white/80 font-bold not-italic">ENCRYPTED</span>
                    </span>
                    <div className="flex gap-[4px] opacity-40">
                        <div className="w-1 h-3 bg-primary" />
                        <div className="w-1 h-3 border border-white/20" />
                        <div className="w-1 h-3 border border-white/20" />
                    </div>
                </div>
            </div>

            {/* Top Left Decoration */}
            <div className="absolute top-8 left-10 flex flex-col gap-3 opacity-20">
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-white"></div>
                    <div className="w-1.5 h-1.5 border border-white/50"></div>
                </div>
                <div className="h-12 w-[1px] bg-gradient-to-b from-white/40 to-transparent ml-[3px]" />
            </div>

            {/* Top Right Decoration */}
            <div className="absolute top-8 right-10 flex flex-col gap-3 items-end opacity-20">
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 border border-white/50"></div>
                    <div className="w-1.5 h-1.5 bg-primary"></div>
                </div>
                <div className="h-12 w-[1px] bg-gradient-to-b from-primary/40 to-transparent mr-[3px]" />
            </div>
        </div>
    );
};

export default CornerHUD;
