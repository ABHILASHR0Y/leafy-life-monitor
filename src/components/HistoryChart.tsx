
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart4, WifiOff, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MoistureLineChart from './chart/MoistureLineChart';
import { useChartData } from './chart/useChartData';

interface DataPoint {
  timestamp: Date;
  moisture: number;
  waterMotor: boolean;
  fertilizerMotor: boolean;
}

interface HistoryChartProps {
  data: DataPoint[];
  isArduinoConnected: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ 
  data, 
  isArduinoConnected, 
  onRefresh,
  isLoading = false
}) => {
  // Use our custom hook to process the chart data
  const { chartData, todayData } = useChartData(data, isArduinoConnected);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Moisture History
            <Database className="h-4 w-4 text-primary" />
          </CardTitle>
          {!isArduinoConnected && (
            <p className="text-sm text-muted-foreground">
              <WifiOff className="h-4 w-4 inline-block mr-2 text-red-500" />
              Sensor disconnected - Showing offline visualization
            </p>
          )}
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="pt-4">
            <MoistureLineChart 
              data={todayData} 
              isArduinoConnected={isArduinoConnected} 
            />
          </TabsContent>
          
          <TabsContent value="all" className="pt-4">
            <MoistureLineChart 
              data={chartData} 
              isArduinoConnected={isArduinoConnected} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HistoryChart;
