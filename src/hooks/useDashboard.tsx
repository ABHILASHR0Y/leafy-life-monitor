import { useCallback, useState, useEffect } from 'react';
import { usePlantData } from './usePlantData';
import { useArduinoSerial } from './useArduinoSerial';
import { useToast } from './use-toast';
import { PlantProfile } from '@/data/plants';

export function useDashboard() {
  const { isConnected } = useArduinoSerial();
  const { toast } = useToast();
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [pingInterval, setPingInterval] = useState<number | null>(null);
  
  const { 
    data, 
    activateWaterMotor, 
    activateFertilizerMotor, 
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration,
    setWateringFrequency,
    setCustomWateringDays,
    setOptimalMoistureRange,
    setSelectedPlant,
    isMoistureCritical,
    updateFromArduino,
    setUseSimulation,
    useSimulation,
    isLoading,
    initialLoadComplete
  } = usePlantData();
  
  // Update plant data hook when Arduino connection changes
  useEffect(() => {
    // If Arduino is disconnected but simulation is off, enable simulation
    if (!useSimulation && !isConnected) {
      console.log('Arduino disconnected, enabling simulation mode');
      setUseSimulation(true);
    }
  }, [isConnected, setUseSimulation, useSimulation]);
  
  // Setup ping interval to keep connection alive when connected
  useEffect(() => {
    // Clear existing ping interval
    if (pingInterval) {
      clearInterval(pingInterval);
      setPingInterval(null);
    }
    
    // If connected, set up new ping interval
    if (isConnected) {
      const intervalId = window.setInterval(() => {
        console.log('Sending ping to Arduino');
        handleSendCommand('ping');
      }, 5000); // Ping every 5 seconds
      
      setPingInterval(intervalId);
    }
    
    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, [isConnected]);
  
  // Handle real data from Arduino
  const handleArduinoData = useCallback((arduinoData: any) => {
    if (arduinoData && isConnected) {
      updateFromArduino(arduinoData);
      setLastSyncTime(new Date());
      
      // If we get real data, we can turn off simulation mode
      if (useSimulation && 'moisture' in arduinoData) {
        console.log('Received real data from Arduino, disabling simulation');
        setUseSimulation(false);
      }
    }
  }, [updateFromArduino, isConnected, useSimulation, setUseSimulation]);

  // Forward commands to Arduino via hook
  const handleSendCommand = useCallback(async (command: string): Promise<boolean> => {
    console.log('Command forwarded to Arduino:', command);
    // This function is called after the actual command is sent to Arduino
    // We can use it to update UI or handle command-specific logic
    return true;
  }, []);

  // Handle Arduino connection status change
  const handleArduinoConnectionChange = useCallback((connected: boolean) => {
    // No need to manually set this as the useArduinoSerial hook manages the connection state
    if (connected) {
      toast({
        title: "Arduino Connected",
        description: "Now receiving real sensor data"
      });
      setLastSyncTime(new Date());
      
      // If we connect, immediately get the current status
      handleSendCommand('status');
    } else {
      toast({
        title: "Arduino Disconnected",
        description: "Switched to simulation mode"
      });
      
      // Enable simulation when disconnected
      setUseSimulation(true);
    }
  }, [toast, handleSendCommand, setUseSimulation]);

  // Handle plant profile selection
  const handleSelectPlant = useCallback((plant: PlantProfile) => {
    setSelectedPlant(plant);
    setLastSyncTime(new Date());
  }, [setSelectedPlant]);
  
  // Refresh data from database
  const handleRefreshData = useCallback(() => {
    if (data.selectedPlantId) {
      // This will trigger a reload of the plant from the database
      // We need to get the current plant profile from the list
      const plantId = data.selectedPlantId;
      import('@/data/plants').then(({ getPlantById }) => {
        const plant = getPlantById(plantId);
        if (plant) {
          setSelectedPlant(plant);
          setLastSyncTime(new Date());
          toast({
            title: "Data Refreshed",
            description: "Latest plant data loaded from database"
          });
        }
      });
    }
  }, [data.selectedPlantId, setSelectedPlant, toast]);
  
  // Force a data refresh on component mount
  useEffect(() => {
    if (data.selectedPlantId && initialLoadComplete) {
      handleRefreshData();
    }
  }, [initialLoadComplete]);
  
  // Determine if we should show components that require Arduino connection
  // When simulation is enabled, we show everything regardless of actual connection
  const showArduinoComponents = isConnected || useSimulation;
  
  return {
    data,
    lastSyncTime,
    isLoading,
    showArduinoComponents,
    activateWaterMotor,
    activateFertilizerMotor,
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration,
    setWateringFrequency,
    setCustomWateringDays,
    setOptimalMoistureRange,
    handleSelectPlant,
    handleRefreshData,
    handleArduinoData,
    handleSendCommand,
    handleArduinoConnectionChange,
    isMoistureCritical
  };
}
