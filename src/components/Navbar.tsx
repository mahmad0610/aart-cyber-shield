import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Engine", href: "#engine" },
  { label: "Industries", href: "#industries" },
  { label: "Proof", href: "#proof" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-sm" />
          <span className="font-heading font-bold text-lg tracking-tight text-foreground">AART</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors uppercase tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="uppercase tracking-wider text-xs font-semibold rounded-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate("/dashboard")}
          >
            Get Started
          </Button>
          <Button size="sm" className="uppercase tracking-wider text-xs font-semibold rounded-sm">
            Request Demo
          </Button>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-border">
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-foreground text-lg font-heading font-semibold uppercase tracking-wide"
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="uppercase tracking-wider text-xs font-semibold rounded-sm mt-2"
                onClick={() => { setOpen(false); navigate("/dashboard"); }}
              >
                Get Started
              </Button>
              <Button className="uppercase tracking-wider text-xs font-semibold rounded-sm mt-2" variant="outline">
                Request Demo
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
