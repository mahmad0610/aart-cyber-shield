import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Terminal } from 'lucide-react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface ProofTabProps {
  curlCommand: string;
  responseBody: string;
}

export function ProofTab({ curlCommand, responseBody }: ProofTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Target Config / Attack Type Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attack type', value: 'IDOR — Horizontal escalation' },
          { label: 'Auth context', value: 'JWT Bearer token (User A)' },
          { label: 'Target route', value: 'GET /invoices/:id' },
          { label: 'Sandbox execution', value: 'User A (attacker) · User B (victim)' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111113] p-4 rounded-xl border border-white/5">
            <h3 className="text-[#888780] font-mono text-[10px] uppercase mb-2">{stat.label}</h3>
            <p className="text-white font-mono text-sm shadow-[0_0_10px_rgba(255,255,255,0.05)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Request Viewer */}
        <div className="flex flex-col h-[500px] bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#D85A30]" />
              <span className="font-mono text-[11px] text-white/50 uppercase tracking-wider">Attack Playback (Request)</span>
            </div>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 text-[#888780] hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] uppercase">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="shell"
              theme="vs-dark"
              value={curlCommand}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

        {/* Response Viewer */}
        <div className="flex flex-col h-[500px] bg-[#111113] rounded-xl border border-[#D85A30]/30 shadow-[0_0_30px_rgba(216,90,48,0.1)] overflow-hidden">
          <div className="flex items-center px-4 py-3 bg-black/40 border-b border-white/5">
            <span className="font-mono text-[11px] text-[#F0997B] uppercase tracking-wider">Intercepted Response (Victim Data)</span>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme="vs-dark"
              value={responseBody}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
