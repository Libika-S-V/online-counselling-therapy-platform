import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-primary-600 dark:text-primary-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="text-lg font-medium">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="p-8 flex justify-center">{content}</div>;
};

export default LoadingSpinner;
