import { Link } from "react-router-dom";
import { AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServerError = () => {
    // Generate a random incident ID for realism
    const incidentId = Math.random().toString(36).substring(2, 10).toUpperCase();

    return (
        <div className="flex min-h-screen items-center justify-center p-6 bg-black">
            <div className="max-w-lg w-full text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/10 blur-[100px] pointer-events-none" />

                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />

                <div className="mb-8">
                    <span className="font-mono text-[10px] text-red-500 uppercase tracking-[0.4em] mb-3 block">Engine_Failure: 500</span>
                    <h1 className="font-heading text-5xl font-bold tracking-tight text-white uppercase italic mb-4">
                        System Fault
                    </h1>
                    <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest leading-relaxed mb-6">
                        A catastrophic failure occurred within the neural core. The engineering cell has been notified of this anomaly automatically.
                    </p>

                    <div className="bg-red-500/5 border border-red-500/20 p-4 inline-block mx-auto mb-2 text-left">
                        <p className="font-mono text-[9px] text-red-500/60 uppercase tracking-widest mb-1">Incident_Reference</p>
                        <p className="font-mono text-xs text-red-500 font-bold uppercase tracking-widest leading-none bg-red-500/10 px-3 py-1.5 border border-red-500/20">
                            ERR-{incidentId}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        className="hacktron-clip bg-red-500 hover:bg-red-600 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCcw className="mr-3 w-4 h-4" /> Execute Retry
                    </Button>
                    <Link to="/dashboard">
                        <Button variant="outline" className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 hover:bg-white/10 transition-all w-full sm:w-auto">
                            <ArrowLeft className="mr-3 w-4 h-4" /> Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ServerError;
