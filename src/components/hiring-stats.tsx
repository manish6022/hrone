import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface HiringStatsProps {
  year?: string;
}

export function HiringStats({ year = '2024' }: HiringStatsProps) {
  const data = [
    { month: 'Jan', design: 280, other: 150 },
    { month: 'Feb', design: 260, other: 180 },
    { month: 'Mar', design: 240, other: 200 },
    { month: 'Apr', design: 220, other: 170 },
    { month: 'May', design: 200, other: 190 },
    { month: 'Jun', design: 180, other: 220 },
    { month: 'Jul', design: 167, other: 210 },
    { month: 'Aug', design: 190, other: 180 },
    { month: 'Sep', design: 220, other: 160 },
    { month: 'Oct', design: 180, other: 150 },
    { month: 'Nov', design: 160, other: 180 },
  ];

  return (
    <div className="bg-gradient-to-br from-[#FFF9E8] to-[#F5EDCE] rounded-3xl p-8 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <h3 className="text-2xl font-semibold">Hiring Statistics</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FDE68A]"></div>
              <span>Design</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2D2D2D]"></div>
              <span>Other</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white transition">
            {year}
          </button>
          <button className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white transition">
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D5" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B6B6B', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B6B6B', fontSize: 12 }}
              ticks={[50, 100, 150, 200, 250, 300]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFEF9',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="design"
              stroke="#FDE68A"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#FDE68A' }}
            />
            <Line
              type="monotone"
              dataKey="other"
              stroke="#2D2D2D"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6, fill: '#2D2D2D' }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Hover Label */}
        <div className="absolute top-1/3 left-1/4 bg-[#2D2D2D] text-white px-4 py-2 rounded-full text-sm">
          Other 167
        </div>
      </div>
    </div>
  );
}
