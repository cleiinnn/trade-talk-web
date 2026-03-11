import React, { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import axios from "axios";

import { BASE } from "../../viewmodel/constants";

const ReviewModal = ({ isOpen, onClose, transactionId, reviewedUserId, reviewedUserName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const res = await axios.post(
        `${BASE}/submit_review.php`,
        {
          transaction_id: transactionId,
          reviewer_id: user.user_id,
          reviewed_user_id: reviewedUserId,
          rating,
          comment: comment.trim() || null,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError(res.data.message || "Failed to submit review.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Leave a Review</h2>
            <p className="text-xs text-slate-400 mt-0.5">Rate your experience with {reviewedUserName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-green-600 fill-current" />
            </div>
            <p className="text-lg font-black text-slate-900 uppercase">Review Sent!</p>
            <p className="text-sm text-slate-500 mt-2">Thank you for your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Star Rating */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                Rating <span className="text-amber-400">*</span>
              </label>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${
                        star <= (hover || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment (optional) */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20 focus:border-[#4B99D4] transition-all resize-none"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;