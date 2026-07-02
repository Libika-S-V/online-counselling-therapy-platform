import React, { useEffect, useState } from 'react';
import { useTherapists } from '../hooks/useTherapists';
import TherapistCard from '../components/TherapistCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Search, Filter, X, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TherapistListPage = () => {
  const { t } = useTranslation();
  const { therapists, loading, error, fetchTherapists } = useTherapists();
  
  const [filters, setFilters] = useState({
    specialization: '',
    language: '',
    state: '',
    maxFee: '',
    rating: ''
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce logic for real-time search typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    fetchTherapists(debouncedFilters);
  }, [debouncedFilters, fetchTherapists]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ specialization: '', language: '', state: '', maxFee: '', rating: '' });
  };

  return (
    <div className="py-6">
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-4">Find Your Perfect Match</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">Browse through our directory of licensed, vetted professionals ready to support your mental health journey.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Filter className="w-5 h-5" /> {t('therapistList.filters') || "Filters"}
              </h3>
              {(filters.specialization || filters.language || filters.maxFee || filters.rating || filters.state) && (
                <button onClick={clearFilters} className="text-sm text-red-500 hover:underline flex items-center">
                  <X className="w-3 h-3 mr-1" /> {t('common.cancel') || "Clear"}
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" name="specialization" value={filters.specialization} onChange={handleFilterChange}
                    placeholder="e.g. Anxiety, Trauma"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</label>
                <select 
                  name="language" value={filters.language} onChange={handleFilterChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                >
                  <option value="">Any Language</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('therapistList.maxFee') || "Max Fee (₹)"}</label>
                <input 
                  type="number" name="maxFee" value={filters.maxFee} onChange={handleFilterChange} placeholder="No limit"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Minimum Rating</label>
                <select 
                  name="rating" value={filters.rating} onChange={handleFilterChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4">4.0+ Stars</option>
                  <option value="3">3.0+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="w-full lg:w-3/4">
          {error && <div className="mb-6"><ErrorMessage message={error} /></div>}
          
          {loading ? (
            <LoadingSpinner />
          ) : therapists.length === 0 ? (
            <EmptyState message="No therapists found matching your current filters. Try adjusting your search criteria." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {therapists.map(therapist => (
                <TherapistCard key={therapist._id} therapist={therapist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistListPage;
