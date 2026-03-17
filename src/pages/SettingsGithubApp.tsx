import { useState, useEffect } from "react";
import { Github, CheckCircle2, AlertTriangle, RefreshCcw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const SettingsGithubApp = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const installed = localStorage.getItem("github-app-installed") === "true";
        setIsConnected(installed);
    }, []);

    const handleUninstall = () => {
        setIsConnected(false);
        localStorage.setItem("github-app-installed", "false");
        toast({
            title: "GitHub App Uninstalled",
            description: "AART no longer has access to your repositories.",
            variant: "destructive",
        });
    };

    const handleReconnect = () => {
        setIsConnected(true);
        localStorage.setItem("github-app-installed", "true");
        toast({
            title: "GitHub App Reconnected",
            description: "Permissions have been successfully granted.",
        });
    };

    return (
        <div className="p-10 md:p-16 max-w-3xl space-y-8">
            <div className="mb-12">
                <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Version Control Integration</span>
                <h1 className="font-heading text-4xl font-bold tracking-tight text-white uppercase italic">
                    GitHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">App</span>
                </h1>
                <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-widest leading-relaxed">
                    MANAGE PIPELINE ACCESS AND AUTOMATED PULL REQUEST REMEDIATIONS.
                </p>
            </div>

            <Card className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-none relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-[1px] ${isConnected ? "bg-gradient-to-r from-transparent via-green-500/50 to-transparent" : "bg-gradient-to-r from-transparent via-red-500/50 to-transparent"}`} />

                <CardHeader className="px-10 pt-10 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] flex items-center gap-4 text-white">
                            <Github className="h-4 w-4" />
                            [ GITHUB_PROTOCOL_LINK ]
                        </CardTitle>
                        <CardDescription className="font-mono text-[9px] text-white/30 uppercase tracking-widest mt-2">
                            Provides direct access to execute mitigations via pull requests.
                        </CardDescription>
                    </div>
                    {isConnected ? (
                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest font-bold text-green-500 px-3 py-1 bg-green-500/10 border border-green-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Connected
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest font-bold text-red-500 px-3 py-1 bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Disconnected
                        </div>
                    )}
                </CardHeader>

                <CardContent className="px-10 py-10">
                    {isConnected ? (
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                                    AART is actively monitoring your connected repositories and executing automated security checks on pipeline runs.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.02] border border-white/5 p-4">
                                        <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.2em] mb-1">Installed_On</p>
                                        <p className="font-mono text-[10px] text-white uppercase tracking-widest">2026-01-15 08:42 UTC</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 p-4">
                                        <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.2em] mb-1">Coverage</p>
                                        <p className="font-mono text-[10px] text-white uppercase tracking-widest">3 Repositories</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-white/5">
                                <Button
                                    onClick={handleReconnect}
                                    variant="outline"
                                    className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 hover:bg-white/10 transition-all"
                                >
                                    <RefreshCcw className="mr-2 w-3.5 h-3.5" /> Update Permissions
                                </Button>
                                <Button
                                    onClick={handleUninstall}
                                    variant="outline"
                                    className="hacktron-clip border-red-500/20 text-red-500 uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 hover:bg-red-500/10 transition-all hover:text-red-400"
                                >
                                    <Unplug className="mr-2 w-3.5 h-3.5" /> Terminate Connection
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 text-center py-6">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto opacity-40 mb-4" />
                            <div>
                                <h3 className="font-heading text-xl font-bold uppercase tracking-widest text-white italic mb-2">Integration Inactive</h3>
                                <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
                                    Pull request checks and automated remediations are currently paused. Reconnect to resume neural security scanning on commits.
                                </p>
                            </div>
                            <Button
                                onClick={handleReconnect}
                                className="hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-10 transition-all shadow-[0_0_15px_rgba(125,131,250,0.3)]"
                            >
                                <Github className="mr-3 w-4 h-4" /> Re-Initialize Authorization
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsGithubApp;
