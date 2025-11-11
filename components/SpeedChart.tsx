import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line } from 'recharts';
import { SpeedDataPoint, SpeedUnit } from '../types';

interface SpeedChartProps {
  data: SpeedDataPoint[];
  downloadYDomain: [number, number];
  pingYDomain: [number, number];
  speedUnit: SpeedUnit;
}

const SpeedChart: React.FC<SpeedChartProps> = ({ data, downloadYDomain, pingYDomain, speedUnit }) => {
  return (
    <div className="w-full h-64 bg-dark/50 p-4 rounded-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00A9FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00A9FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            unit="s" 
            stroke="#9ca3af" 
            tick={{ fontSize: 12 }} 
            domain={['dataMin', 'dataMax']}
            type="number"
          />
          <YAxis 
            yAxisId="left"
            stroke="#9ca3af" 
            tick={{ fontSize: 12 }} 
            unit={` ${speedUnit}`}
            domain={downloadYDomain}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#A0E9FF"
            tick={{ fontSize: 12 }}
            unit=" ms"
            domain={pingYDomain}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#d1d5db' }}
            formatter={(value: number, name: string) => {
                if (value === null) return null;
                const upperName = name.charAt(0).toUpperCase() + name.slice(1);
                const unit = name === 'download' ? speedUnit : 'ms';
                const formattedValue = `${value.toFixed(name === 'download' ? 2 : 0)} ${unit}`;
                return [formattedValue, upperName];
            }}
            labelFormatter={(label: number) => `Time: ${label.toFixed(1)}s`}
          />
          <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
          <Area yAxisId="left" name="Download" type="monotone" dataKey="download" stroke="#00A9FF" strokeWidth={2} fillOpacity={1} fill="url(#colorDownload)" />
          <Line yAxisId="right" name="Ping" type="monotone" dataKey="ping" stroke="#A0E9FF" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpeedChart;