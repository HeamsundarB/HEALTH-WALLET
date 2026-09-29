import React from 'react';
import { MessageSquare } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

export const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Messages & Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Foundation Shell • Future Phase Target Module
          </p>
        </div>
        <Badge variant="neutral">Future Phase</Badge>
      </div>

      <EmptyState
        title="Secure Messaging Module"
        description="Patient-doctor encrypted messaging and automated health notifications will be added in upcoming phases."
        icon={<MessageSquare className="w-8 h-8 text-indigo-600" />}
      />
    </div>
  );
};
