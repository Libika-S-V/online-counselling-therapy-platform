import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Calendar, Video, MessageSquare, ExternalLink } from 'lucide-react';

const TherapistAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/therapist');
        setAppointments(res.data);
      } catch (err) {
        setError('Failed to load your appointments.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="py-12"><ErrorMessage message={error} /></div>;

  const upcoming = appointments.filter(a => a.status === 'upcoming');
  const past = appointments.filter(a => a.status !== 'upcoming');

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-2">Your Sessions</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage all your scheduled client appointments.</p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500"></span> Upcoming Client Sessions
          </h2>
          
          {upcoming.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-700">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No upcoming sessions booked.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcoming.map(app => (
                <div key={app._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {app.clientId?.profilePhoto ? (
                        <img src={app.clientId.profilePhoto.startsWith('http') ? app.clientId.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${app.clientId.profilePhoto}`} alt="Client" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center font-bold">
                          {app.clientId?.name?.charAt(0) || 'C'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{app.clientId?.name || 'Unknown Client'}</h3>
                        <p className="text-xs text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                          {app.sessionType === 'video' ? <Video className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                          {app.sessionType} Session
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {format(new Date(app.date), 'MMM d, yyyy')}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {app.timeSlot.split(' - ')[0]}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/session/${app._id}`}
                    className="flex w-full items-center justify-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                  >
                    Join Session Room <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Past Sessions
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Client</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Time Slot</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {past.map(app => (
                      <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{app.clientId?.name}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{format(new Date(app.date), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{app.timeSlot}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                            app.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/session/${app._id}`} className="text-secondary-600 hover:underline">View Chat</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TherapistAppointmentsPage;
