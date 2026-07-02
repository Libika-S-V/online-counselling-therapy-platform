import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { DollarSign, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const EarningsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get('/appointments/therapist');
        setAppointments(res.data);
      } catch (err) {
        console.error('Error loading earnings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const completed = appointments.filter(a => a.status === 'completed');
  const upcoming = appointments.filter(a => a.status === 'upcoming');
  
  const calculateTotal = (apps) => apps.reduce((acc, curr) => {
    const feeStr = curr.fee || '0';
    const numericFee = parseFloat(feeStr.replace(/[^0-9.-]+/g, '')) || 0;
    return acc + numericFee;
  }, 0);

  const totalEarned = calculateTotal(completed);
  const pendingEarned = calculateTotal(upcoming);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-2">Earnings Report</h1>
        <p className="text-slate-600 dark:text-slate-400">Track your financial performance and completed session history.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <DollarSign className="w-32 h-32" />
          </div>
          <p className="text-emerald-100 font-medium mb-1">Total Lifetime Earnings</p>
          <h2 className="text-5xl font-bold font-outfit mb-4">${totalEarned.toFixed(2)}</h2>
          <div className="flex items-center gap-2 text-sm font-medium bg-white/20 inline-flex px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4" /> {completed.length} Completed Sessions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-500">
            <TrendingUp className="w-32 h-32" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Expected Upcoming Revenue</p>
          <h2 className="text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-4">${pendingEarned.toFixed(2)}</h2>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 inline-flex w-max px-3 py-1 rounded-full">
            <Calendar className="w-4 h-4" /> {upcoming.length} Upcoming Sessions
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Payment History</h2>
      {completed.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No completed sessions to report.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Session Type</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {completed.map(app => (
                <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(app.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{app.clientId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{app.sessionType}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{app.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EarningsPage;
