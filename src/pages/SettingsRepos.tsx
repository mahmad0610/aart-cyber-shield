import { useState } from "react";
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
import { ChevronDown, Trash2, Settings, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoConfig {
  id: string;
  name: string;
  t1: number;
  t2: number;
  frequency: string;
  prBlocking: boolean;
  memoryBias: boolean;
}

const initialRepos: RepoConfig[] = [
  { id: "repo-1", name: "acme/web-app", t1: 0.5, t2: 0.75, frequency: "pr-only", prBlocking: true, memoryBias: true },
  { id: "repo-2", name: "acme/api-service", t1: 0.5, t2: 0.75, frequency: "daily", prBlocking: false, memoryBias: true },
  { id: "repo-3", name: "acme/auth-module", t1: 0.6, t2: 0.8, frequency: "weekly", prBlocking: true, memoryBias: false },
];

const SettingsRepos = () => {
  const [repos, setRepos] = useState<RepoConfig[]>(initialRepos);
  const [openId, setOpenId] = useState<string | null>(null);

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

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Repo Settings</h1>
      <p className="text-muted-foreground text-sm mb-8">Configure scan behavior per repository.</p>

      <div className="space-y-3">
        {repos.map((repo) => {
          const isOpen = openId === repo.id;
          return (
            <Collapsible key={repo.id} open={isOpen} onOpenChange={(v) => setOpenId(v ? repo.id : null)}>
              <Card className="border-border bg-card overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between py-4 px-5 cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Plug className="h-4 w-4 text-primary" />
                      {repo.name}
                    </CardTitle>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-5 px-5 space-y-6 border-t border-border">
                    {/* T1 Slider */}
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">T1 — LLM Assist Threshold</Label>
                        <span className="text-xs font-mono text-primary">{repo.t1.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[repo.t1]}
                        onValueChange={([v]) => updateRepo(repo.id, { t1: Math.round(v * 100) / 100 })}
                        min={0.1} max={0.9} step={0.05}
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower values make AART call the LLM more often, increasing thoroughness but also cost. Higher values reduce LLM usage.
                      </p>
                    </div>

                    {/* T2 Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">T2 — Sandbox Trigger Threshold</Label>
                        <span className="text-xs font-mono text-primary">{repo.t2.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[repo.t2]}
                        onValueChange={([v]) => updateRepo(repo.id, { t2: Math.round(v * 100) / 100 })}
                        min={0.3} max={1.0} step={0.05}
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower values trigger the sandbox more aggressively, catching more issues but using more resources. Higher values only sandbox high-confidence threats.
                      </p>
                    </div>

                    {/* Scan Frequency */}
                    <div className="space-y-2">
                      <Label className="text-sm">Scan Frequency</Label>
                      <Select value={repo.frequency} onValueChange={(v) => updateRepo(repo.id, { frequency: v })}>
                        <SelectTrigger className="max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual only</SelectItem>
                          <SelectItem value="pr-only">PR only</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">PR Blocking</Label>
                          <p className="text-xs text-muted-foreground">Block PR merges when a confirmed exploit is found.</p>
                        </div>
                        <Switch checked={repo.prBlocking} onCheckedChange={(v) => updateRepo(repo.id, { prBlocking: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Memory Bias</Label>
                          <p className="text-xs text-muted-foreground">Let threat memory influence scan prioritization.</p>
                        </div>
                        <Switch checked={repo.memoryBias} onCheckedChange={(v) => updateRepo(repo.id, { memoryBias: v })} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 mr-1.5" /> Remove Repo
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {repo.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will disconnect the repo and permanently delete all scan data, findings, and threat memory associated with it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeRepo(repo.id, repo.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button size="sm" onClick={() => saveRepo(repo.name)}>
                        <Settings className="h-4 w-4 mr-1.5" /> Save
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
