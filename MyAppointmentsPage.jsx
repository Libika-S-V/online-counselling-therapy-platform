import React, { useEffect } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import SessionCard from '../components/SessionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Calendar as CalendarIcon } from 'lucide-react';

const MyAppointmentsPage = () => {
  const { appointments, loading, error, fetchAppointments, cancelAppointment } = useAppointments();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="py-12"><ErrorMessage message={error} /></div>;

  const upcoming = appointments.filter(a => a.status === 'upcoming');
  const past = appointments.filter(a => a.status !== 'upcoming');

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-2">My Sessions</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your upcoming therapy appointments and view past history.</p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState message="You haven't booked any sessions yet. Browse our therapists to find your match." icon={CalendarIcon} />
      ) : (
        <div className="space-y-12">
          {/* Upcoming Sessions */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span> Upcoming Sessions
            </h2>
            {upcoming.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">No upcoming sessions scheduled.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcoming.map(app => (
                  <SessionCard key={app._id} appointment={app} onCancel={cancelAppointment} />
                ))}
              </div>
            )}
          </section>

          {/* Past Sessions */}
          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Past Sessions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                {past.map(app => (
                  <SessionCard key={app._id} appointment={app} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
