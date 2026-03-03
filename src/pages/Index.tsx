import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Radar, Bug, GitPullRequest, Brain, Lock, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/ui/header-2";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import GridOverlay from "@/components/GridOverlay";
import FeatureCard from "@/components/FeatureCard";
import StatsCard from "@/components/StatsCard";
import PageLoader from "@/components/PageLoader";
import TopoHero from "@/components/TopoHero";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxSection from "@/components/ParallaxSection";
import HoverCard3D from "@/components/HoverCard3D";
import MagneticButton from "@/components/MagneticButton";
const heroImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070";
const founderImg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1974";

const industries = [
  { id: "fintech", label: "Fintech", content: "AART secures financial APIs against transaction fraud, account takeovers, and PCI-DSS compliance gaps. Our deterministic engine tests payment flows, token handling, and sensitive data exposure in sandboxed environments — delivering verified exploit evidence, not theoretical warnings." },
  { id: "saas", label: "SaaS", content: "Protect multi-tenant SaaS architectures from BOLA, privilege escalation, and API abuse. AART autonomously maps your API surface, identifies broken access controls, and generates patches — ensuring tenant isolation and data integrity at scale." },
  { id: "healthcare", label: "Healthcare", content: "AART validates HIPAA-compliant API security by testing PHI access controls, authentication flows, and data exchange endpoints. Our closed-loop remediation ensures patient data remains protected with verified, evidence-based security posture." },
  { id: "ecommerce", label: "E-Commerce", content: "Secure product catalogs, checkout flows, and customer data APIs. AART identifies injection points, IDOR vulnerabilities, and payment bypass exploits — then drafts pull requests to fix them before attackers find them." },
  { id: "government", label: "Government", content: "Meet FedRAMP and NIST compliance requirements with autonomous red teaming. AART operates in air-gapped sandbox environments, testing government APIs for authorization bypass, data leakage, and supply chain vulnerabilities." },
];

const testimonials = [
  { name: "Sarah Chen", role: "CISO, FinanceCore", quote: "AART eliminated 98% of our false positives overnight. Our security team finally focuses on real threats instead of chasing ghosts." },
  { name: "Marcus Webb", role: "VP Engineering, CloudScale", quote: "The autonomous patch drafting alone saved us 200+ engineering hours per quarter. It's like having an elite red team on autopilot." },
  { name: "Dr. Aisha Patel", role: "Head of Security, MedSecure", quote: "For healthcare compliance, evidence-based vulnerability validation isn't optional — it's mandatory. AART delivers exactly that." },
];

