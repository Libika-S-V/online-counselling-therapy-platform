import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { CheckCircle, XCircle, AlertCircle, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

const PendingTherapistsPage = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/therapists/pending');
      setPending(res.data);
    } catch (err) {
      setError('Failed to load pending therapists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/admin/therapists/${id}/status`, { status });
      toast.success(`Therapist ${status} successfully.`);
      setPending(pending.filter(t => t.userId._id !== id));
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="py-12"><ErrorMessage message={error} /></div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <AlertCircle className="w-8 h-8 text-amber-500" /> Pending Approvals
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Review and verify therapist credentials before they join the platform.</p>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">All Caught Up!</h2>
          <p className="text-slate-500 dark:text-slate-400">There are no pending therapist applications at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.map(therapist => (
            <div key={therapist._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col lg:flex-row">
              {/* Info Section */}
              <div className="p-6 lg:w-2/3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-4 mb-6">
                  {therapist.userId?.profilePhoto ? (
                    <img src={therapist.userId.profilePhoto.startsWith('http') ? therapist.userId.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${therapist.userId.profilePhoto}`} alt="Therapist" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{therapist.userId?.name}</h3>
                    <p className="text-slate-500 text-sm">{therapist.userId?.email} • {therapist.userId?.phone || 'No phone'}</p>
                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                      <strong>License:</strong> {therapist.licenseNumber} ({therapist.licenseType || 'Psychology'})
                    </div>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      <strong>State:</strong> {therapist.state || 'Not specified'}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <span className="text-slate-500 block mb-1">Specializations</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{therapist.specializations.join(', ')}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <span className="text-slate-500 block mb-1">Experience</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{therapist.experience} Years</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><FileText className="w-4 h-4" /> Biography</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl whitespace-pre-wrap">{therapist.bio}</p>
                </div>
              </div>

              {/* Action Section */}
              <div className="p-6 lg:w-1/3 flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-800/20">
                <p className="text-sm text-slate-500 mb-6 text-center">Carefully review the therapist's credentials before granting access to the platform.</p>
                
                <div className="w-full space-y-3">
                  <button 
                    onClick={() => handleAction(therapist.userId._id, 'approved')}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve Therapist
                  </button>
                  <button 
                    onClick={() => handleAction(therapist.userId._id, 'rejected')}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 py-3 rounded-xl font-medium transition-colors"
                  >
                    <XCircle className="w-5 h-5" /> Reject Application
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingTherapistsPage;
