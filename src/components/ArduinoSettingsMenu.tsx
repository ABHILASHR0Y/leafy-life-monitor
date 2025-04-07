
import React from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger
} from '@/components/ui/menubar';
import { Settings2, RefreshCcw, Power, WifiOff, Database } from 'lucide-react';
import { useArduinoSerial } from '@/hooks/useArduinoSerial';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ArduinoSettingsMenu: React.FC = () => {
  const { isConnected, connect, disconnect, serialAvailable } = useArduinoSerial();
  const { toast } = useToast();
  
  const handleConnect = async () => {
    if (!serialAvailable) {
      toast({
        title: 'Not Supported',
        description: 'Your browser does not support Web Serial API.',
        variant: 'destructive',
      });
      return;
    }
    
    const success = await connect();
    if (success) {
      toast({
        title: 'Connected',
        description: 'Successfully connected to Arduino.',
      });
    }
  };
  
  const handleDisconnect = async () => {
    const success = await disconnect();
    if (success) {
      toast({
        title: 'Disconnected',
        description: 'Disconnected from Arduino.',
      });
    }
  };
  
  const handleToggleSimulation = () => {
    toast({
      title: 'Simulation Mode',
      description: 'Toggled simulation mode.',
    });
  };
  
  return (
    <Menubar className="border-0 bg-transparent">
      <MenubarMenu>
        <MenubarTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings2 className="h-5 w-5" />
          </Button>
        </MenubarTrigger>
        <MenubarContent align="end">
          <MenubarItem className="font-medium">Arduino Settings</MenubarItem>
          <MenubarSeparator />
          
          {isConnected ? (
            <MenubarItem onClick={handleDisconnect} className="cursor-pointer">
              <WifiOff className="mr-2 h-4 w-4" />
              Disconnect Arduino
            </MenubarItem>
          ) : (
            <MenubarItem onClick={handleConnect} className="cursor-pointer">
              <Power className="mr-2 h-4 w-4" />
              Connect Arduino
            </MenubarItem>
          )}
          
          <MenubarItem onClick={handleToggleSimulation} className="cursor-pointer">
            <Database className="mr-2 h-4 w-4" />
            Toggle Simulation
          </MenubarItem>
          
          <MenubarItem disabled={!isConnected} className="cursor-pointer">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Connection
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default ArduinoSettingsMenu;
