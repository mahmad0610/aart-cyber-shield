import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Shield, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const ATTACK_PATTERNS = [
  { name: "IDOR / Broken Object Level Authorization", scenarios: 24 },
  { name: "Missing Authentication on sensitive endpoints", scenarios: 12 },
  { name: "Privilege Escalation via role manipulation", scenarios: 8 },
  { name: "Mass Assignment on user-controlled fields", scenarios: 6 },
  { name: "SQL / NoSQL Injection via tainted input", scenarios: 18 },
  { name: "Cross-user data exposure through API enumeration", scenarios: 14 },
];

const CleanRepo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const repoName = searchParams.get("repo") || "your repo";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      {/* ─── Success mark ─── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full border-2 border-emerald-400/40 flex items-center justify-center bg-emerald-500/5">
          <ShieldCheck className="w-12 h-12 text-emerald-400" />
        </div>
      </motion.div>

      {/* ─── Headline ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center max-w-xl mb-12"
      >
        <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tight mb-3">
          No critical issues confirmed in <span className="text-emerald-400">{repoName}</span>
        </h1>
        <p className="text-white/50 font-mono text-sm leading-relaxed">
          Here is what we checked and attacked. Each line below represents a real attack
          pattern that was executed against a sandboxed copy of your application.
        </p>
      </motion.div>

      {/* ─── Attack pattern checklist ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-2xl space-y-2 mb-12"
      >
        {ATTACK_PATTERNS.map((pattern, i) => (
          <motion.div
            key={pattern.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="flex items-center gap-3 py-2.5 px-4 border border-white/5 rounded-lg bg-white/[0.01]"
          >
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-mono text-xs text-white/70 flex-1">{pattern.name}</span>
            <span className="font-mono text-[10px] text-white/30">
              {pattern.scenarios} scenarios
            </span>
            <span className="font-mono text-[10px] text-emerald-400/70 uppercase tracking-wider">clean</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── CTA ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={() => navigate("/onboarding/github-app")}
          className="font-mono text-xs gap-2 h-11 px-6"
        >
          <Shield className="w-4 h-4" /> Set up PR Protection
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="font-mono text-xs gap-2 h-11 px-6 border-white/10 text-white/60 hover:text-white"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default CleanRepo;
