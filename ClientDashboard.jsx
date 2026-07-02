import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import SessionCard from '../components/SessionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, BookHeart, User, ArrowRight, HeartPulse } from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ upcomingSessions: [], recentMoods: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, moodRes] = await Promise.all([
          api.get('/appointments/my'),
          api.get('/moods')
        ]);
        
        setData({
          upcomingSessions: appRes.data.filter(a => a.status === 'upcoming').slice(0, 2),
          recentMoods: moodRes.data.slice(0, 3)
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-primary-100 text-lg max-w-xl">Take a deep breath. You're in a safe space. How can we support your well-being today?</p>
          </div>
          <Link to="/therapists" className="bg-white text-primary-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap">
            Find a Therapist <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Upcoming Sessions" value={data.upcomingSessions.length} icon={Calendar} colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400" />
        <StatsCard title="Mood Entries" value={data.recentMoods.length} icon={BookHeart} colorClass="text-pink-600 bg-pink-100 dark:bg-pink-900/40 dark:text-pink-400" />
        <StatsCard title="Profile Status" value="Complete" icon={User} colorClass="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Appointments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" /> Next Sessions
            </h2>
            <Link to="/appointments" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">View All</Link>
          </div>
          
          {data.upcomingSessions.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 mb-4">No upcoming sessions.</p>
              <Link to="/therapists" className="text-primary-600 font-medium hover:underline">Book an appointment</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.upcomingSessions.map(app => (
                <SessionCard key={app._id} appointment={app} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Mood Tracker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-pink-500" /> Recent Moods
            </h2>
            <Link to="/mood" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">Log Mood</Link>
          </div>

          {data.recentMoods.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't logged your mood lately.</p>
              <Link to="/mood" className="text-primary-600 font-medium hover:underline">Track your mood now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentMoods.map(mood => (
                <div key={mood._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {mood.mood === 'Excellent' ? '😁' : mood.mood === 'Good' ? '🙂' : mood.mood === 'Okay' ? '😐' : mood.mood === 'Bad' ? '🙁' : '😫'}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{mood.mood}</p>
                      <p className="text-xs text-slate-500">{new Date(mood.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
