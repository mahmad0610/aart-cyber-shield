import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Access to non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-black">
      <div className="max-w-md w-full text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none" />

        <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-6 opacity-80 animate-pulse" />

        <div className="mb-8">
          <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Error_Code: 404</span>
          <h1 className="font-heading text-5xl font-bold tracking-tight text-white uppercase italic mb-4">
            Vector Not Found
          </h1>
          <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest leading-relaxed">
            The requested neural path <span className="text-white/80 shrink-0">`{location.pathname}`</span> does not exist or has been redacted from the active index.
          </p>
        </div>

        <Link to="/dashboard">
          <Button className="hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all shadow-[0_0_15px_rgba(125,131,250,0.3)] w-full">
            <ArrowLeft className="mr-3 w-4 h-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
