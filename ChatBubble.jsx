import React from 'react';
import { format } from 'date-fns';

const ChatBubble = ({ message, isOwn }) => {
  const { content, createdAt, senderId } = message;

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="flex-shrink-0 mr-3">
          {senderId?.profilePhoto ? (
            <img src={senderId.profilePhoto.startsWith('http') ? senderId.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${senderId.profilePhoto}`} alt="User" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
              {senderId?.name?.charAt(0) || '?'}
            </div>
          )}
        </div>
      )}
      
      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-2.5 rounded-2xl ${
            isOwn 
              ? 'bg-primary-600 text-white rounded-tr-sm' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-1">
          {format(new Date(createdAt), 'h:mm a')}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
