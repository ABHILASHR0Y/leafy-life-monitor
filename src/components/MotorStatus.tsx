
import React from 'react';
import { Droplet, Beaker, Clock, Calendar, WifiOff } from 'lucide-react';
import { MotorStatus as MotorStatusType } from '@/hooks/usePlantData';
import StatusCard from './StatusCard';

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
  const getLastWateredText = () => {
    if (!lastWatered) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastWatered.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
    }
  };
  
  const getLastFertilizedText = () => {
    if (!lastFertilized) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastFertilized.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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
          value={getLastWateredText()}
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
          value={getLastFertilizedText()}
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
        value={getLastWateredText()}
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
        value={getLastFertilizedText()}
        icon={Calendar}
        iconColor="text-purple-500"
      />
    </div>
  );
};

export default MotorStatus;
