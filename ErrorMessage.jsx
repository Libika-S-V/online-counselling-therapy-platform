import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
      <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">Error</p>
        <p className="text-sm mt-1">{message || 'Something went wrong.'}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
