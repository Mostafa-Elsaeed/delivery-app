
import React, { useState } from 'react';

interface ReviewSectionProps {
  onReview: (rating: number, comment: string) => void;
  alreadyReviewed: boolean;
  targetName: string;
  t: any;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ onReview, alreadyReviewed, targetName, t }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (alreadyReviewed) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-center space-x-2 rtl:space-x-reverse">
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">{t.reviewSubmitted}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{t.review} {targetName}</h4>
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`p-1 transition-colors ${rating >= star ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t.experiencePlaceholder}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
        rows={2}
      />
      <button
        onClick={() => onReview(rating, comment)}
        className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30"
      >
        {t.submitReview}
      </button>
    </div>
  );
};

export default ReviewSection;
