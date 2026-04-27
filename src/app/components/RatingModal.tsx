import { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { getAuthHeaders } from '../../context/AuthContext';
import { toast } from 'sonner';

interface RatingModalProps {
  requestId: string;
  donorName: string;
  foodName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function RatingModal({ requestId, donorName, foodName, onClose, onSubmitted }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ requestId, rating, comment })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('⭐ Rating submitted! Thank you.');
        onSubmitted();
        onClose();
      } else {
        toast.error(data.error || 'Failed to submit rating');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-[#1A1A1A]">Rate Your Experience</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-1">
          How was your experience picking up <strong>{foodName}</strong> from <strong>{donorName}</strong>?
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 my-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hovered || rating)
                    ? 'fill-[#F4A261] text-[#F4A261]'
                    : 'text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>

        {(hovered || rating) > 0 && (
          <p className="text-center text-sm font-medium text-[#F4A261] -mt-2 mb-4">
            {labels[hovered || rating]}
          </p>
        )}

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment (optional)..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] h-20"
          maxLength={500}
        />

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl py-3 font-semibold mt-3"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Submit Rating
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
