import { motion } from "framer-motion";
import { Radar, Bug, GitPullRequest, Brain, Lock, ArrowRight, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import GridOverlay from "@/components/GridOverlay";
import FeatureCard from "@/components/FeatureCard";
import StatsCard from "@/components/StatsCard";
import heroImage from "@/assets/landing-hero.jpg";

import networkGrid from "@/assets/network-grid.jpg";
import founderImg from "@/assets/founder.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

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
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        <GridOverlay />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px] pointer-events-none" />
        <SectionWrapper className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.h1
                variants={fadeUp}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase tracking-tight leading-[0.95] mb-6 text-glow"
              >
                No False Positives.{" "}
                <span className="text-primary">Only Verified Breaches.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg max-w-lg mb-8 leading-relaxed">
                AART combines a deterministic attack engine with AI hybrid reasoning to autonomously exploit, verify, and patch web application vulnerabilities — in real time.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Button size="lg" className="uppercase tracking-wider text-xs font-semibold rounded-sm">
                  Request Demo
                </Button>
                <Button size="lg" variant="outline" className="uppercase tracking-wider text-xs font-semibold rounded-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  View Architecture <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <img
                src={networkGrid}
                alt="Network security visualization"
                className="w-full rounded-sm yellow-filter opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </motion.div>
          </div>
        </SectionWrapper>
      </section>

      {/* Core Value Panels */}
      <section id="engine" className="relative">
        <SectionWrapper>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div variants={fadeUp}>
              <FeatureCard icon={Target} index="01" title="Deterministic Attack Engine" description="No probabilistic guessing. Every attack path is executed with deterministic precision in isolated sandboxes, producing verifiable exploit evidence." />
            </motion.div>
            <motion.div variants={fadeUp}>
              <FeatureCard icon={Zap} index="02" title="Closed-Loop Remediation" description="From exploit to fix in one cycle. AART drafts patches, opens pull requests, and validates the remediation — fully autonomous, zero manual intervention." />
            </motion.div>
            <motion.div variants={fadeUp}>
              <FeatureCard icon={Brain} index="03" title="Product-Specific Threat Memory" description="AART learns your application's unique attack surface and retains threat intelligence across scans, building a persistent security knowledge graph." />
            </motion.div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Mission / Vision */}
      <section className="relative">
        <SectionWrapper>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-10 max-w-3xl">
              We Provide Tailored Cybersecurity Solutions to Protect Your Business From Digital Threats.
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div variants={fadeUp}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6 md:p-8">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-primary mb-4">/ Mission</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Eliminate theoretical security findings by executing real attacks in sandboxed environments. We believe security validation must be evidence-based — every vulnerability confirmed through deterministic exploitation, not statistical probability.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6 md:p-8">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-primary mb-4">/ Vision</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      A world where autonomous red teaming continuously validates and patches application security — where vulnerabilities are discovered, verified, and remediated before attackers ever reach them. Security as an autonomous, self-healing system.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Full-Width Image */}
      <section className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
        <img src={heroImage} alt="Security operations center" className="w-full h-full object-cover yellow-filter opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background" />
      </section>

      {/* Solutions Grid */}
      <section id="product" className="relative">
        <SectionWrapper>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Powerful Solutions <br />For Unmatched Security
            </motion.h2>
            <motion.div variants={fadeUp} className="flex gap-4 mb-10">
              <Button size="sm" className="uppercase tracking-wider text-xs font-semibold rounded-sm">
                Request Demo
              </Button>
              <Button size="sm" variant="outline" className="uppercase tracking-wider text-xs font-semibold rounded-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Learn More
              </Button>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div variants={fadeUp}>
                <FeatureCard icon={Bug} index="01" title="API Exploit Verification" description="Every vulnerability is confirmed through real exploitation in sandboxed environments. No theoretical findings — only verified breaches with full attack chain evidence and reproduction steps." />
              </motion.div>
              <motion.div variants={fadeUp}>
                <FeatureCard icon={Lock} index="02" title="Autonomous Patch Drafting" description="AART generates production-ready code patches for every verified vulnerability. Patches are tested against the exploit to confirm remediation before submission." />
              </motion.div>
              <motion.div variants={fadeUp}>
                <FeatureCard icon={GitPullRequest} index="03" title="Pull Request Automation" description="Seamlessly integrates with GitHub and GitLab. Verified exploits and their fixes are delivered as pull requests with full context, diffs, and test coverage." />
              </motion.div>
              <motion.div variants={fadeUp}>
                <FeatureCard icon={Radar} index="04" title="Impact-Based Prioritization" description="Vulnerabilities are ranked by actual exploitability and business impact — not theoretical CVSS scores. Focus on what matters based on real attack outcomes." />
              </motion.div>
            </div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Innovation Statement */}
      <section className="relative">
        <GridOverlay />
        <SectionWrapper className="text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight max-w-4xl mx-auto mb-10">
              We Provide Autonomous Security Validation Driven by{" "}
              <span className="text-primary">Evidence.</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              {["Sandboxed Attacks", "Deterministic Engine", "AI Hybrid Reasoning", "CI/CD Native", "GitHub Integration", "Zero Noise Alerts"].map((tag) => (
                <Badge key={tag} className="rounded-sm text-xs uppercase tracking-wider px-4 py-1.5">
                  {tag}
                </Badge>
              ))}
            </motion.div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Leadership / Credibility */}
      <section id="proof" className="relative">
        <SectionWrapper>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-10">
              The Brilliant Minds <br />Behind AART's Success
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeUp}>
                <div className="grid grid-cols-2 gap-8">
                  <StatsCard value="98%" label="Reduction in false positives" />
                  <StatsCard value="200+" label="Attack patterns executed" />
                  <StatsCard value="3x" label="Faster remediation cycles" />
                  <StatsCard value="95%" label="Verified exploit accuracy" />
                </div>
              </motion.div>
              <motion.div variants={fadeUp} className="relative">
                <img
                  src={founderImg}
                  alt="AART leadership"
                  className="w-full max-w-sm mx-auto rounded-sm yellow-filter"
                />
              </motion.div>
            </div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* CTA Break */}
      <section className="relative">
        <GridOverlay />
        <SectionWrapper className="text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight max-w-3xl mx-auto mb-6">
              Join the Cybersecurity Revolution and Safeguard Your Business Today
            </motion.h2>
            <motion.div variants={fadeUp} className="flex justify-center gap-4">
              <Button size="lg" className="uppercase tracking-wider text-xs font-semibold rounded-sm">
                Request Demo
              </Button>
              <Button size="lg" variant="outline" className="uppercase tracking-wider text-xs font-semibold rounded-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Contact Sales
              </Button>
            </motion.div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Industry Tabs */}
      <section id="industries" className="relative">
        <SectionWrapper>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-10">
              Specialized Solutions <br />For Every Industry
            </motion.h2>
            <motion.div variants={fadeUp}>
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
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Testimonials */}
      <section className="relative">
        <SectionWrapper>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight mb-10 text-center">
              Inspiring Success Stories From Clients Who Trust Our Solutions
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <motion.div key={t.name} variants={fadeUp}>
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Final CTA */}
      <section id="contact" className="relative">
        <GridOverlay />
        <SectionWrapper className="text-center py-20 md:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="w-20 h-20 bg-primary rounded-sm mx-auto mb-8" />
            <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-glow">
              AART
            </motion.h2>
          </motion.div>
        </SectionWrapper>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
