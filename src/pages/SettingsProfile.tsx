import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Info } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const SettingsProfile = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "");
  const email = user?.email || "";

  const handleSave = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName }
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile updated",
      description: "Your operative alias has been synchronized.",
    });
  };

  return (
    <div className="p-10 md:p-16 max-w-3xl">
      <div className="mb-12">
        <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Neural Identity Management</span>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-white uppercase italic">
          User <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">Profile</span>
        </h1>
        <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-widest leading-relaxed">
          CALIBRATE YOUR OPERATIVE SIGNATURE AND ACCESS PARAMETERS.
        </p>
      </div>

      <Card className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-none relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <CardHeader className="px-10 pt-10 pb-6 border-b border-white/5">
          <CardTitle className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] flex items-center gap-4 text-white">
            <User className="h-4 w-4 text-primary" />
            [ ACCOUNT_CORE_DATA ]
          </CardTitle>
          <CardDescription className="font-mono text-[9px] text-white/30 uppercase tracking-widest mt-2">
            Synchronized with persistent neural index.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 py-10 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="displayName" className="font-mono text-[10px] uppercase font-bold tracking-widest text-primary/60">Operative Alias</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-white/5 border-white/10 rounded-none font-mono text-xs uppercase tracking-widest focus:border-primary/50 transition-all h-12"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="font-mono text-[10px] uppercase font-bold tracking-widest text-primary/60 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Neural Endpoint
            </Label>
            <Input
              id="email"
              value={email}
              readOnly
              disabled
              className="bg-black/40 border-white/5 rounded-none font-mono text-xs uppercase tracking-widest opacity-40 cursor-not-allowed h-12"
            />
            <div className="flex items-center gap-3 font-mono text-[9px] text-white/20 uppercase tracking-widest mt-3">
              <Info className="h-3 w-3 text-primary/40" />
              Endpoint is immutable. Managed via GitHub OAuth Protocol.
            </div>
          </div>

          <div className="pt-6">
            <Button onClick={handleSave} className="hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-10 transition-all shadow-[0_0_15px_rgba(125,131,250,0.3)]">
              COMMIT CHANGES
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsProfile;
