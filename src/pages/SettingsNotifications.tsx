import { useState } from "react";
import { Bell, ShieldAlert, FileSearch, CheckCircle2, PackageSearch } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const initialSettings = {
    confirmedExploit: true,
    advisoryFinding: false,
    scanComplete: true,
    fixVerified: true,
    weeklyDigest: true,
};

const SettingsNotifications = () => {
    const [settings, setSettings] = useState(initialSettings);

    const handleToggle = (key: keyof typeof settings) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            toast({
                title: "Communication Protocol Updated",
                description: "Your alert preferences have been saved to the neural core.",
            });
            return next;
        });
    };

    return (
        <div className="p-10 md:p-16 max-w-3xl space-y-8">
            <div className="mb-12">
                <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Communications Relay</span>
                <h1 className="font-heading text-4xl font-bold tracking-tight text-white uppercase italic">
                    Alert <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">Vectors</span>
                </h1>
                <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-widest leading-relaxed">
                    CALIBRATE INBOUND TELEMETRY AND INTELLIGENCE NOTIFICATIONS.
                </p>
            </div>

            <Card className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-none relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <CardHeader className="px-10 pt-10 pb-6 border-b border-white/5">
                    <CardTitle className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] flex items-center gap-4 text-white">
                        <Bell className="h-4 w-4 text-primary" />
                        [ EVENT_TRIGGERS ]
                    </CardTitle>
                    <CardDescription className="font-mono text-[9px] text-white/30 uppercase tracking-widest mt-2">
                        Emails are dispatched to the primary neural endpoint on file.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-10 py-10 space-y-2">
                    <div className="flex items-center justify-between py-6 px-6 bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                            <div className="space-y-1">
                                <Label className="font-mono text-[11px] uppercase font-bold tracking-widest text-white cursor-pointer" onClick={() => handleToggle("confirmedExploit")}>
                                    Confirmed Exploit Detected
                                </Label>
                                <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                    High urgency: AART successfully breached a repository and confirmed an attack vector.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.confirmedExploit}
                            onCheckedChange={() => handleToggle("confirmedExploit")}
                            className="data-[state=checked]:bg-primary ml-4"
                        />
                    </div>

                    <div className="flex items-center justify-between py-6 px-6 bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group">
                        <div className="flex items-start gap-4">
                            <FileSearch className="w-5 h-5 text-yellow-500 mt-1 shrink-0" />
                            <div className="space-y-1">
                                <Label className="font-mono text-[11px] uppercase font-bold tracking-widest text-white cursor-pointer" onClick={() => handleToggle("advisoryFinding")}>
                                    Advisory Signal Identified
                                </Label>
                                <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                    Medium urgency: A potential vulnerability pattern was found but not actively exploited.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.advisoryFinding}
                            onCheckedChange={() => handleToggle("advisoryFinding")}
                            className="data-[state=checked]:bg-primary ml-4"
                        />
                    </div>

                    <div className="flex items-center justify-between py-6 px-6 bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group">
                        <div className="flex items-start gap-4">
                            <PackageSearch className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
                            <div className="space-y-1">
                                <Label className="font-mono text-[11px] uppercase font-bold tracking-widest text-white cursor-pointer" onClick={() => handleToggle("scanComplete")}>
                                    Assessment Cycle Completed
                                </Label>
                                <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                    Notification sent when a repository scanning sequence finishes executing.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.scanComplete}
                            onCheckedChange={() => handleToggle("scanComplete")}
                            className="data-[state=checked]:bg-primary ml-4"
                        />
                    </div>

                    <div className="flex items-center justify-between py-6 px-6 bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group">
                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                            <div className="space-y-1">
                                <Label className="font-mono text-[11px] uppercase font-bold tracking-widest text-white cursor-pointer" onClick={() => handleToggle("fixVerified")}>
                                    Mitigation Verified
                                </Label>
                                <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                    AART successfully generated and sandbox-verified a neural patch for a vulnerability.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.fixVerified}
                            onCheckedChange={() => handleToggle("fixVerified")}
                            className="data-[state=checked]:bg-primary ml-4"
                        />
                    </div>

                    <div className="flex items-center justify-between py-6 px-6 bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group mt-8">
                        <div className="flex items-start gap-4">
                            <Bell className="w-5 h-5 text-white/60 mt-1 shrink-0" />
                            <div className="space-y-1">
                                <Label className="font-mono text-[11px] uppercase font-bold tracking-widest text-white cursor-pointer" onClick={() => handleToggle("weeklyDigest")}>
                                    Weekly Intelligence Digest
                                </Label>
                                <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                    A comprehensive summary of all open findings, resolved items, and system health.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.weeklyDigest}
                            onCheckedChange={() => handleToggle("weeklyDigest")}
                            className="data-[state=checked]:bg-primary ml-4"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsNotifications;
