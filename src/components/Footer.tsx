import logoIcon from "@/assets/logo-icon.svg";

const Footer = () => (
  <footer className="border-t border-white/15 bg-background relative overflow-hidden flex flex-col">
    <div className="flex flex-col md:flex-row w-full flex-grow">

      {/* LEFT COLUMN: ABOUT */}
      <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-white/15 p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[400px]">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 mb-8">About</h3>
          <p className="font-mono text-[13px] leading-relaxed text-white/80 max-w-md">
            aart is a fully autonomous offensive security platform that conducts comprehensive security assessments without human intervention.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-16 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            <div>
              <h4 className="text-white mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CLI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Platform</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-6">Research</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tags</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Authors</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-6">Connect</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Call</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Write</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Email</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-6">Social</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end mt-24">
          <div className="flex items-center gap-4 border border-white/15 pr-6 rounded-none p-2 bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80">
              <span className="font-brand text-[10px] text-black font-bold">SOC</span>
            </div>
            <span className="font-mono text-[10px] tracking-widest text-white uppercase">Trust Center</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
            <span className="text-white/60">●</span> All Systems Operational
          </div>
        </div>
        <div className="mt-8 font-mono text-[10px] text-white/30 tracking-widest">
          AART AI © 2026
        </div>
      </div>

      {/* RIGHT COLUMN: DIAGNOSTICS */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-start min-h-[400px] relative">
        {/* Corner markers */}
        <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/30" />
        <div className="absolute bottom-12 right-8 w-4 h-4 border-b border-r border-white/30" />
        <div className="absolute bottom-12 left-8 w-4 h-4 border-b border-l border-white/30" />

        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 mb-10 pl-2">Diagnostics</h3>

        <div className="grid grid-cols-2 gap-x-12 gap-y-4 font-mono text-[11px] tracking-widest px-2">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Platform</span>
            <span className="text-white">Win32</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Language</span>
            <span className="text-white">en-US</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Network</span>
            <span className="text-white">4g</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Memory</span>
            <span className="text-white">9/11MB</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Cores</span>
            <span className="text-white">16</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Uptime</span>
            <span className="text-white">175S</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Viewport</span>
            <span className="text-white truncate max-w-[100px] text-right">1680x923</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Screen</span>
            <span className="text-white">1680x1050</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Color Depth</span>
            <span className="text-white">32BIT</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Timezone</span>
            <span className="text-white truncate max-w-[100px] text-right">Asia/Karachi</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2 flex-grow">
            <span className="text-white/40 uppercase w-full">Cookies</span>
            <span className="text-white hover:text-white/80 transition-colors cursor-crosshair text-right whitespace-nowrap">ENABLED</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2 flex-grow">
            <span className="text-white/40 uppercase w-full">WebGL</span>
            <span className="text-white text-right">ENABLED</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-white/40 uppercase">Stat</span>
            <span className="text-white/60 whitespace-nowrap">● ONLINE</span>
          </div>
        </div>

        <div className="mt-auto pt-8 font-mono text-[10px] text-white/30 truncate uppercase tracking-widest px-2 opacity-70">
          User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'Mozilla/5.0'}
        </div>
      </div>
    </div>

    {/* BOTTOM MARQUEE */}
    <div className="border-t border-white/15 w-full bg-white/5 flex flex-col justify-center h-12 relative overflow-hidden pointer-events-none">
      <div className="animate-marquee whitespace-nowrap flex items-center font-mono text-[11px] tracking-[0.3em] text-white/50 font-bold uppercase w-max">
        {/* Duplicate content for seamless loop */}
        {[...Array(6)].map((_, i) => (
          <span key={i} className="flex items-center mx-4 group">
            <img src={logoIcon} alt="logo" className="w-5 h-5 mr-3 opacity-80" />
            AART <span className="mx-6 text-white/20 font-light px-6">||</span> PoC || GTFO <span className="mx-6 text-white/20 font-light px-6">||</span>
          </span>
        ))}
      </div>
    </div>

    <style dangerouslySetInnerHTML={{
      __html: `
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-marquee {
        animation: marquee 20s linear infinite;
      }
    `}} />
  </footer>
);

export default Footer;

