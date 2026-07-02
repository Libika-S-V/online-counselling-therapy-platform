import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, FileText, Briefcase, DollarSign, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const TherapistProfileEditPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bio: '',
    specializations: '',
    languages: '',
    experience: '',
    sessionFee: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/therapists/${user.id}`);
        const profile = res.data;
        setStatus(profile.approvalStatus);
        setFormData({
          bio: profile.bio || '',
          specializations: profile.specializations.join(', ') || '',
          languages: profile.languages.join(', ') || '',
          experience: profile.experience || '',
          sessionFee: profile.sessionFee || ''
        });
      } catch (err) {
        toast.error('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/therapists/profile', {
        bio: formData.bio,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        experience: Number(formData.experience),
        sessionFee: formData.sessionFee
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-8 h-8 text-secondary-500" /> Edit Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Update your professional details and public biography.</p>
        </div>
        
        <div className={`px-4 py-2 rounded-xl text-sm font-medium border ${
          status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
          status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          Status: <span className="uppercase tracking-wider">{status}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Professional Summary</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Biography</label>
              <textarea 
                name="bio" value={formData.bio} onChange={handleChange} required minLength={100} rows={6}
                className="w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 outline-none resize-none"
                placeholder="Tell clients about your therapeutic approach, experience, and what to expect in a session..."
              />
              <p className="text-xs text-slate-500 mt-2 text-right">{formData.bio.length} chars (min 100)</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Specializations
              </label>
              <input 
                type="text" name="specializations" value={formData.specializations} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 outline-none"
                placeholder="e.g. Anxiety, Depression, Trauma (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Languages
              </label>
              <input 
                type="text" name="languages" value={formData.languages} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 outline-none"
                placeholder="e.g. English, Spanish (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Years of Experience
              </label>
              <input 
                type="number" name="experience" value={formData.experience} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" /> Session Fee
              </label>
              <input 
                type="text" name="sessionFee" value={formData.sessionFee} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 outline-none"
                placeholder="e.g. $100, $150/hr"
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" disabled={saving}
              className="w-full md:w-auto px-8 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 ml-auto"
            >
              {saving ? 'Saving...' : 'Save Changes'} <Save className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TherapistProfileEditPage;
