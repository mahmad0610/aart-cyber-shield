import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { ChevronDown, Trash2, Settings, Plug, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface RepoConfig {
  id: string;
  name: string;
  t1: number;
  t2: number;
  frequency: string;
  prBlocking: boolean;
  memoryBias: boolean;
}

const SettingsRepos = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get('/repos');
        // Map backend repos to the config format
        const mapped = res.data.map((r: any) => ({
          id: r.id,
          name: r.name,
          t1: 0.5,
          t2: 0.75,
          frequency: "pr-only",
          prBlocking: true,
          memoryBias: true
        }));
        setRepos(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const updateRepo = (id: string, patch: Partial<RepoConfig>) => {
    setRepos((r) => r.map((repo) => (repo.id === id ? { ...repo, ...patch } : repo)));
  };

  const saveRepo = (name: string) => {
    toast({ title: "Settings saved", description: `Configuration for ${name} has been updated.` });
  };

  const removeRepo = (id: string, name: string) => {
    setRepos((r) => r.filter((repo) => repo.id !== id));
    toast({ title: "Repo removed", description: `${name} has been disconnected and all its data removed.`, variant: "destructive" });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-10 md:p-16 max-w-3xl">
      <div className="mb-12">
        <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Neural Configuration Vector</span>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-white uppercase italic">
          Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">Settings</span>
        </h1>
        <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-widest leading-relaxed">
          CALIBRATE NEURAL ENGINE WEIGHTS AND SECTOR-SPECIFIC PROTOCOLS.
        </p>
      </div>

      <div className="space-y-4">
        {repos.map((repo) => {
          const isOpen = openId === repo.id;
          return (
            <Collapsible key={repo.id} open={isOpen} onOpenChange={(v) => setOpenId(v ? repo.id : null)}>
              <Card className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-none overflow-hidden transition-all duration-300">
                <CollapsibleTrigger className="w-full">
                  <div className="flex flex-row items-center justify-between py-6 px-8 cursor-pointer hover:bg-white/[0.03] transition-colors relative group">
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary group-hover:block hidden shadow-[0_0_10px_rgba(125,131,250,0.5)]" />
                    <CardTitle className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-4 text-white">
                      <Plug className="h-4 w-4 text-primary" />
                      {repo.name}
                    </CardTitle>
                    <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-500", isOpen && "rotate-180 text-primary")} />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-2 pb-8 px-10 space-y-10 border-t border-white/5 bg-black/40">
                    {/* T1 Slider */}
                    <div className="space-y-5 pt-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-primary/60">T1_THRESHOLD_OPERATOR</Label>
                          <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Neural inference assist level (Lower = Deep Assessment)</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-white px-3 py-1 bg-white/5 border border-white/10">{repo.t1.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[repo.t1]}
                        onValueChange={([v]) => updateRepo(repo.id, { t1: Math.round(v * 100) / 100 })}
                        min={0.1} max={0.9} step={0.05}
                        className="py-4"
                      />
                    </div>

                    {/* T2 Slider */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-primary/60">T2_TERMINAL_TRIGGER</Label>
                          <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Sandbox execution sensitivity (Lower = Aggressive Validation)</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-white px-3 py-1 bg-white/5 border border-white/10">{repo.t2.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[repo.t2]}
                        onValueChange={([v]) => updateRepo(repo.id, { t2: Math.round(v * 100) / 100 })}
                        min={0.3} max={1.0} step={0.05}
                        className="py-4"
                      />
                    </div>

                    {/* Scan Frequency */}
                    <div className="space-y-4">
                      <Label className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-primary/60">PROTOCOL_INTERVAL</Label>
                      <Select value={repo.frequency} onValueChange={(v) => updateRepo(repo.id, { frequency: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-none h-12 font-mono text-[10px] uppercase tracking-widest text-white/60 focus:border-primary/50 transition-all max-w-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-none">
                          <SelectItem value="manual" className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 focus:bg-white/5">Manual Assessment</SelectItem>
                          <SelectItem value="pr-only" className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 focus:bg-white/5">Pipeline_Triggers_Only</SelectItem>
                          <SelectItem value="daily" className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 focus:bg-white/5">Daily_Cycle</SelectItem>
                          <SelectItem value="weekly" className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 focus:bg-white/5">Weekly_Cycle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Toggles */}
                    <div className="grid sm:grid-cols-2 gap-10">
                      <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
                        <div className="space-y-1">
                          <Label className="font-mono text-[10px] uppercase font-bold tracking-widest text-white">Pipeline Blocking</Label>
                          <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest leading-relaxed">Neutralize PR merges on confirmed breach.</p>
                        </div>
                        <Switch className="data-[state=checked]:bg-primary" checked={repo.prBlocking} onCheckedChange={(v) => updateRepo(repo.id, { prBlocking: v })} />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
                        <div className="space-y-1">
                          <Label className="font-mono text-[10px] uppercase font-bold tracking-widest text-white">Neural Bias</Label>
                          <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest leading-relaxed">Apply historical weights to sector logic.</p>
                        </div>
                        <Switch className="data-[state=checked]:bg-primary" checked={repo.memoryBias} onCheckedChange={(v) => updateRepo(repo.id, { memoryBias: v })} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-10 border-t border-white/5">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all h-10 px-6">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> De-Provision Sector
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-none text-center p-12 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-heading text-2xl font-bold uppercase tracking-widest text-white italic mb-4">Confirm De-Provisioning?</AlertDialogTitle>
                            <AlertDialogDescription className="font-mono text-[11px] text-white/40 uppercase tracking-widest leading-relaxed mb-6">
                              This action will incinerate all scan histories, findings ledger, and neural memory weights for <span className="text-white font-bold">{repo.name}</span>. This is irreversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-4 mt-4">
                            <AlertDialogCancel className="hacktron-clip border-white/10 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 hover:bg-white/5 transition-all">Abort</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeRepo(repo.id, repo.name)} className="hacktron-clip bg-red-500 hover:bg-red-600 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all">Execute Deletion</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button onClick={() => saveRepo(repo.name)} className="hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-10 transition-all shadow-[0_0_15px_rgba(125,131,250,0.3)]">
                        <Settings className="h-3.5 w-3.5 mr-2" /> Update Calibration
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsRepos;
