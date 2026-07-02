import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const ClientProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-8">My Profile</h1>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0">
          {user.profilePhoto ? (
            <img src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${user.profilePhoto}`} alt={user.name} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-slate-50 dark:border-slate-800 shadow-md" />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 border-4 border-slate-50 dark:border-slate-800 shadow-md">
              <User className="w-16 h-16 md:w-20 md:h-20" />
            </div>
          )}
        </div>

        <div className="flex-1 w-full">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">{user.name}</h2>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium uppercase tracking-wider">
              {user.role}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email Address</p>
                <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone Number</p>
                <p className="font-medium text-slate-900 dark:text-white">{user.phone || 'Not provided'}</p>
              </div>
            </div>
            
            {user.createdAt && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Member Since</p>
                  <p className="font-medium text-slate-900 dark:text-white">{format(new Date(user.createdAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
