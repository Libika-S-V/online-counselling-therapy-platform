import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, Video, MessageSquare, XCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { getGoogleCalendarLink, getOutlookCalendarLink } from '../utils/calendarHelper';

const SessionCard = ({ appointment, onCancel }) => {
  const { _id, therapistId, date, timeSlot, sessionType, status, fee } = appointment;
  const isUpcoming = status === 'upcoming';
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isUpcoming ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md' :
      isCompleted ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700' :
      'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 opacity-75'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {therapistId.profilePhoto ? (
            <img src={therapistId.profilePhoto.startsWith('http') ? therapistId.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${therapistId.profilePhoto}`} alt="Therapist" className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
          ) : (
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center">
              <span className="font-bold">{therapistId.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{therapistId.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1 mt-0.5">
              {sessionType === 'video' ? <Video className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
              {sessionType} Session
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          isUpcoming ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
          isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
        }`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-lg">
          <Calendar className="w-4 h-4 text-primary-500" />
          <span className="font-medium">{format(new Date(date), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-lg">
          <Clock className="w-4 h-4 text-secondary-500" />
          <span className="font-medium">{timeSlot.split(' - ')[0]}</span>
        </div>
      </div>

      {isUpcoming && (
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link 
              to={`/session/${_id}`}
              className="flex-grow flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              Join Room <ExternalLink className="w-4 h-4" />
            </Link>
            <button 
              onClick={() => onCancel(_id)}
              className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Add to Calendar:</span>
            <div className="flex gap-2">
              <a 
                href={getGoogleCalendarLink(appointment)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Google
              </a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a 
                href={getOutlookCalendarLink(appointment)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-secondary-650 dark:text-secondary-400 hover:underline"
              >
                Outlook
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
