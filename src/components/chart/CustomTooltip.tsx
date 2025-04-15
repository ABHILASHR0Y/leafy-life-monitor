
import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Handle offline data specially
    const isOffline = payload[0].payload.offline;
    
    if (isOffline) {
      return (
        <div className="bg-card p-3 border rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-red-500">Sensor disconnected</p>
        </div>
      );
    }
    
    return (
      <div className="bg-card p-3 border rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-xs">
            {entry.name === 'moisture' 
              ? `Moisture: ${entry.value.toFixed(1)}%` 
              : entry.name === 'waterMotor' && entry.value === 1
                ? 'Water: Active'
                : entry.name === 'fertilizerMotor' && entry.value === 1
                  ? 'Fertilizer: Active'
                  : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
