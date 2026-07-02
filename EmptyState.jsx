import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ message, icon: Icon = FileQuestion, children }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-xl dark:border-slate-800">
      <div className="bg-slate-100 p-4 rounded-full mb-4 dark:bg-slate-800">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No data found</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{message}</p>
      {children}
    </div>
  );
};

export default EmptyState;
