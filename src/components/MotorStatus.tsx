
import React from 'react';
import { Droplet, Flask, Clock, Calendar } from 'lucide-react';
import { MotorStatus as MotorStatusType } from '@/hooks/usePlantData';
import StatusCard from './StatusCard';

interface MotorStatusProps {
  waterMotorStatus: MotorStatusType;
  fertilizerMotorStatus: MotorStatusType;
  lastWatered: Date | null;
  lastFertilized: Date | null;
}

const MotorStatus: React.FC<MotorStatusProps> = ({
  waterMotorStatus,
  fertilizerMotorStatus,
  lastWatered,
  lastFertilized
}) => {
  // Format the last watered time
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
  
  // Format the last fertilized time
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
  
  // Get water motor status
  const getWaterStatus = () => {
    if (waterMotorStatus === 'active') return 'Active';
    if (waterMotorStatus === 'error') return 'Error';
    return 'Idle';
  };
  
  // Get water status color
  const getWaterStatusType = (): 'default' | 'success' | 'warning' | 'danger' => {
    if (waterMotorStatus === 'active') return 'success';
    if (waterMotorStatus === 'error') return 'danger';
    return 'default';
  };
  
  // Get fertilizer motor status
  const getFertilizerStatus = () => {
    if (fertilizerMotorStatus === 'active') return 'Active';
    if (fertilizerMotorStatus === 'error') return 'Error';
    return 'Idle';
  };
  
  // Get fertilizer status color
  const getFertilizerStatusType = (): 'default' | 'success' | 'warning' | 'danger' => {
    if (fertilizerMotorStatus === 'active') return 'success';
    if (fertilizerMotorStatus === 'error') return 'danger';
    return 'default';
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatusCard 
        title="Water Motor"
        value={getWaterStatus()}
        icon={Droplet}
        status={getWaterStatusType()}
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
        value={getFertilizerStatus()}
        icon={Flask}
        status={getFertilizerStatusType()}
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
