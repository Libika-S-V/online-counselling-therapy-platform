import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import SessionCard from '../components/SessionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, DollarSign, Calendar, Star, ArrowRight, Settings } from 'lucide-react';

const TherapistDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    upcomingSessions: [],
    profile: null,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, profileRes] = await Promise.all([
          api.get('/appointments/therapist'),
          api.get(`/therapists/${user.id}`)
        ]);
        
        const completed = appRes.data.filter(a => a.status === 'completed');
        const totalEarned = completed.reduce((acc, curr) => {
          const feeStr = curr.fee || '0';
          const numericFee = parseFloat(feeStr.replace(/[^0-9.-]+/g, '')) || 0;
          return acc + numericFee;
        }, 0);

        setData({
          upcomingSessions: appRes.data.filter(a => a.status === 'upcoming').slice(0, 3),
          profile: profileRes.data,
          totalEarnings: totalEarned
        });
      } catch (err) {
        console.error('Error fetching therapist dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user.id]);

  if (loading) return <LoadingSpinner fullScreen />;

  const isApproved = data.profile?.approvalStatus === 'approved';

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-8">
      {/* Approval Banner */}
      {!isApproved && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-400">Profile Pending Approval</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">Your profile is currently under review by an administrator. You won't appear in client search results until approved.</p>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit mb-2">Hello, {user.name}!</h1>
            <p className="text-secondary-100 text-lg max-w-xl">You have {data.upcomingSessions.length} upcoming sessions today. Let's make a positive impact.</p>
          </div>
          <Link to="/therapist/profile" className="bg-white text-secondary-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap">
            Update Profile <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Earnings" value={`$${data.totalEarnings}`} icon={DollarSign} colorClass="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400" />
        <StatsCard title="Upcoming Sessions" value={data.upcomingSessions.length} icon={Calendar} colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400" />
        <StatsCard title="Avg Rating" value={data.profile?.rating?.toFixed(1) || '0.0'} icon={Star} colorClass="text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400" />
        <StatsCard title="Total Reviews" value={data.profile?.totalReviews || 0} icon={Users} colorClass="text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Appointments */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary-500" /> Your Schedule
            </h2>
            <Link to="/therapist/appointments" className="text-sm font-medium text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 flex items-center gap-1">
              View Calendar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {data.upcomingSessions.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-700">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No upcoming sessions. Update your availability to get more bookings.</p>
              <Link to="/therapist/availability" className="inline-block mt-4 text-secondary-600 font-medium hover:underline">Manage Availability</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.upcomingSessions.map(app => (
                <div key={app._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                   <div>
                     <p className="font-bold text-slate-900 dark:text-white">{app.clientId?.name || 'Client'}</p>
                     <p className="text-sm text-slate-500">{new Date(app.date).toLocaleDateString()} at {app.timeSlot.split(' - ')[0]}</p>
                   </div>
                   <Link to={`/session/${app._id}`} className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                     Join
                   </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/therapist/availability" className="block w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-secondary-300 dark:hover:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-all group">
              <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-secondary-700 dark:group-hover:text-secondary-400">Manage Availability</p>
              <p className="text-sm text-slate-500 mt-1">Update your weekly schedule slots.</p>
            </Link>
            <Link to="/therapist/earnings" className="block w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
              <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">View Earnings</p>
              <p className="text-sm text-slate-500 mt-1">Check your past completed sessions.</p>
            </Link>
            <Link to="/therapist/profile" className="block w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
              <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">Edit Profile & Bio</p>
              <p className="text-sm text-slate-500 mt-1">Update pricing, specializations, etc.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
