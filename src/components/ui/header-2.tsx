'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { useNavigate } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.svg';
import logoWordmark from '@/assets/logo-wordmark.svg';

export function Header() {
    const [open, setOpen] = React.useState(false);
    const scrolled = useScroll(10);

    const navigate = useNavigate();

    const links = [
        { label: 'Product', href: '#product' },
        { label: 'Engine', href: '#engine' },
        { label: 'Industries', href: '#industries' },
        { label: 'Proof', href: '#proof' },
        { label: 'Contact', href: '#contact' },
    ];

    React.useEffect(() => {
        if (open) {
            // Disable scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable scroll
            document.body.style.overflow = '';
        }

        // Cleanup when component unmounts (important for Next.js)
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out border-b',
                {
                    'bg-background/80 border-border/50 backdrop-blur-md': scrolled || open,
                    'bg-transparent border-transparent': !scrolled && !open,
                },
            )}
        >
            <nav className="flex h-16 w-full items-center justify-between px-6 lg:px-12">
                <AartLogo />

                {/* Center Links */}
                <div className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-8 md:flex">
                    {links.map((link, i) => (
                        <a key={i} className="text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors" href={link.href}>
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="hidden items-center gap-6 md:flex">
                    <button onClick={() => navigate("/dashboard")} className="text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
                        Log In
                    </button>
                    <Button
                        onClick={() => navigate("/dashboard")}
                        className="hacktron-clip bg-primary hover:bg-white text-black hover:text-black uppercase tracking-[0.15em] text-[11px] font-bold h-10 px-6 rounded-none transition-colors"
                    >
                        Start for free <span className="ml-1 text-[14px]">↗</span>
                    </Button>
                </div>
                <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
                    <MenuToggleIcon open={open} className="size-5" duration={300} />
                </Button>
            </nav>

            <div
                className={cn(
                    'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
                    open ? 'block' : 'hidden',
                )}
            >
                <div
                    data-slot={open ? 'open' : 'closed'}
                    className={cn(
                        'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
                        'flex h-full w-full flex-col justify-between gap-y-4 p-6',
                    )}
                >
                    <div className="grid gap-y-6 mt-4">
                        {links.map((link) => (
                            <a
                                key={link.label}
                                className="text-sm uppercase tracking-[0.2em] text-white/80"
                                href={link.href}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4">
                        <button className="text-sm uppercase tracking-[0.2em] text-white/50 text-left" onClick={() => navigate("/dashboard")}>
                            Log In
                        </button>
                        <Button className="hacktron-clip bg-primary text-black rounded-none w-full h-12 uppercase tracking-widest font-bold" onClick={() => navigate("/dashboard")}>
                            Start for free CTA
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export const AartLogo = (props: React.ComponentProps<"div">) => (
    <div className="flex items-center gap-3 group cursor-pointer" {...props}>
        <img
            src={logoIcon}
            alt="AART logo"
            className="h-8 w-8 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_hsla(237,93%,73%,0.6)]"
        />
        <span className="font-brand text-2xl tracking-tighter text-white drop-shadow-[0_0_15px_hsla(0,0%,100%,0.2)] group-hover:drop-shadow-[0_0_20px_hsla(0,0%,100%,0.4)] transition-all duration-300 -mb-1">
            aart
        </span>
    </div>
);

