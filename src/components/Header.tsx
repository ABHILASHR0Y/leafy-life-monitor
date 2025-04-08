
import React from 'react';
import { Flower } from 'lucide-react';
import { useArduinoSerial } from '@/hooks/useArduinoSerial';
import ArduinoSettingsMenu from './ArduinoSettingsMenu';
import { usePlantData } from '@/hooks/usePlantData';

const Header: React.FC = () => {
  const { isConnected } = useArduinoSerial();
  const { useSimulation } = usePlantData();
  
  // Determine the connection status text and color
  const connectionStatus = () => {
    if (isConnected) {
      return {
        text: 'Arduino Connected',
        class: 'bg-green-500 animate-pulse-gentle'
      };
    } else if (useSimulation) {
      return {
        text: 'Simulation Mode',
        class: 'bg-blue-500'
      };
    } else {
      return {
        text: 'Disconnected',
        class: 'bg-red-500'
      };
    }
  };
  
  const status = connectionStatus();
  
  return (
    <header className="bg-card border-b border-border py-3">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flower className="h-8 w-8 text-plant" />
          <h1 className="text-2xl font-bold">Leafy Life Monitor</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${status.class}`}></div>
            <span className="text-sm">
              {status.text}
            </span>
          </div>
          
          <ArduinoSettingsMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
