
import React from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CustomTooltip from './CustomTooltip';
import { ChartDataPoint } from './useChartData';

interface MoistureLineChartProps {
  data: ChartDataPoint[];
  isArduinoConnected: boolean;
}

const MoistureLineChart: React.FC<MoistureLineChartProps> = ({ 
  data, 
  isArduinoConnected
}) => {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#6666661a" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis 
            yAxisId="left" 
            domain={[0, 100]} 
            label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
          />
          <YAxis yAxisId="right" orientation="right" domain={[0, 1.1]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="moisture" 
            stroke={!isArduinoConnected ? "#EF4444" : "#4CAF50"} 
            strokeWidth={!isArduinoConnected ? 2 : 1.5}
            dot={{ r: isArduinoConnected ? 2 : 0 }} 
            activeDot={{ r: isArduinoConnected ? 5 : 0 }} 
            name={isArduinoConnected ? "Moisture" : "Sensor Disconnected"} 
          />
          {isArduinoConnected && (
            <>
              <Line yAxisId="right" type="monotone" dataKey="waterMotor" stroke="#03A9F4" strokeWidth={2} dot={{ r: 2 }} name="Water Motor" />
              <Line yAxisId="right" type="monotone" dataKey="fertilizerMotor" stroke="#9C27B0" strokeWidth={2} dot={{ r: 2 }} name="Fertilizer Motor" />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoistureLineChart;
