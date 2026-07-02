import React from 'react';

const moods = [
  { value: 'Terrible', emoji: '😫', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  { value: 'Bad', emoji: '🙁', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  { value: 'Okay', emoji: '😐', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800' },
  { value: 'Good', emoji: '🙂', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  { value: 'Excellent', emoji: '😁', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' }
];

const MoodPicker = ({ selected, onChange }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {moods.map((mood) => {
        const isSelected = selected === mood.value;
        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
              isSelected 
                ? `${mood.color} border shadow-inner scale-105` 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 grayscale hover:grayscale-0'
            }`}
          >
            <span className="text-3xl mb-2">{mood.emoji}</span>
            <span className={`text-sm font-medium ${isSelected ? '' : 'text-slate-600 dark:text-slate-400'}`}>
              {mood.value}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MoodPicker;
