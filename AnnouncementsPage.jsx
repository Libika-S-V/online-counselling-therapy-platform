import React from 'react';
import { Bell } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const AnnouncementsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Bell className="w-8 h-8 text-indigo-500" /> Announcements
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Broadcast messages to all users on the platform.</p>
      </div>

      <EmptyState 
        icon={Bell} 
        message="The announcements feature is currently under development and will be available in a future update." 
      />
    </div>
  );
};

export default AnnouncementsPage;
