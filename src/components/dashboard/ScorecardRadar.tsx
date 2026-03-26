import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { subject: 'Auth', A: 120, fullMark: 150 },
  { subject: 'Data', A: 98, fullMark: 150 },
  { subject: 'Injection', A: 86, fullMark: 150 },
  { subject: 'Logic', A: 99, fullMark: 150 },
  { subject: 'Secrets', A: 85, fullMark: 150 },
  { subject: 'Config', A: 65, fullMark: 150 },
  { subject: 'IAC', A: 130, fullMark: 150 },
  { subject: 'Supply', A: 110, fullMark: 150 },
  { subject: 'Crypto', A: 70, fullMark: 150 },
];

export function ScorecardRadar() {
  return (
    <div className="w-full h-full bg-[#111113] rounded-xl border border-white/5 p-4 flex flex-col">
      <div className="font-mono text-[10px] text-[#888780] uppercase tracking-wider mb-2">
        Neural Security Profile
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#3d3d3a" opacity={0.5} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#888780', fontSize: 9, fontFamily: 'monospace' }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 150]} 
              tick={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1A1A1E', border: '1px solid #3d3d3a', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}
            />
            <Radar
              name="Security Score"
              dataKey="A"
              stroke="#1D9E75"
              fill="#1D9E75"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
