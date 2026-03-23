import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
      setSubmitted(true);
      toast({
        title: "Reset link dispatched",
        description: "Check your neural uplink (inbox) for instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Transmission Error",
        description: error.message || "Failed to send reset link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-8">
            <div className="w-16 h-16 border-2 border-primary bg-primary/5 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(125,131,250,0.2)]">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </Link>
          <h1 className="font-heading text-4xl font-bold uppercase tracking-tighter text-white italic">
            Restore <span className="text-primary">Access</span>
          </h1>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em] mt-3">
            AART IDENTITY RECOVERY PROTOCOL
          </p>
        </div>

        <Card className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(125,131,250,0.5)]" />
          
          <CardContent className="p-10">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="email" className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                    Registered Uplink Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="OPERATIVE@AART.IO"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 bg-white/5 border-white/10 text-white font-mono text-xs uppercase tracking-widest rounded-none h-14 focus:border-primary/50 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-xs font-bold h-14 transition-all shadow-[0_10px_30px_rgba(125,131,250,0.2)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 w-4 h-4 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    "Authorize Recovery"
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-8">
                <div className="w-20 h-20 bg-success/10 border border-success/20 flex items-center justify-center mx-auto rounded-full">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tight">Transmission Sent</h3>
                  <p className="font-mono text-[11px] text-white/40 leading-loose uppercase tracking-widest">
                    A recovery link has been beamed to <span className="text-white font-bold">{email}</span>. Use it to override your credentials.
                  </p>
                </div>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="w-full uppercase tracking-[0.2em] text-[10px] font-bold h-12 rounded-none border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                >
                  Didn't receive it? Try again
                </Button>
              </div>
            )}

            <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-center">
              <Link
                to="/login"
                className="font-mono text-[10px] text-white/30 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-3"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Access Point
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-10 font-mono text-[9px] text-white/20 uppercase tracking-[0.4em]">
          ENCRYPTED SESSION // AART RECOVERY
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
