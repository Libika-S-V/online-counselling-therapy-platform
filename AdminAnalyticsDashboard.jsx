import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, UserCheck, DollarSign, Calendar, TrendingUp, Activity, Star, CheckCircle } from 'lucide-react';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
  </div>
);

const AdminAnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className="text-center text-slate-500 py-20">Failed to load analytics data.</div>;

  const sessionStatusData = [
    { name: 'Completed', value: stats.completedSessions || 0 },
    { name: 'Upcoming', value: stats.upcomingSessions || 0 },
    { name: 'Cancelled', value: stats.cancelledSessions || 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Platform Analytics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers || 0}
          sub={`${stats.activeUsers || 0} active`} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard icon={UserCheck} label="Approved Therapists" value={stats.approvedTherapists || 0}
          sub={`${stats.pendingTherapists || 0} pending`} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <StatCard icon={Calendar} label="Total Sessions" value={stats.totalAppointments || 0}
          sub={`${stats.completedSessions || 0} completed`} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <StatCard icon={DollarSign} label="Platform Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`}
          sub="All time earnings" color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Growth */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Monthly User Growth
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.monthlyGrowth || []}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#0ea5e9" fill="url(#userGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Session Status Pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> Session Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sessionStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {sessionStatusData.map((_, i) => (
                  <Cell key={i} fill={['#10b981', '#0ea5e9', '#ef4444'][i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Specializations */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Popular Specializations
          </h3>
          {stats.popularSpecializations?.length > 0 ? (
            <div className="space-y-3">
              {stats.popularSpecializations.slice(0, 6).map((spec, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{spec._id}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{spec.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-sm">No data available.</p>}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" /> Monthly Revenue (₹)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Session Completion Rate</h3>
            <p className="text-blue-200 text-sm">Percentage of booked sessions that were successfully completed</p>
          </div>
          <div className="text-5xl font-black">
            {stats.totalAppointments > 0
              ? `${Math.round((stats.completedSessions / stats.totalAppointments) * 100)}%`
              : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
