
import React from 'react';
import { Droplet, Beaker } from 'lucide-react';
import StatusCard from '../StatusCard';
import { MotorStatus as MotorStatusType } from '@/hooks/usePlantDataTypes';

interface MotorStatusCardProps {
  type: 'water' | 'fertilizer';
  status: MotorStatusType;
}

const MotorStatusCard: React.FC<MotorStatusCardProps> = ({
  type,
  status
}) => {
  const getIcon = () => type === 'water' ? Droplet : Beaker;
  const getIconColor = () => type === 'water' ? 'text-plant-water' : 'text-plant-fertilizer';
  const getTitle = () => type === 'water' ? 'Water Motor' : 'Fertilizer Motor';
  
  return (
    <StatusCard 
      title={getTitle()}
      value={status === 'active' ? 'Active' : status === 'error' ? 'Error' : 'Idle'}
      icon={getIcon()}
      status={status === 'active' ? 'success' : status === 'error' ? 'danger' : 'default'}
      iconColor={getIconColor()}
    />
  );
};

export default MotorStatusCard;
