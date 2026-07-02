import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';
import { BookHeart, PlusCircle } from 'lucide-react';
import MoodPicker from '../components/MoodPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import toast from 'react-hot-toast';

const moodConfig = {
  'Terrible': { emoji: '😫', bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-700 dark:text-red-400' },
  'Bad': { emoji: '🙁', bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-400' },
  'Okay': { emoji: '😐', bg: 'bg-yellow-50 dark:bg-yellow-900/10', text: 'text-yellow-700 dark:text-yellow-500' },
  'Good': { emoji: '🙂', bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-700 dark:text-emerald-400' },
  'Excellent': { emoji: '😁', bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-700 dark:text-green-400' },
};

const MoodJournalPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ mood: '', notes: '' });

  const fetchEntries = async () => {
    try {
      const res = await api.get('/moods');
      setEntries(res.data);
    } catch (err) {
      setError('Failed to load mood journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mood) {
      toast.error('Please select a mood.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/moods', formData);
      toast.success('Mood logged successfully!');
      setFormData({ mood: '', notes: '' });
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log mood.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="py-12"><ErrorMessage message={error} /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-3">
          <BookHeart className="w-8 h-8 text-primary-500" /> Mood Journal
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Track your daily emotions and reflect on your well-being journey.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Entry Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">How are you feeling today?</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <MoodPicker 
                  selected={formData.mood} 
                  onChange={(mood) => setFormData({ ...formData, mood })} 
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Private Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder="What's on your mind? Did anything specific trigger this mood?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.mood}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Entry'} <PlusCircle className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Recent Entries</h2>
          
          {entries.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-700">
              <BookHeart className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
              <p className="text-slate-500 dark:text-slate-400">No entries yet. Start logging your mood to see your history here.</p>
            </div>
          ) : (
            entries.map((entry) => {
              const conf = moodConfig[entry.mood];
              return (
                <div key={entry._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-5 items-start transition-hover hover:shadow-md">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${conf.bg}`}>
                    <span className="text-2xl mb-1">{conf.emoji}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold text-lg ${conf.text}`}>{entry.mood}</h3>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    {entry.notes ? (
                      <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{entry.notes}</p>
                    ) : (
                      <p className="text-slate-400 dark:text-slate-500 text-sm italic">No notes added.</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodJournalPage;
