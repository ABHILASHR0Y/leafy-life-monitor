
import React from 'react';
import { WifiOff } from 'lucide-react';
import StatusCard from '../StatusCard';

interface DisconnectedStatusCardProps {
  type: 'water' | 'fertilizer';
}

const DisconnectedStatusCard: React.FC<DisconnectedStatusCardProps> = ({
  type
}) => {
  const getIconColor = () => type === 'water' ? 'text-plant-water' : 'text-plant-fertilizer';
  const getTitle = () => type === 'water' ? 'Water Motor' : 'Fertilizer Motor';
  
  return (
    <StatusCard 
      title={getTitle()}
      value="Disconnected"
      icon={WifiOff}
      status="warning"
      iconColor={getIconColor()}
    />
  );
};

export default DisconnectedStatusCard;
