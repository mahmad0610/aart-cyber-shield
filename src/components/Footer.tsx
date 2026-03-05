import { Separator } from "@/components/ui/separator";
import logoIcon from "@/assets/logo-icon.svg";
import logoWordmark from "@/assets/logo-wordmark.svg";

const footerSections = [
  {
    title: "Product",
    links: ["Attack Engine", "Remediation", "Integrations", "Pricing"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Blog", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Contact", "Press"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Compliance"],
  },
];

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <img src={logoIcon} alt="AART logo" className="w-7 h-7" />
            <img src={logoWordmark} alt="AART" className="h-3.5" />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Autonomous API Red Team. Security validation driven by evidence.
          </p>
        </div>
        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-foreground mb-4">
              {section.title}
            </h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator className="my-8" />
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-xs">
          © 2026 AART. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-muted-foreground hover:text-primary text-xs transition-colors">Twitter</a>
          <a href="#" className="text-muted-foreground hover:text-primary text-xs transition-colors">LinkedIn</a>
          <a href="#" className="text-muted-foreground hover:text-primary text-xs transition-colors">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

