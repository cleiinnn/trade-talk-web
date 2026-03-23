import React, { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import axios from "axios";

import { BASE } from "../../viewmodel/constants";

const REASON_OPTIONS = [
  { value: "scam", label: "Scam / Fraud" },
  { value: "no_show", label: "No Show (didn't show up for meetup)" },
  { value: "returned_item", label: "Returned Item / Dispute" },
  { value: "fake_listing", label: "Fake Listing / Misrepresentation" },
  { value: "other", label: "Other" },
];

const ReportUserModal = ({ isOpen, onClose, reportedUserId, reportedUserName, transactionId = null }) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE}/submit_report.php`,
        {
          reported_user_id: reportedUserId,
          transaction_id: transactionId,
          reason,
          details: details.trim() || null,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setReason("");
          setDetails("");
        }, 2000);
      } else {
        setError(res.data.message || "Failed to submit report.");
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
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Report User</h2>
            <p className="text-xs text-slate-400 mt-0.5">Reporting {reportedUserName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-green-600" />
            </div>
            <p className="text-lg font-black text-slate-900 uppercase">Report Sent!</p>
            <p className="text-sm text-slate-500 mt-2">Thank you for helping keep the community safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Reason */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
                Reason <span className="text-rose-400">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20 focus:border-[#4B99D4] transition-all"
              >
                <option value="">Select a reason</option>
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Details (optional, but required for 'other') */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
                Details {reason === "other" && <span className="text-rose-400">*</span>}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide any additional information..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20 focus:border-[#4B99D4] transition-all resize-none"
                required={reason === "other"}
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
                className="flex-1 py-3 bg-rose-500 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportUserModal;
