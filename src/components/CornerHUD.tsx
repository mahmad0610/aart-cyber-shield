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
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden mix-blend-difference opacity-70">
            {/* Bottom Left */}
            <div className="absolute bottom-4 left-4 font-mono text-[10px] md:text-[11px] text-white leading-tight flex flex-col gap-1 tracking-[0.2em] uppercase">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 border border-white" />
                    <div className="w-1 h-3 border border-white" />
                    <div className="w-2 h-3 border border-white" />
                </div>
                <div>CLIENT: {navigator.userAgent.split(" ")[0] || "Navigator"}</div>
                <div>
                    VIEWPORT: {viewport.width}x{viewport.height} SCREEN: {typeof window !== "undefined" ? window.screen.width + "x" + window.screen.height : "0x0"}
                </div>
                <div>DEPTH: 32BIT</div>
            </div>

            {/* Bottom Right */}
            <div className="absolute bottom-4 right-4 font-mono text-[10px] md:text-[11px] text-white leading-tight text-right flex flex-col gap-1 tracking-[0.2em] uppercase">
                <div>UTC: {time}</div>
                <div>UNIX: {unix}</div>
                <div className="flex items-center justify-end gap-2 mt-1">
                    <span>STATUS: <span className="text-primary glow-text-blue filter drop-shadow-[0_0_5px_rgba(125,131,250,0.8)]">●</span> ON</span>
                    <div className="flex gap-[2px] opacity-70">
                        <div className="w-1 h-3 bg-white" />
                        <div className="w-1 h-3 border border-white" />
                        <div className="w-1 h-3 border border-white" />
                    </div>
                </div>
            </div>

            {/* Top Left Crosshair */}
            <div className="absolute top-4 left-4 flex gap-1 opacity-50">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 border border-white rounded-full"></div>
                <div className="w-1 h-1 border border-white rounded-full"></div>
            </div>

            {/* Top Right Crosshair */}
            <div className="absolute top-4 right-4 flex gap-1 justify-end opacity-50">
                <div className="w-1 h-1 bg-white"></div>
                <div className="w-1 h-1 border border-white"></div>
                <div className="w-1 h-1 border border-white"></div>
                <div className="w-1 h-1 border border-white"></div>
            </div>
        </div>
    );
};

export default CornerHUD;
