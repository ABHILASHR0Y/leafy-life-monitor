
import React from 'react';
import { Flower, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useArduinoSerial } from '@/hooks/useArduinoSerial';

const Header: React.FC = () => {
  const { isConnected, connectionError } = useArduinoSerial();
  
  return (
    <header className="bg-card border-b border-border py-3">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flower className="h-8 w-8 text-plant" />
          <h1 className="text-2xl font-bold">Leafy Life Monitor</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse-gentle' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isConnected ? 'Arduino Connected' : 'Disconnected'}
            </span>
          </div>
          
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
