
import React from 'react';
import { Droplet, Beaker, Clock, Calendar, WifiOff } from 'lucide-react';
import { MotorStatus as MotorStatusType } from '@/hooks/usePlantDataTypes';
import StatusCard from './StatusCard';
import { format, formatDistanceToNow } from 'date-fns';

interface MotorStatusProps {
  waterMotorStatus: MotorStatusType;
  fertilizerMotorStatus: MotorStatusType;
  lastWatered: Date | null;
  lastFertilized: Date | null;
  isArduinoConnected: boolean;
}

const MotorStatus: React.FC<MotorStatusProps> = ({
  waterMotorStatus,
  fertilizerMotorStatus,
  lastWatered,
  lastFertilized,
  isArduinoConnected
}) => {
  const formatLastAction = (date: Date | null) => {
    if (!date) return 'Never';
    
    try {
      // First try using formatDistanceToNow for a relative time
      const relativeTime = formatDistanceToNow(date, { addSuffix: true });
      
      // Add exact timestamp as title attribute for hover
      const exactTime = format(date, 'MMM d, yyyy HH:mm');
      
      return relativeTime;
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Unknown';
    }
  };
  
  const getTimeTooltip = (date: Date | null) => {
    if (!date) return '';
    try {
      return format(date, 'MMM d, yyyy HH:mm');
    } catch (err) {
      return '';
    }
  };
  
  if (!isArduinoConnected) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatusCard 
          title="Water Motor"
          value="Disconnected"
          icon={WifiOff}
          status="warning"
          iconColor="text-plant-water"
        />
        
        <StatusCard 
          title="Last Watered"
          value={formatLastAction(lastWatered)}
          tooltip={getTimeTooltip(lastWatered)}
          icon={Clock}
          iconColor="text-blue-500"
        />
        
        <StatusCard 
          title="Fertilizer Motor"
          value="Disconnected"
          icon={WifiOff}
          status="warning"
          iconColor="text-plant-fertilizer"
        />
        
        <StatusCard 
          title="Last Fertilized"
          value={formatLastAction(lastFertilized)}
          tooltip={getTimeTooltip(lastFertilized)}
          icon={Calendar}
          iconColor="text-purple-500"
        />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatusCard 
        title="Water Motor"
        value={waterMotorStatus === 'active' ? 'Active' : waterMotorStatus === 'error' ? 'Error' : 'Idle'}
        icon={Droplet}
        status={waterMotorStatus === 'active' ? 'success' : waterMotorStatus === 'error' ? 'danger' : 'default'}
        iconColor="text-plant-water"
      />
      
      <StatusCard 
        title="Last Watered"
        value={formatLastAction(lastWatered)}
        tooltip={getTimeTooltip(lastWatered)}
        icon={Clock}
        iconColor="text-blue-500"
      />
      
      <StatusCard 
        title="Fertilizer Motor"
        value={fertilizerMotorStatus === 'active' ? 'Active' : fertilizerMotorStatus === 'error' ? 'Error' : 'Idle'}
        icon={Beaker}
        status={fertilizerMotorStatus === 'active' ? 'success' : fertilizerMotorStatus === 'error' ? 'danger' : 'default'}
        iconColor="text-plant-fertilizer"
      />
      
      <StatusCard 
        title="Last Fertilized"
        value={formatLastAction(lastFertilized)}
        tooltip={getTimeTooltip(lastFertilized)}
        icon={Calendar}
        iconColor="text-purple-500"
      />
    </div>
  );
};

export default MotorStatus;
