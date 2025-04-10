
export type MotorStatus = 'idle' | 'active' | 'error';
export type WateringMode = 'automatic' | 'manual';
export type WateringFrequency = 'daily' | 'twice_weekly' | 'weekly' | 'biweekly' | 'custom';

export interface PlantData {
  currentMoisture: number;
  optimalRange: [number, number];
  waterMotorStatus: MotorStatus;
  fertilizerMotorStatus: MotorStatus;
  lastWatered: Date | null;
  lastFertilized: Date | null;
  wateringMode: WateringMode;
  wateringDuration: number; // in seconds
  fertilizerDuration: number; // in seconds
  wateringFrequency: WateringFrequency;
  customWateringDays: number; // days between waterings if custom frequency
  nextScheduledWatering: Date | null;
  selectedPlantId: string | null;
  historyData: Array<{
    timestamp: Date;
    moisture: number;
    waterMotor: boolean;
    fertilizerMotor: boolean;
  }>;
}

export interface ArduinoData {
  moisture?: number;
  water_motor?: boolean;
  fertilizer_motor?: boolean;
  mode?: WateringMode;
  water_duration?: number;
  fertilizer_duration?: number;
}
