import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import {
  Search, BookOpen, Video, FileText, Lightbulb, Dumbbell,
  Filter, Bookmark, BookmarkCheck, ExternalLink, Download,
  Eye, ChevronLeft, ChevronRight
} from 'lucide-react';

const TYPE_ICONS = {
  article: BookOpen,
  video: Video,
  pdf: FileText,
  tip: Lightbulb,
  exercise: Dumbbell
};

const TYPE_COLORS = {
  article: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pdf: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  tip: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  exercise: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
};

const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Stress', 'Relationships', 'Mindfulness', 'Sleep', 'General'];
const TYPES = ['All', 'article', 'video', 'pdf', 'tip', 'exercise'];

const ResourceLibraryPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchResources = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedType !== 'All') params.type = selectedType;

      const res = await api.get('/resources', { params });
      setResources(res.data.resources);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedType]);

  const fetchBookmarked = async () => {
    try {
      const res = await api.get('/resources/bookmarked');
      setBookmarked(res.data);
    } catch { }
  };

  useEffect(() => {
    if (activeTab === 'all') fetchResources(1);
    else fetchBookmarked();
  }, [activeTab, fetchResources]);

  const toggleBookmark = async (id) => {
    try {
      const res = await api.post(`/resources/${id}/bookmark`);
      toast.success(res.data.message);
      if (activeTab === 'bookmarked') fetchBookmarked();
      else fetchResources(pagination.page);
    } catch {
      toast.error('Failed to update bookmark.');
    }
  };

  const displayedResources = activeTab === 'bookmarked' ? bookmarked : resources;

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          Wellness Resource Library
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Curated articles, videos, and exercises to support your mental health journey.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'bookmarked'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors capitalize text-sm ${
              activeTab === tab
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}>
            {tab === 'bookmarked' ? '🔖 Bookmarked' : '📚 All Resources'}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles, videos, exercises..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          {/* Category */}
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          {/* Type */}
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
            className="px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none capitalize">
            {TYPES.map(t => <option key={t} className="capitalize">{t}</option>)}
          </select>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : displayedResources.length === 0 ? (
        <EmptyState message={activeTab === 'bookmarked' ? "You haven't bookmarked any resources yet." : "No resources found matching your filters."} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedResources.map(resource => {
            const TypeIcon = TYPE_ICONS[resource.type] || BookOpen;
            const typeColor = TYPE_COLORS[resource.type] || TYPE_COLORS.article;
            const isBookmarked = resource.bookmarkedBy?.includes(user?.id);

            return (
              <div key={resource._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                {/* Thumbnail / placeholder */}
                <div className="h-40 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
                  {resource.thumbnailUrl ? (
                    <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-full object-cover" />
                  ) : (
                    <TypeIcon className="w-16 h-16 text-teal-400 dark:text-teal-600 opacity-40" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${typeColor}`}>
                      {resource.type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                    <Eye className="w-3 h-3" /> {resource.viewCount}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug flex-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {resource.title}
                    </h3>
                    {user && (
                      <button onClick={() => toggleBookmark(resource._id)}
                        className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex-shrink-0">
                        {isBookmarked ? <BookmarkCheck className="w-5 h-5 text-teal-500" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                    )}
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4 flex-1">
                    {resource.description}
                  </p>

                  {resource.category && (
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full w-fit mb-3">
                      {resource.category}
                    </span>
                  )}

                  <div className="flex gap-2 mt-auto">
                    {resource.externalUrl && (
                      <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors">
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    )}
                    {resource.fileUrl && (
                      <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" download
                        className="flex-1 flex items-center justify-center gap-1 py-2 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400 text-xs font-semibold rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                    {!resource.externalUrl && !resource.fileUrl && (
                      <span className="text-xs text-slate-400 italic">No file available</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {activeTab === 'all' && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => fetchResources(pagination.page - 1)} disabled={pagination.page === 1}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {pagination.page} of {pagination.pages} · {pagination.total} resources
          </span>
          <button onClick={() => fetchResources(pagination.page + 1)} disabled={pagination.page === pagination.pages}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourceLibraryPage;
