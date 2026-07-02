import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, XCircle, Upload, FileText, Shield } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import toast from 'react-hot-toast';

const CredentialsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/therapists/${user.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load credentials.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', text: 'Approved & Active' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', text: 'Application Rejected' };
      default:
        return { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'Pending Verification' };
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!profile) return null;

  const status = getStatusDisplay(profile.approvalStatus);
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Credentials & Verification</h1>
      </div>

      <div className={`p-6 rounded-2xl border ${status.bg} border-slate-200 dark:border-slate-800 flex items-center gap-4`}>
        <StatusIcon className={`w-10 h-10 ${status.color}`} />
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verification Status: <span className={status.color}>{status.text}</span></h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {profile.approvalStatus === 'pending' && "Our team is reviewing your credentials. This usually takes 1-2 business days."}
            {profile.approvalStatus === 'approved' && "Your credentials have been verified. You are visible to clients."}
            {profile.approvalStatus === 'rejected' && "Your application was rejected. Please contact support for more details."}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Registered Credentials</h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">License/Registration Number</span>
            <p className="font-semibold text-slate-900 dark:text-white">{profile.licenseNumber}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">License Type / Board</span>
            <p className="font-semibold text-slate-900 dark:text-white">{profile.licenseType || 'Psychology'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Experience</span>
            <p className="font-semibold text-slate-900 dark:text-white">{profile.experience} Years</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Specializations</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.specializations.map((spec, i) => (
                <span key={i} className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Supporting Documents</h4>
          <div className="flex items-center justify-between p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Professional License Document</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">PDF, JPG, PNG up to 5MB</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsPage;
