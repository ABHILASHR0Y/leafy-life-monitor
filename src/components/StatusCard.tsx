
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  status?: 'default' | 'success' | 'warning' | 'danger';
  iconColor?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon: Icon,
  status = 'default',
  iconColor = 'text-primary'
}) => {
  // Status colors
  const statusColors = {
    default: 'bg-secondary',
    success: 'bg-green-100 dark:bg-green-900/20',
    warning: 'bg-yellow-100 dark:bg-yellow-900/20',
    danger: 'bg-red-100 dark:bg-red-900/20'
  };
  
  return (
    <Card className={`${statusColors[status]} border hover:shadow-md transition-shadow`}>
      <CardContent className="flex items-center p-4 gap-4">
        <div className={`rounded-full p-2 ${iconColor} bg-background`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
