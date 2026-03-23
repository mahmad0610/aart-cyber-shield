import { useState } from "react";
import { AlertOctagon, Download, BrainCircuit, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useRepos, useDeleteRepo, useResetMemory, useExportData } from "@/hooks/useAartApi";

const SettingsDanger = () => {
    const { data: repos, isLoading } = useRepos();
    const [selectedRepoId, setSelectedRepoId] = useState("");
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteRepoId, setDeleteRepoId] = useState("");

    const deleteRepo = useDeleteRepo();
    const resetMemory = useResetMemory();
    const { refetch: exportData } = useExportData();

    const handleExportData = async () => {
        const { data } = await exportData();
        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `aart-intelligence-export-${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            toast({
                title: "Data Exfiltration Successful",
                description: "Your neural telemetry archive has been downloaded.",
            });
        }
    };

    const handleResetMemory = async () => {
        if (!selectedRepoId) return;
        try {
            await resetMemory.mutateAsync(selectedRepoId);
            toast({
                title: "Memory Erased",
                description: `Neural weights and historical context for the sector have been reset.`,
                variant: "destructive",
            });
            setSelectedRepoId("");
        } catch (err) {
            toast({ title: "Reset Failed", description: "Could not reset threat memory.", variant: "destructive" });
        }
    };

    const handleDeleteRepo = async () => {
        if (!deleteRepoId) return;
        try {
            await deleteRepo.mutateAsync(deleteRepoId);
            toast({
                title: "Sector De-Provisioned",
                description: `The asset and all its associated data have been permanently incinerated.`,
                variant: "destructive",
            });
            setDeleteConfirmText("");
            setDeleteRepoId("");
        } catch (err) {
            toast({ title: "Termination Failed", description: "Could not de-provision sector.", variant: "destructive" });
        }
    };

    const selectedRepoName = repos?.find(r => r.id === selectedRepoId)?.name || "";
    const deleteRepoName = repos?.find(r => r.id === deleteRepoId)?.name || "";

    return (
        <div className="p-10 md:p-16 max-w-3xl space-y-8">
            <div className="mb-12">
                <span className="font-mono text-[10px] text-red-500 uppercase tracking-[0.4em] mb-3 block animate-pulse">Critical Protocols</span>
                <h1 className="font-heading text-4xl font-bold tracking-tight text-red-500 uppercase italic">
                    Danger <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-500/50 to-red-500 glow-text-red">Zone</span>
                </h1>
                <p className="font-mono text-[10px] text-red-500/60 mt-3 uppercase tracking-widest leading-relaxed">
                    DESTRUCTIVE ACTIONS. IRREVERSIBLE DATA MODIFICATIONS. PROCEED WITH EXTREME CAUTION.
                </p>
            </div>

            <Card className="bg-black/60 backdrop-blur-xl border border-red-500/20 rounded-none relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />

                <CardHeader className="px-10 pt-10 pb-6 border-b border-red-500/10">
                    <CardTitle className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] flex items-center gap-4 text-red-500">
                        <TriangleAlert className="h-5 w-5" />
                        [ CRITICAL_OPERATIONS ]
                    </CardTitle>
                </CardHeader>

                <CardContent className="px-10 py-10 space-y-12">

                    {/* Action 1: Export Data */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-white/5">
                        <div className="space-y-2 max-w-xs">
                            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-white">Export Intelligence</h3>
                            <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                Download a complete JSON manifest of all findings, exploit graphs, and scans.
                            </p>
                        </div>
                        <Button
                            onClick={handleExportData}
                            variant="outline"
                            className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 hover:bg-white/10 transition-all shrink-0"
                        >
                            <Download className="mr-3 w-4 h-4" /> Download Archive
                        </Button>
                    </div>

                    {/* Action 2: Reset Memory */}
                    <div className="flex flex-col md:flex-row gap-6 pb-12 border-b border-white/5">
                        <div className="space-y-2 md:w-1/2 shrink-0">
                            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-white">Reset Neural Memory</h3>
                            <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                Clear learned patterns and bias weights for a specific sector. Re-initializes baseline.
                            </p>
                        </div>
                        <div className="flex flex-col space-y-4 md:w-1/2">
                            <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
                                <SelectTrigger className="bg-white/[0.02] border-white/10 rounded-none h-12 font-mono text-[10px] uppercase tracking-widest text-white/60 focus:border-red-500/50 transition-all w-full">
                                    <SelectValue placeholder="SELECT_ASSET_SECTOR" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-none">
                                    {isLoading ? (
                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                    ) : repos?.map((r: any) => (
                                        <SelectItem key={r.id} value={r.id} className="font-mono text-[10px] uppercase tracking-widest text-white/60 focus:bg-white/5">{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        className="hacktron-clip border-red-500/20 text-red-500 uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 hover:bg-red-500/10 transition-all hover:text-red-400 w-full"
                                        disabled={!selectedRepoId}
                                    >
                                        <BrainCircuit className="mr-3 w-4 h-4" /> Erase Weights
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-black/95 backdrop-blur-2xl border border-red-500/30 rounded-none text-center p-12 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-heading text-2xl font-bold uppercase tracking-widest text-white italic mb-4">Confirm Memory Wipe?</AlertDialogTitle>
                                        <AlertDialogDescription className="font-mono text-[11px] text-white/40 uppercase tracking-widest leading-relaxed mb-6">
                                            You are about to irreversibly delete all neural training data and False Positive weights for <span className="text-red-500 font-bold">{selectedRepoName}</span>.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col sm:flex-row gap-4 mt-4">
                                        <AlertDialogCancel className="hacktron-clip border-white/10 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 hover:bg-white/5 transition-all">Abort</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleResetMemory} className="hacktron-clip bg-red-500 hover:bg-red-600 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all">Execute Erase</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    {/* Action 3: Delete Repo */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="space-y-2 md:w-1/2 shrink-0">
                            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-red-500">De-Provision Sector</h3>
                            <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                Incinerate a repository and all its intelligence history, active scans, and threat memory.
                            </p>
                        </div>
                        <div className="flex flex-col space-y-4 md:w-1/2">
                            <Select value={deleteRepoId} onValueChange={setDeleteRepoId}>
                                <SelectTrigger className="bg-red-500/5 border-red-500/20 rounded-none h-12 font-mono text-[10px] uppercase tracking-widest text-red-500/60 focus:border-red-500/50 transition-all w-full">
                                    <SelectValue placeholder="SELECT_ASSET_TO_DESTROY" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 backdrop-blur-2xl border border-red-500/20 rounded-none">
                                    {isLoading ? (
                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                    ) : repos?.map((r: any) => (
                                        <SelectItem key={`del_${r.id}`} value={r.id} className="font-mono text-[10px] uppercase tracking-widest text-red-500 focus:bg-red-500/10">{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="hacktron-clip bg-red-500 hover:bg-red-600 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all w-full"
                                        disabled={!deleteRepoId}
                                    >
                                        <Trash2 className="mr-3 w-4 h-4" /> Initialize Incineration
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-black/95 backdrop-blur-2xl border border-red-500/50 rounded-none p-12 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
                                    <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />

                                    <AlertDialogHeader className="text-center">
                                        <AlertDialogTitle className="font-heading text-2xl font-bold uppercase tracking-widest text-red-500 italic mb-4">Total Asset Annihilation</AlertDialogTitle>
                                        <AlertDialogDescription className="font-mono text-[11px] text-white/50 uppercase tracking-widest leading-relaxed mb-6 space-y-4">
                                            <p>This will permanently destroy <span className="text-white font-bold">{deleteRepoName}</span>.</p>
                                            <p className="text-red-500/80">Please type <span className="text-red-500 font-bold bg-red-500/10 px-2 py-0.5 border border-red-500/20">{deleteRepoName}</span> to confirm.</p>
 
                                            <Input
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                placeholder={`Type ${deleteRepoName} here...`}
                                                className="bg-black/60 border border-red-500/30 text-white font-mono text-[10px] uppercase tracking-widest rounded-none mt-4 focus:border-red-500 transition-all text-center h-12 my-6"
                                            />
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col sm:flex-row gap-4 mt-2 justify-center w-full">
                                        <AlertDialogCancel
                                            onClick={() => setDeleteConfirmText("")}
                                            className="hacktron-clip border-white/10 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 hover:bg-white/5 transition-all w-full sm:w-auto mt-0"
                                        >
                                            Abort
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteRepo}
                                            disabled={deleteConfirmText !== deleteRepoName}
                                            className="hacktron-clip bg-red-600 hover:bg-red-700 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all disabled:opacity-30 disabled:hover:bg-red-600 w-full sm:w-auto"
                                        >
                                            Terminate Asset
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsDanger;
