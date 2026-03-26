import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', high: 12, critical: 4 },
  { name: 'Tue', high: 8, critical: 5 },
  { name: 'Wed', high: 5, critical: 2 },
  { name: 'Thu', high: 14, critical: 1 },
  { name: 'Fri', high: 3, critical: 0 },
  { name: 'Sat', high: 2, critical: 0 },
  { name: 'Sun', high: 1, critical: 0 },
];

export function SeverityChart() {
  return (
    <div className="w-full h-full bg-[#111113] rounded-xl border border-white/5 flex flex-col p-4">
      <div className="font-mono text-[10px] text-[#888780] uppercase tracking-wider mb-6">
        Threat Volume Context
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FAC775" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FAC775" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D85A30" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D85A30" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3d3d3a" opacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888780', fontFamily: 'monospace' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888780', fontFamily: 'monospace' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1A1A1E', border: '1px solid #3d3d3a', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}
              itemStyle={{ color: '#B4B2A9' }}
            />
            <Area type="monotone" dataKey="high" stroke="#FAC775" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" />
            <Area type="monotone" dataKey="critical" stroke="#D85A30" strokeWidth={2} fillOpacity={1} fill="url(#colorCrit)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
