import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Activity, CheckSquare, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold font-outfit mb-2">Platform Overview</h1>
          <p className="text-slate-300 text-lg max-w-xl">Monitor Serein's growth, manage users, and review therapist applications from your command center.</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400" />
        <StatsCard title="Therapists" value={stats?.totalTherapists || 0} icon={Activity} colorClass="text-secondary-600 bg-secondary-100 dark:bg-secondary-900/40 dark:text-secondary-400" />
        <StatsCard title="Total Sessions" value={stats?.totalAppointments || 0} icon={TrendingUp} colorClass="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400" />
        <StatsCard 
          title="Pending Approvals" 
          value={stats?.pendingTherapists || 0} 
          icon={AlertCircle} 
          colorClass={(stats?.pendingTherapists > 0) ? "text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400" : "text-slate-600 bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400"} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Therapist Approvals Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${stats?.pendingTherapists > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
            <CheckSquare className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Therapist Approvals</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
            {stats?.pendingTherapists > 0 
              ? `There are ${stats.pendingTherapists} new therapist applications waiting for your review.` 
              : 'All caught up! There are no pending therapist applications.'}
          </p>
          <Link 
            to="/admin/therapists/pending"
            className="w-full md:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Review Applications
          </Link>
        </div>

        {/* User Management Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-6">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">User Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
            View all registered users, manage their roles, or suspend accounts if necessary.
          </p>
          <Link 
            to="/admin/users"
            className="w-full md:w-auto px-8 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors shadow-sm"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