const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const handleLoaded = useCallback(() => setLoaded(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {!loaded && <PageLoader onComplete={handleLoaded} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={loaded ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header />

        {/* Hero — 3D Topographic Canvas */}
        <TopoHero />

        {/* Core Value Panels */}
        <section id="engine" className="relative">
          <SectionWrapper>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Target, index: "01", title: "Deterministic Attack Engine", description: "No probabilistic guessing. Every attack path is executed with deterministic precision in isolated sandboxes, producing verifiable exploit evidence." },
                { icon: Zap, index: "02", title: "Closed-Loop Remediation", description: "From exploit to fix in one cycle. AART drafts patches, opens pull requests, and validates the remediation — fully autonomous, zero manual intervention." },
                { icon: Brain, index: "03", title: "Product-Specific Threat Memory", description: "AART learns your application's unique attack surface and retains threat intelligence across scans, building a persistent security knowledge graph." },
              ].map((card, i) => (
                <ScrollReveal key={card.index} delay={i * 0.15}>
                  <HoverCard3D>
                    <FeatureCard icon={card.icon} index={card.index} title={card.title} description={card.description} />
                  </HoverCard3D>
                </ScrollReveal>
              ))}
            </div>
          </SectionWrapper>
        </section>

        {/* Security Shield - Evervault Integration */}
        <section className="relative py-32 bg-slate-950/20">
          <SectionWrapper>
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <ScrollReveal direction="left" className="lg:w-1/2">
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">Autonomous Core</span>
                </div>
                <h2 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight mb-8">
                  Encrypted <br />
                  <span className="text-primary">Intelligence.</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-xl">
                  AART utilizes cryptographically verified attack chains. Every exploit is generated and validated within an isolated evervault-protected sandbox, ensuring your production data remains untouched while security is proven with absolute certainty.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-foreground mb-2 italic">Isolation</h4>
                    <p className="text-sm text-muted-foreground italic">Hardware-level secure enclaves for all scan processes.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2 italic">Integrity</h4>
                    <p className="text-sm text-muted-foreground italic">Immutable execution trails with zero tampering risk.</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" className="lg:w-1/2 flex justify-center w-full">
                <div className="border border-white/[0.05] bg-card p-6 md:p-8 relative max-w-md w-full rounded-[2.5rem] overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all hover:border-primary/20">
                  <Icon className="absolute h-10 w-10 -top-5 -left-5 text-primary/40 group-hover:text-primary transition-colors duration-500" />
                  <Icon className="absolute h-10 w-10 -bottom-5 -left-5 text-primary/40 group-hover:text-primary transition-colors duration-500" />
                  <Icon className="absolute h-10 w-10 -top-5 -right-5 text-primary/40 group-hover:text-primary transition-colors duration-500" />
                  <Icon className="absolute h-10 w-10 -bottom-5 -right-5 text-primary/40 group-hover:text-primary transition-colors duration-500" />

                  <div className="relative group-hover:scale-[1.02] transition-transform duration-700">
                    <EvervaultCard text="SHIELD" className="aspect-square w-full" />
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent group-hover:via-primary transition-all duration-1000" />
                    <div className="flex justify-between items-center px-2">
                      <div>
                        <h3 className="font-heading text-xl font-bold">Secure Enclave</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Active Protection Enabled</p>
                      </div>
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </SectionWrapper>
        </section>

        {/* Mission / Vision */}
        <section className="relative">
          <SectionWrapper>
            <ScrollReveal>
              <h2 className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-10 max-w-3xl">
                We Provide Tailored Cybersecurity Solutions to Protect Your Business From Digital Threats.
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { tag: "/ Mission", text: "Eliminate theoretical security findings by executing real attacks in sandboxed environments. We believe security validation must be evidence-based — every vulnerability confirmed through deterministic exploitation, not statistical probability." },
                { tag: "/ Vision", text: "A world where autonomous red teaming continuously validates and patches application security — where vulnerabilities are discovered, verified, and remediated before attackers ever reach them. Security as an autonomous, self-healing system." },
              ].map((item, i) => (
                <ScrollReveal key={item.tag} delay={i * 0.15} direction={i === 0 ? "left" : "right"}>
                  <HoverCard3D>
                    <Card className="bg-card border-border h-full">
                      <CardContent className="p-6 md:p-8">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-primary mb-4">{item.tag}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                      </CardContent>
                    </Card>
                  </HoverCard3D>
                </ScrollReveal>
              ))}
            </div>
          </SectionWrapper>
        </section>

        {/* Full-Width Parallax Image */}
        <ParallaxSection
          backgroundImage={heroImage}
          speed={0.4}
          className="h-[300px] md:h-[500px]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background" />
          <div className="absolute inset-0 yellow-filter opacity-60 mix-blend-multiply" />
          <div className="relative h-full flex items-center justify-center">
            <ScrollReveal>
              <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground text-center text-glow">
                Evidence Over Assumptions
              </h2>
            </ScrollReveal>
          </div>
        </ParallaxSection>

        {/* Solutions Grid */}
        <section id="product" className="relative">
          <SectionWrapper>
            <ScrollReveal>
              <h2 className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-4">
                Powerful Solutions <br />For Unmatched Security
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="flex gap-4 mb-10">
                <MagneticButton>
                  <Button size="sm" className="uppercase tracking-wider text-xs font-semibold rounded-sm">
                    Request Demo
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button size="sm" variant="outline" className="uppercase tracking-wider text-xs font-semibold rounded-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Learn More
                  </Button>
                </MagneticButton>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Bug, index: "01", title: "API Exploit Verification", description: "Every vulnerability is confirmed through real exploitation in sandboxed environments. No theoretical findings — only verified breaches with full attack chain evidence and reproduction steps." },
                { icon: Lock, index: "02", title: "Autonomous Patch Drafting", description: "AART generates production-ready code patches for every verified vulnerability. Patches are tested against the exploit to confirm remediation before submission." },
                { icon: GitPullRequest, index: "03", title: "Pull Request Automation", description: "Seamlessly integrates with GitHub and GitLab. Verified exploits and their fixes are delivered as pull requests with full context, diffs, and test coverage." },
                { icon: Radar, index: "04", title: "Impact-Based Prioritization", description: "Vulnerabilities are ranked by actual exploitability and business impact — not theoretical CVSS scores. Focus on what matters based on real attack outcomes." },
              ].map((card, i) => (
                <ScrollReveal key={card.index} delay={i * 0.1}>
                  <HoverCard3D>
                    <FeatureCard icon={card.icon} index={card.index} title={card.title} description={card.description} />
                  </HoverCard3D>
                </ScrollReveal>
              ))}
            </div>
          </SectionWrapper>
        </section>

        {/* Innovation Statement */}
        <section className="relative">
          <GridOverlay />
          <SectionWrapper className="text-center">
            <ScrollReveal>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight max-w-4xl mx-auto mb-10">
                We Provide Autonomous Security Validation Driven by{" "}
                <span className="text-primary">Evidence.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap justify-center gap-3">
                {["Sandboxed Attacks", "Deterministic Engine", "AI Hybrid Reasoning", "CI/CD Native", "GitHub Integration", "Zero Noise Alerts"].map((tag) => (
                  <MagneticButton key={tag}>
                    <Badge className="rounded-sm text-xs uppercase tracking-wider px-4 py-1.5 cursor-default">
                      {tag}
                    </Badge>
                  </MagneticButton>
                ))}
              </div>
            </ScrollReveal>
          </SectionWrapper>
        </section>

        {/* Leadership / Credibility */}
        <section id="proof" className="relative">
          <SectionWrapper>
            <ScrollReveal>
              <h2 className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-10">
                The Brilliant Minds <br />Behind AART's Success
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <ScrollReveal direction="left">
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { value: "98%", label: "Reduction in false positives" },
                    { value: "200+", label: "Attack patterns executed" },
                    { value: "3x", label: "Faster remediation cycles" },
                    { value: "95%", label: "Verified exploit accuracy" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <StatsCard value={stat.value} label={stat.label} />
                    </motion.div>
                  ))}
                </div>
              </ScrollReveal>
              <ParallaxSection speed={0.15}>
                <ScrollReveal direction="right">
                  <img
                    src={founderImg}
                    alt="AART leadership"
                    className="w-full max-w-sm mx-auto rounded-sm yellow-filter"
                  />
                </ScrollReveal>
              </ParallaxSection>
            </div>
          </SectionWrapper>
        </section>

        {/* CTA Break */}
        <section className="relative">
          <GridOverlay />
          <SectionWrapper className="text-center">
            <ScrollReveal>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight max-w-3xl mx-auto mb-6">
                Join the Cybersecurity Revolution and Safeguard Your Business Today
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="flex justify-center gap-4">
                <MagneticButton>
                  <Button size="lg" className="uppercase tracking-wider text-xs font-semibold rounded-sm">
                    Request Demo
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button size="lg" variant="outline" className="uppercase tracking-wider text-xs font-semibold rounded-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Contact Sales
                  </Button>
                </MagneticButton>
              </div>
            </ScrollReveal>
          </SectionWrapper>
        </section>

        {/* Industry Tabs */}
        <section id="industries" className="relative">
          <SectionWrapper>
            <ScrollReveal>
              <h2 className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-10">
                Specialized Solutions <br />For Every Industry
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <Tabs defaultValue="fintech" className="flex flex-col md:flex-row gap-6">
                <TabsList className="flex md:flex-col h-auto bg-transparent gap-2 md:w-52 shrink-0">
                  {industries.map((ind) => (
                    <TabsTrigger
                      key={ind.id}
                      value={ind.id}
                      className="justify-start text-left font-heading uppercase tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm px-4 py-3 w-full"
                    >
                      {ind.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {industries.map((ind) => (
                  <TabsContent key={ind.id} value={ind.id} className="flex-1">
                    <HoverCard3D>
                      <Card className="bg-card border-border h-full">
                        <CardContent className="p-6 md:p-8">
                          <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-primary mb-4">
                            Fortifying {ind.label} with Cybersecurity
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {ind.content}
                          </p>
                        </CardContent>
                      </Card>
                    </HoverCard3D>
                  </TabsContent>
                ))}
              </Tabs>
            </ScrollReveal>
          </SectionWrapper>
        </section>

        {/* Testimonials */}
        <section className="relative">
          <SectionWrapper>
            <ScrollReveal>
              <h2 className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-10 text-center">
                Inspiring Success Stories From Clients Who Trust Our Solutions
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <ScrollReveal key={t.name} delay={i * 0.15}>
                  <HoverCard3D>
                    <Card className="bg-card border-border hover:border-primary transition-colors h-full">
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                          "{t.quote}"
                        </p>
                        <Separator className="mb-4" />
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                              {t.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-foreground text-sm font-semibold">{t.name}</div>
                            <div className="text-muted-foreground text-xs">{t.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverCard3D>
                </ScrollReveal>
              ))}
            </div>
          </SectionWrapper>
        </section>

        {/* Final CTA */}
        <section id="contact" className="relative">
          <GridOverlay />
          <SectionWrapper className="text-center py-20 md:py-32">
            <ScrollReveal>
              <motion.div
                className="w-20 h-20 bg-primary rounded-sm mx-auto mb-8"
                whileHover={{ rotate: 45, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-glow">
                AART
              </h2>
            </ScrollReveal>
          </SectionWrapper>
        </section>

        <Footer />
      </motion.div>
    </div>
  );
};

export default Index;
