import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Languages, DollarSign, User, ChevronRight } from 'lucide-react';

const TherapistCard = ({ therapist }) => {
  const { userId, specializations, languages, sessionFee, rating, totalReviews } = therapist;
  
  if (!userId) return null; // Defensive check

  const imageUrl = userId.profilePhoto 
    ? (userId.profilePhoto.startsWith('http') ? userId.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${userId.profilePhoto}`)
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        {imageUrl ? (
          <img src={imageUrl} alt={userId.name} className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <User className="w-8 h-8" />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">{userId.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
              {rating > 0 ? rating.toFixed(1) : 'New'} <span className="text-slate-400 font-normal">({totalReviews} reviews)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Specializations Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {specializations.slice(0, 3).map((spec, idx) => (
          <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-md">
            {spec}
          </span>
        ))}
        {specializations.length > 3 && (
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium px-2.5 py-1 rounded-md">
            +{specializations.length - 3}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-6 flex-grow">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Languages className="w-4 h-4" />
          <span>{languages.join(', ') || 'English'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium text-slate-900 dark:text-white">{sessionFee} per session</span>
        </div>
      </div>

      <Link 
        to={`/therapists/${userId._id}`} 
        className="mt-auto w-full flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-primary-700 dark:text-primary-400 font-medium py-3 rounded-xl transition-colors border border-primary-100 dark:border-primary-900/50 hover:border-transparent"
      >
        View Profile <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default TherapistCard;
