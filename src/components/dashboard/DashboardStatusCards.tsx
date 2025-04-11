
import React from 'react';
import MotorStatus from '../motor-status';
import { MotorStatus as MotorStatusType } from '@/hooks/usePlantDataTypes';

interface DashboardStatusCardsProps {
  waterMotorStatus: MotorStatusType;
  fertilizerMotorStatus: MotorStatusType;
  lastWatered: Date | null;
  lastFertilized: Date | null;
  isArduinoConnected: boolean;
}

const DashboardStatusCards: React.FC<DashboardStatusCardsProps> = ({
  waterMotorStatus,
  fertilizerMotorStatus,
  lastWatered,
  lastFertilized,
  isArduinoConnected
}) => {
  return (
    <MotorStatus 
      waterMotorStatus={waterMotorStatus}
      fertilizerMotorStatus={fertilizerMotorStatus}
      lastWatered={lastWatered}
      lastFertilized={lastFertilized}
      isArduinoConnected={isArduinoConnected}
    />
  );
};

export default DashboardStatusCards;
