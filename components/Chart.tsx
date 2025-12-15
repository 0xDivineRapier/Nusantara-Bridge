import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', price: 42100000 },
  { time: '04:00', price: 42300000 },
  { time: '08:00', price: 42200000 },
  { time: '12:00', price: 42500000 },
  { time: '16:00', price: 42800000 },
  { time: '20:00', price: 42600000 },
  { time: '24:00', price: 42500000 },
];

export const MarketChart: React.FC = () => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            tick={{fontSize: 12}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#64748b" 
            tick={{fontSize: 12}} 
            tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`, 'Price']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};