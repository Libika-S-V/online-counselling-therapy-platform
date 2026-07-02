import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StarRating from '../components/StarRating';
import { User, Languages, Briefcase, DollarSign, Calendar as CalendarIcon, MessageCircle } from 'lucide-react';

const TherapistProfilePage = () => {
  const { id } = useParams(); // Therapist's userId
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/therapists/${id}`),
          api.get(`/reviews/therapist/${id}`)
        ]);
        
        setProfile(profileRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error('Error fetching therapist profile:', err);
        setError(err.response?.data?.message || 'Could not load profile details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfileData();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="py-12"><ErrorMessage message={error} /></div>;
  if (!profile) return <EmptyState message="Profile not found." />;

  const { userId, bio, specializations, languages, experience, sessionFee, rating, totalReviews, availability } = profile;
  const imageUrl = userId.profilePhoto ? (userId.profilePhoto.startsWith('http') ? userId.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${userId.profilePhoto}`) : null;

  return (
    <div className="py-8 max-w-5xl mx-auto">
      {/* Header Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={userId.name} className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-slate-50 dark:border-slate-800 shadow-md" />
          ) : (
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 border-4 border-slate-50 dark:border-slate-800 shadow-md">
              <User className="w-16 h-16 md:w-24 md:h-24" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-2">{userId.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={Math.round(rating)} />
                <span className="font-medium text-slate-700 dark:text-slate-300">{rating.toFixed(1)}</span>
                <span className="text-slate-500">({totalReviews} reviews)</span>
              </div>
            </div>
            <Link 
              to={`/book/${userId._id}`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium shadow-md transition-colors whitespace-nowrap text-center"
            >
              Book Session
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1"><Briefcase className="w-4 h-4" /> Experience</span>
              <span className="font-medium text-slate-900 dark:text-white mt-1">{experience} Years</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1"><DollarSign className="w-4 h-4" /> Fee per Session</span>
              <span className="font-medium text-slate-900 dark:text-white mt-1">{sessionFee}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1"><Languages className="w-4 h-4" /> Languages</span>
              <span className="font-medium text-slate-900 dark:text-white mt-1">{languages.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mb-4">About Me</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{bio}</p>
          </div>

          {/* Specializations Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mb-4">Specializations</h2>
            <div className="flex flex-wrap gap-3">
              {specializations.map((spec, i) => (
                <span key={i} className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-4 py-2 rounded-lg font-medium text-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary-500" /> Client Reviews
            </h2>
            
            {reviews.length === 0 ? (
              <div className="text-slate-500 dark:text-slate-400 py-4 italic">No reviews yet.</div>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {review.clientId?.profilePhoto ? (
                          <img src={review.clientId.profilePhoto.startsWith('http') ? review.clientId.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${review.clientId.profilePhoto}`} alt="User" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{review.clientId?.name || 'Anonymous Client'}</p>
                          <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="w-4 h-4" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-3">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weekly Availability Preview */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm sticky top-24">
            <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-secondary-500" /> General Availability
            </h3>
            
            <div className="space-y-4">
              {availability.map((dayData, index) => {
                const availableSlots = dayData.slots.filter(s => !s.isBooked).length;
                return (
                  <div key={index} className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{dayData.day}</span>
                    {availableSlots > 0 ? (
                      <span className="text-sm px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md">
                        {availableSlots} slots
                      </span>
                    ) : (
                      <span className="text-sm px-2 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-md">
                        Unavailable
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <Link 
              to={`/book/${userId._id}`}
              className="mt-6 w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Check Exact Dates & Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfilePage;
