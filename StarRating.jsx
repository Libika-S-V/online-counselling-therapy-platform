import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, maxStars = 5, size = "w-5 h-5" }) => {
  return (
    <div className="flex gap-1">
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        return (
          <Star
            key={i}
            className={`${size} ${
              starValue <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
            }`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
