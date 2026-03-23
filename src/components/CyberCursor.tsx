import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CyberCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const trailX = useMotionValue(-100);
    const trailY = useMotionValue(-100);

    const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
    const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });
    const trailSpringX = useSpring(trailX, { stiffness: 120, damping: 20 });
    const trailSpringY = useSpring(trailY, { stiffness: 120, damping: 20 });

    const isHovering = useRef(false);
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only apply custom cursor on fine pointer devices (desktop)
        if (window.matchMedia("(pointer: fine)").matches === false) return;

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            trailX.set(e.clientX);
            trailY.set(e.clientY);
        };

        const handleHoverIn = () => {
            isHovering.current = true;
            if (ringRef.current) {
                ringRef.current.style.width = "56px";
                ringRef.current.style.height = "56px";
                ringRef.current.style.borderColor = "hsl(237, 93%, 73%)";
                ringRef.current.style.mixBlendMode = "difference";
            }
            if (dotRef.current) {
                dotRef.current.style.opacity = "0";
            }
        };

        const handleHoverOut = () => {
            isHovering.current = false;
            if (ringRef.current) {
                ringRef.current.style.width = "36px";
                ringRef.current.style.height = "36px";
                ringRef.current.style.borderColor = "rgba(255,255,255,0.3)";
                ringRef.current.style.mixBlendMode = "normal";
            }
            if (dotRef.current) {
                dotRef.current.style.opacity = "1";
            }
        };

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target?.closest("a, button, [data-hover]")) {
                handleHoverIn();
            }
        };

        const onMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target?.closest("a, button, [data-hover]")) {
                handleHoverOut();
            }
        };

        window.addEventListener("mousemove", moveCursor);
        document.body.addEventListener("mouseover", onMouseOver);
        document.body.addEventListener("mouseout", onMouseOut);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.body.removeEventListener("mouseover", onMouseOver);
            document.body.removeEventListener("mouseout", onMouseOut);
        };
    }, [cursorX, cursorY, trailX, trailY]);

    // Don't render on touch devices
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
        return null;
    }

    return (
        <>
            {/* Dot center */}
            <motion.div
                ref={dotRef}
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-primary z-[9999] pointer-events-none rounded-full"
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                    transition: "opacity 0.2s",
                }}
            />

            {/* Ring / Crosshair */}
            <motion.div
                ref={ringRef}
                className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full border border-white/30"
                style={{
                    x: trailSpringX,
                    y: trailSpringY,
                    translateX: "-50%",
                    translateY: "-50%",
                    width: 36,
                    height: 36,
                    transition: "width 0.3s ease, height 0.3s ease, border-color 0.3s ease, mix-blend-mode 0.3s ease",
                }}
            />

            {/* Trailing particle dots */}
            {[...Array(4)].map((_, i) => {
                const trailDelay = { stiffness: 60 - i * 12, damping: 15 + i * 3 };
                return (
                    <TrailDot key={i} x={cursorX} y={cursorY} spring={trailDelay} opacity={0.3 - i * 0.07} size={3 - i * 0.5} />
                );
            })}
        </>
    );
};

const TrailDot = ({
    x,
    y,
    spring,
    opacity,
    size,
}: {
    x: any;
    y: any;
    spring: { stiffness: number; damping: number };
    opacity: number;
    size: number;
}) => {
    const sx = useSpring(x, spring);
    const sy = useSpring(y, spring);

    return (
        <motion.div
            className="fixed top-0 left-0 bg-primary/60 z-[9997] pointer-events-none rounded-full"
            style={{
                x: sx,
                y: sy,
                translateX: "-50%",
                translateY: "-50%",
                width: size,
                height: size,
                opacity,
            }}
        />
    );
};

export default CyberCursor;
