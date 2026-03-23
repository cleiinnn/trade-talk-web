import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReports, actionReport } from "../../viewmodel/api";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import {
  ArrowLeft,
  Flag,
  ShieldBan,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  TrendingDown,
  User,
  Hash,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { BASE } from "../../viewmodel/constants";

// ── Helpers ───────────────────────────────────────────────────────────────────
const REASON_LABELS = {
  scam:           { label: "Scam",           color: "bg-rose-50 text-rose-600 border-rose-200" },
  no_show:        { label: "No Show",        color: "bg-orange-50 text-orange-600 border-orange-200" },
  returned_item:  { label: "Returned Item",  color: "bg-amber-50 text-amber-600 border-amber-200" },
  fake_listing:   { label: "Fake Listing",   color: "bg-purple-50 text-purple-600 border-purple-200" },
  other:          { label: "Other",          color: "bg-slate-50 text-slate-600 border-slate-200" },
};

const REPORT_STATUS = {
  pending:   { label: "Pending",   color: "bg-amber-50 text-amber-600 border-amber-200",   dot: "bg-amber-500" },
  reviewed:  { label: "Reviewed",  color: "bg-sky-50 text-sky-600 border-sky-200",         dot: "bg-sky-500" },
  dismissed: { label: "Dismissed", color: "bg-slate-50 text-slate-400 border-slate-200",   dot: "bg-slate-400" },
  actioned:  { label: "Actioned",  color: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
};

const SCORE_TIER = {
  trusted:    { label: "Trusted",    color: "text-emerald-600", bg: "bg-emerald-500", bar: "bg-emerald-500" },
  caution:    { label: "Caution",    color: "text-amber-600",   bg: "bg-amber-500",   bar: "bg-amber-500" },
  restricted: { label: "Restricted", color: "text-orange-600",  bg: "bg-orange-500",  bar: "bg-orange-500" },
  flagged:    { label: "Flagged",    color: "text-rose-600",    bg: "bg-rose-500",    bar: "bg-rose-500" },
};

const getTier = (score) => {
  if (score >= 80) return "trusted";
  if (score >= 50) return "caution";
  if (score >= 20) return "restricted";
  return "flagged";
};

// ── Score Bar ─────────────────────────────────────────────────────────────────
const ScoreBar = ({ score }) => {
  const tier = getTier(score);
  const t    = SCORE_TIER[tier];
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${t.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-black ${t.color}`}>{score}/100</span>
      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
        tier === "trusted"    ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
        tier === "caution"    ? "bg-amber-50 text-amber-600 border-amber-200" :
        tier === "restricted" ? "bg-orange-50 text-orange-600 border-orange-200" :
                                "bg-rose-50 text-rose-600 border-rose-200"
      }`}>{t.label}</span>
    </div>
  );
};

// ── User Credit Drawer ────────────────────────────────────────────────────────
const CreditDrawer = ({ userId, onClose }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   fetch(`${BASE}/get_credit_score_log.php?user_id=${userId}`, {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</p>
            <h3 className="text-sm font-black text-white uppercase">Credit Score Log</h3>
          </div>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#4B99D4]" />
          </div>
        )}

        {!loading && data?.success && (
          <div className="p-6 space-y-6">
            {/* User Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#4B99D4] flex items-center justify-center text-white font-black text-sm">
                  {data.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase">{data.user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">@{data.user.username}</p>
                </div>
                <span className={`ml-auto text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  data.user.account_status === 'blocked'
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {data.user.account_status}
                </span>
              </div>
              <ScoreBar score={data.user.credit_score} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Transactions",    value: data.stats.total_transactions, color: "text-[#4B99D4]" },
                { label: "Pending Reports", value: data.stats.pending_reports,    color: "text-amber-500" },
                { label: "Buys",            value: data.stats.buy_count,          color: "text-emerald-500" },
                { label: "Trades",          value: data.stats.trade_count,        color: "text-purple-500" },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Score Log */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Score History</p>
              {data.score_log.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No score changes yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.score_log.map(log => (
                    <div key={log.log_id} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className={`text-sm font-black min-w-[3rem] text-right ${
                        log.change_amount > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 leading-snug">{log.reason}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className={`uppercase font-black ${log.changed_by === 'admin' ? 'text-amber-500' : 'text-slate-400'}`}>
                            {log.changed_by}
                          </span>
                          · {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Action Buttons ────────────adminId────────────────────────────────────────────────
const ActionButtons = ({ report, onAction }) => {
  const [loading, setLoading]   = useState(false);
  const [penalty, setPenalty]   = useState(25);
  const [note, setNote]         = useState("");
  const [expanded, setExpanded] = useState(false);

  const handle = async (action) => {
    if (action === 'ban') {
      if (!window.confirm(`Ban ${report.reported_user.name}? This will block their account and zero their credit score.`)) return;
    }
    setLoading(true);
    const res = await actionReport(report.report_id, action, {
      score_penalty: penalty,
      note: note || null,
    });
    setLoading(false);
    if (res.success) onAction(report.report_id, action);
    else alert(res.message || "Action failed.");
  };

  if (report.report_status !== 'pending' && report.report_status !== 'reviewed') {
    return (
      <span className="text-[10px] font-black uppercase text-slate-300 italic">No actions available</span>
    );
  }

  return (
    <div className="space-y-2">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {report.report_status === 'pending' && (
          <button
            onClick={() => handle('reviewed')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 rounded-lg text-[11px] font-black uppercase transition-all"
          >
            <Eye size={12} /> Review
          </button>
        )}
        <button
          onClick={() => handle('dismissed')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[11px] font-black uppercase transition-all"
        >
          <XCircle size={12} /> Dismiss
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-lg text-[11px] font-black uppercase transition-all"
        >
          <TrendingDown size={12} /> Penalize {expanded ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
        </button>
        <button
          onClick={() => handle('ban')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[11px] font-black uppercase transition-all shadow-sm shadow-rose-200"
        >
          <ShieldBan size={12} /> Ban
        </button>
      </div>

      {/* Expanded penalize options */}
      {expanded && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black uppercase text-amber-700 whitespace-nowrap">Score Penalty:</label>
            <input
              type="number"
              min={1} max={100}
              value={penalty}
              onChange={e => setPenalty(parseInt(e.target.value) || 25)}
              className="w-16 text-xs font-black text-center bg-white border border-amber-200 rounded-lg px-2 py-1"
            />
          </div>
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-1.5 placeholder-amber-300"
          />
          <button
            onClick={() => handle('actioned')}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-1.5 text-[11px] font-black uppercase transition-all"
          >
            {loading ? <Loader2 size={12} className="animate-spin mx-auto" /> : `Apply -${penalty} Penalty`}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Report Row ────────────────────────────────────────────────────────────────
const ReportRow = ({ report, onAction, onViewScore }) => {
  const [expanded, setExpanded] = useState(false);
  const reason = REASON_LABELS[report.reason] || REASON_LABELS.other;
  const status = REPORT_STATUS[report.report_status] || REPORT_STATUS.pending;
  const score  = report.reported_user.credit_score;
  const tier   = getTier(score);

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      report.report_status === 'pending' ? 'border-amber-200 shadow-sm shadow-amber-50' : 'border-slate-100'
    }`}>
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Report meta */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Top: reason + status + date */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${reason.color}`}>
                {reason.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="text-[10px] font-bold text-slate-400 ml-auto">
                {new Date(report.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Reporter → Reported */}
            <div className="flex items-center gap-2 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <p className="text-[10px] font-black uppercase text-slate-400">Reporter</p>
                <p className="font-black text-slate-800">{report.reporter.name}</p>
                <p className="text-[10px] text-slate-400">@{report.reporter.username}</p>
              </div>
              <Flag size={14} className="text-rose-400 flex-shrink-0" />
              <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5 flex-1">
                <p className="text-[10px] font-black uppercase text-rose-400">Reported</p>
                <p className="font-black text-slate-800">{report.reported_user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SCORE_TIER[tier].bar}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-black ${SCORE_TIER[tier].color}`}>{score}</span>
                </div>
              </div>
            </div>

            {/* Transaction link */}
            {report.transaction && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <Hash size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600">
                  Txn #{report.transaction.transaction_id} · {report.transaction.listing_title}
                </span>
                <span className="text-[10px] font-black text-[#4B99D4] ml-auto uppercase">
                  {report.transaction.transaction_type}
                </span>
              </div>
            )}

            {/* Details */}
            {report.details && (
              <p className="text-xs italic text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                "{report.details}"
              </p>
            )}
          </div>
        </div>

        {/* Bottom row: View score + expand actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
          <button
            onClick={() => onViewScore(report.reported_user.user_id)}
            className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#4B99D4] hover:text-blue-700 transition-colors"
          >
            <User size={12} /> View Score Log
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors ml-auto"
          >
            Actions {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <ActionButtons report={report} onAction={onAction} />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminReports = () => {
  useAdminAuth();
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState("pending");
  const [drawerUserId, setDrawerUserId] = useState(null);

  const fetchReports = useCallback(async (status = filter) => {
    setLoading(true);
    try {
      const res = await getReports(status ? { status } : {});
      if (res.success) setReports(res.reports);
      else setError("Failed to load reports.");
    } catch {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReports(filter); }, [filter, fetchReports]);

  const handleAction = (reportId, action) => {
    // Optimistically update status in UI
    setReports(prev => prev.map(r =>
      r.report_id === reportId
        ? { ...r, report_status: action === 'ban' ? 'actioned' : action }
        : r
    ));
  };

  // Counts per status for tab badges
  const counts = reports.reduce((acc, r) => {
    acc[r.report_status] = (acc[r.report_status] || 0) + 1;
    return acc;
  }, {});

  const FILTERS = [
    { key: "pending",   label: "Pending" },
    { key: "reviewed",  label: "Reviewed" },
    { key: "actioned",  label: "Actioned" },
    { key: "dismissed", label: "Dismissed" },
    { key: "",          label: "All" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900">

      {/* Header */}
      <div className="bg-slate-900 px-8 py-6 shadow-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link to="/Admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-[#4B99D4]">
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-rose-500 p-2.5 rounded-xl shadow-lg shadow-rose-500/20">
            <ShieldAlert size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">
              Reports & Enforcement
            </h2>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mt-0.5">
              Trade & Talk Systems
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {counts.pending > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                {counts.pending} PENDING
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                filter === f.key
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {f.label}
              {f.key === 'pending' && counts.pending > 0 && (
                <span className="ml-2 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="py-20 flex justify-center">
            <Loader2 size={32} className="animate-spin text-[#4B99D4]" />
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}
        {!loading && !error && reports.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100">
            <CheckCircle size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-black italic uppercase tracking-widest text-sm">
              No {filter || ""} reports found.
            </p>
          </div>
        )}

        {/* Reports List */}
        {!loading && !error && reports.length > 0 && (
          <div className="space-y-4">
            {reports.map(report => (
              <ReportRow
                key={report.report_id}
                report={report}
                onAction={handleAction}
                onViewScore={setDrawerUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Credit Score Drawer */}
      {drawerUserId && (
        <CreditDrawer
          userId={drawerUserId}
          onClose={() => setDrawerUserId(null)}
        />
      )}
    </div>
  );
};

export default AdminReports;
