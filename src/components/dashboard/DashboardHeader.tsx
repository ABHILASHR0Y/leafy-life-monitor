
import React from 'react';
import { Leaf, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  onRefreshData: () => void;
  lastSyncTime: Date;
  isLoading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefreshData,
  lastSyncTime,
  isLoading
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Leaf className="h-6 w-6 text-plant" />
        Plant Dashboard
        <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
          <Database className="h-3 w-3" />
          Database Connected
        </span>
      </h2>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefreshData}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
        <div className="text-sm text-muted-foreground">
          Last synced: {lastSyncTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
