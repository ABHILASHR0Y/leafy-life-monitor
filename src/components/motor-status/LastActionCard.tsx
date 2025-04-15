
import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import StatusCard from '../StatusCard';
import { format, formatDistanceToNow } from 'date-fns';

interface LastActionCardProps {
  type: 'watered' | 'fertilized';
  lastActionDate: Date | null;
}

const LastActionCard: React.FC<LastActionCardProps> = ({
  type,
  lastActionDate
}) => {
  const getIcon = () => type === 'watered' ? Clock : Calendar;
  const getIconColor = () => type === 'watered' ? 'text-blue-500' : 'text-purple-500';
  const getTitle = () => type === 'watered' ? 'Last Watered' : 'Last Fertilized';
  
  const formatLastAction = (date: Date | null) => {
    if (!date) return 'Never';
    
    try {
      // First try using formatDistanceToNow for a relative time
      const relativeTime = formatDistanceToNow(date, { addSuffix: true });
      return relativeTime;
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Unknown';
    }
  };
  
  const getTimeTooltip = (date: Date | null) => {
    if (!date) return '';
    try {
      return format(date, 'MMM d, yyyy HH:mm');
    } catch (err) {
      return '';
    }
  };
  
  return (
    <StatusCard 
      title={getTitle()}
      value={formatLastAction(lastActionDate)}
      tooltip={getTimeTooltip(lastActionDate)}
      icon={getIcon()}
      iconColor={getIconColor()}
    />
  );
};

export default LastActionCard;
