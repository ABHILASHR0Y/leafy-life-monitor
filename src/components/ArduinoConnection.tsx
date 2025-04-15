
import React, { useState, useEffect } from 'react';
import { useArduinoSerial } from '@/hooks/useArduinoSerial';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Usb, WifiOff, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ArduinoConnectionProps {
  onDataReceived: (data: any) => void;
  onSendCommand: (command: string) => Promise<boolean>;
  onConnectionChange?: (isConnected: boolean) => void;
}

const ArduinoConnection: React.FC<ArduinoConnectionProps> = ({ 
  onDataReceived,
  onSendCommand,
  onConnectionChange
}) => {
  const { 
    isConnected, 
    connectionError, 
    serialAvailable,
    isConnecting,
    connect, 
    disconnect, 
    sendCommand,
    startReading
  } = useArduinoSerial();
  
  const [lastCommandSuccess, setLastCommandSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Notify parent component about connection state changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected);
    }
  }, [isConnected, onConnectionChange]);

  // Initialize real Arduino communication
  useEffect(() => {
    if (isConnected) {
      startReading((data) => {
        try {
          // Try to parse JSON data from Arduino
          if (data.trim().startsWith('{')) {
            const jsonData = JSON.parse(data);
            onDataReceived(jsonData);
          } else {
            // Handle non-JSON responses (status updates, etc)
            console.log('Arduino says:', data);
            
            // Extract specific messages
            if (data.includes('water_motor:on')) {
              toast({
                title: 'Water Motor',
                description: 'Water motor activated',
              });
            } else if (data.includes('water_motor:off')) {
              toast({
                title: 'Water Motor',
                description: 'Water motor deactivated',
              });
            } else if (data.includes('fertilizer_motor:on')) {
              toast({
                title: 'Fertilizer Motor',
                description: 'Fertilizer motor activated',
              });
            } else if (data.includes('fertilizer_motor:off')) {
              toast({
                title: 'Fertilizer Motor',
                description: 'Fertilizer motor deactivated',
              });
            }
          }
        } catch (error) {
          console.log('Received non-JSON data:', data);
        }
      });
      
      // Send initial status request with a slight delay to ensure connection is ready
      setTimeout(() => {
        sendCommand('status').catch(console.error);
      }, 500);
    }
  }, [isConnected, startReading, sendCommand, onDataReceived]);

  // Connect to Arduino
  const handleConnect = async () => {
    setLoading(true);
    try {
      await connect();
    } finally {
      setLoading(false);
    }
  };

  // Disconnect from Arduino
  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnect();
    } finally {
      setLoading(false);
    }
  };

  // Forward commands to Arduino
  const handleSendCommand = async (command: string) => {
    setLoading(true);
    let success = false;
    
    try {
      success = await sendCommand(command);
      setLastCommandSuccess(success);
      
      // Also call the parent's onSendCommand handler
      await onSendCommand(command);
    } finally {
      setLoading(false);
    }
    
    return success;
  };

  if (!serialAvailable) {
    return (
      <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-red-500" />
            <span>Serial Connection Not Available</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support Web Serial API. Please use Chrome, Edge or other supported browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Usb className="h-5 w-5 text-plant" />
            <span>Arduino Connection</span>
          </div>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
              <Check className="h-3 w-3 mr-1" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200">
              Disconnected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connectionError && (
          <div className="mb-4 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p>{connectionError}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              className="flex-1"
              disabled={loading || isConnecting}
            >
              {(loading || isConnecting) && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {isConnecting ? 'Connecting...' : 'Connect to Arduino'}
            </Button>
          ) : (
            <Button 
              onClick={handleDisconnect} 
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Disconnect
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Connect your Arduino running the Leafy Life Monitor sketch to communicate with real plant sensors and controls.
        </p>
      </CardContent>
    </Card>
  );
};

export default ArduinoConnection;
