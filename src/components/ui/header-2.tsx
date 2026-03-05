'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { useNavigate } from 'react-router-dom';

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
                'fixed top-0 left-0 right-0 z-50 mx-auto w-full border-b border-transparent transition-all duration-300 ease-in-out',
                {
                    'bg-background/40 border-border/30 backdrop-blur-2xl md:top-4 md:max-w-4xl md:rounded-2xl md:border md:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]':
                        scrolled && !open,
                    'bg-background/60 backdrop-blur-2xl border-border/30': open,
                },
            )}
        >
            <nav
                className={cn(
                    'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
                    {
                        'md:px-2': scrolled,
                    },
                )}
            >
                <WordmarkIcon className="h-4" />
                <div className="hidden items-center gap-2 md:flex">
                    {links.map((link, i) => (
                        <a key={i} className={buttonVariants({ variant: 'ghost' })} href={link.href}>
                            {link.label}
                        </a>
                    ))}
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>Sign In</Button>
                    <Button onClick={() => navigate("/dashboard")}>Get Started</Button>
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
                        'flex h-full w-full flex-col justify-between gap-y-2 p-4',
                    )}
                >
                    <div className="grid gap-y-2">
                        {links.map((link) => (
                            <a
                                key={link.label}
                                className={buttonVariants({
                                    variant: 'ghost',
                                    className: 'justify-start',
                                })}
                                href={link.href}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
                            Sign In
                        </Button>
                        <Button className="w-full" onClick={() => navigate("/dashboard")}>Get Started</Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export const WordmarkIcon = (props: React.ComponentProps<"div">) => (
    <div className="flex items-center gap-2 group cursor-pointer" {...props}>
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.3)] group-hover:scale-110 transition-transform duration-300">
            <span className="text-primary-foreground font-bold text-lg">C</span>
        </div>
        <span className="font-heading font-bold text-xl tracking-tighter uppercase">
            Cyber <span className="text-primary">Shield</span>
        </span>
    </div>
);
