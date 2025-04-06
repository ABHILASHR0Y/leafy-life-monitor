
import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Droplet } from 'lucide-react';

interface NotificationSystemProps {
  isMoistureCritical: boolean;
  moistureLevel: number;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  isMoistureCritical,
  moistureLevel
}) => {
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  
  // Check if permission is granted and show notifications
  useEffect(() => {
    if (isMoistureCritical) {
      const now = Date.now();
      // Only show notification once every 30 minutes
      if (now - lastNotificationTime > 30 * 60 * 1000) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Critical Moisture Alert!</span>
            </div>
          ),
          description: (
            <div>
              <p>Your plant is very dry (Moisture level: {Math.round(moistureLevel)}%).</p>
              <p className="mt-1">Consider watering it soon.</p>
            </div>
          ),
          variant: "destructive",
          duration: 10000,
        });
        
        setLastNotificationTime(now);
      }
    }
  }, [isMoistureCritical, moistureLevel, lastNotificationTime]);
  
  // Return empty fragment - this component doesn't render anything visible
  return null;
};

export default NotificationSystem;
