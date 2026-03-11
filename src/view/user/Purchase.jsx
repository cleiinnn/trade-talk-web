import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, ShoppingBag, Repeat2, Clock,
  Package, MessageCircle, ChevronDown, ChevronUp,
  Loader2, Ban, CheckCircle2, Truck, ClipboardList, MapPin, HandshakeIcon, TrendingUp, CreditCard, Flag, Star
} from "lucide-react";
import { styles } from "../styles/Purchase.styles.js";
import ReportUserModal from "./ReportUserModal";
import ReviewModal from "./ReviewModal";
import ConfirmModal from "./ConfirmModal"; 

import { BASE } from "../../viewmodel/constants";

const statusStyles = {
  pending:   { bar: "bg-amber-400",  badge: "bg-amber-50  text-amber-500  border-amber-100"  },
  accepted:  { bar: "bg-green-400",  badge: "bg-green-50  text-green-500  border-green-100"  },
  declined:  { bar: "bg-red-400",    badge: "bg-red-50    text-red-400    border-red-100"    },
  completed: { bar: "bg-blue-400",   badge: "bg-blue-50   text-blue-500   border-blue-100"   },
  cancelled: { bar: "bg-slate-300",  badge: "bg-slate-100 text-slate-400  border-slate-200"  },
  placed:    { bar: "bg-sky-400",    badge: "bg-sky-50    text-sky-600    border-sky-100"     },
  shipped:   { bar: "bg-purple-400", badge: "bg-purple-50 text-purple-600 border-purple-100" },
};

const StatusBadge = ({ status }) => {
  const s = statusStyles[status] ?? statusStyles.cancelled;
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${s.badge}`}>
      {status}
    </span>
  );
};

// ── BUY STEPPER ──────────────────────────────────────────────────────────────
const BuyStepper = ({ orderStatus }) => {
  const steps = [
    { key: 'placed',    icon: ClipboardList },
    { key: 'shipped',   icon: Truck         },
    { key: 'completed', icon: CheckCircle2  },
  ];
  return (
    <div className="py-4 px-2">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100" />
        {steps.map((step) => {
          const isDone = (step.key === 'placed'  && ['shipped','completed'].includes(orderStatus)) ||
                         (step.key === 'shipped' && orderStatus === 'completed');
          const isActive = orderStatus === step.key;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                isDone || isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-300"
              }`}>
                <step.icon size={14} />
              </div>
              <span className="text-[8px] font-black uppercase text-slate-400">{step.key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── TRADE STEPPER ─────────────────────────────────────────────────────────────
const TradeStepper = ({ buyerSent, sellerSent, completed }) => {
  const steps = [
    { label: "Accepted",     done: true },
    { label: "You Sent",     done: !!buyerSent },
    { label: "Seller Sent",  done: !!sellerSent },
    { label: "Complete",     done: completed },
  ];
  return (
    <div className="py-4 px-2">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100" />
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-2 relative z-10 bg-white px-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              step.done ? "bg-[#4B99D4] border-[#4B99D4] text-white" : "bg-white border-slate-200 text-slate-300"
            }`}>
              <CheckCircle2 size={14} />
            </div>
            <span className="text-[7px] font-black uppercase text-slate-400 text-center leading-tight">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── REQUEST CARD ──────────────────────────────────────────────────────────────
// Updated to accept new modal‑opening props
const RequestCard = ({ 
  req, 
  onCancel, 
  onOpenChat, 
  onConfirmReceiptClick,   // new: opens receipt confirmation modal
  onSentItemClick,         // new: opens sent item confirmation modal
  onReportUser, 
  onReviewUser 
}) => {
  const [expanded, setExpanded]   = useState(false);
  const [confirming, setConfirming] = useState(false); // still used for spinner? Actually we now open modal, so maybe remove. But keep for now.
  const navigate = useNavigate();

  const isTrade    = req.request_type === "trade";
  const isPending  = req.status === "pending";
  const isAccepted = req.status === "accepted";
  const isCompleted = req.status === "completed";
  const hasOrder   = !!req.order_id;

  // Trade flags
  const buyerSent  = !!parseInt(req.trade_buyer_sent  ?? 0);
  const sellerSent = !!parseInt(req.trade_seller_sent ?? 0);

  // Display status: for buy use order_status if exists, else request status
  const displayStatus = !isTrade && hasOrder ? req.order_status : req.status;
  const barColor = (statusStyles[displayStatus] ?? statusStyles.cancelled).bar;

  const handleCancelClick = () => {
    onCancel(req.request_id);
  };

  // The confirm function is now handled by the modal, so we remove direct API calls.
  // We'll keep the handleConfirm function if needed for something else, but it's not used.
  // Actually we can remove it entirely because we use modal‑opening props.
  // But the buttons originally called handleConfirm. We'll replace them with the new props.

  return (
    <div className={styles.card}>
      <div className={`h-1.5 w-full -mt-6 -mx-6 mb-6 rounded-t-3xl ${barColor}`} />

      <div className={styles.cardHeader}>
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <img src={req.listing_image} alt="" className={styles.image} />
            <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center border-2 border-white ${isTrade ? "bg-[#4B99D4]" : "bg-slate-900"}`}>
              {isTrade ? <Repeat2 size={12} className="text-white" /> : <ShoppingBag size={12} className="text-white" />}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              {isTrade ? "Trade Proposal" : "Purchase Request"}
            </p>
            <h3 className={styles.title}>
              {req.listing_title}
              <span className="ml-2 text-[9px] font-bold text-slate-400">x{req.quantity}</span>
            </h3>
            <p className="text-[11px] font-bold text-[#4B99D4] mt-0.5">
             ₱{(Number(req.listing_price) * (req.quantity || 1)).toLocaleString()}
              {req.quantity > 1 && (
                <span className="ml-1 text-[9px] font-medium text-slate-400">
                  (₱{Number(req.listing_price).toLocaleString()} × {req.quantity})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={displayStatus} />
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Seller: <span className="text-slate-600 normal-case font-bold">{req.seller_name}</span>
        </p>
        <button
          onClick={() => {
            onReportUser({
              id: req.seller_id,
              name: req.seller_name,
              transactionId: req.status === 'completed' ? req.transaction_id : null
            });
          }}
          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
          title="Report seller"
        >
          <Flag size={14} />
        </button>
      </div>

      <p className="text-[10px] font-medium text-slate-300 flex items-center gap-1 border-l border-slate-200 pl-4">
        <Clock size={10} />
        {new Date(req.created_at.replace(" ", "T")).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
      </p>

      {expanded && (
        <div className="space-y-4 border-t border-slate-50 pt-5">
          {isTrade && req.offered_title && (
            <div className={styles.itemBox}>
              <img src={req.offered_image} alt="" className={styles.image} />
              <div>
                <span className={styles.badge}>Your Offer</span>
                <p className={styles.title}>{req.offered_title}</p>
                <p className={styles.value}>₱{Number(req.offered_price).toLocaleString()}</p>
              </div>
            </div>
          )}

          {!isTrade && hasOrder && <BuyStepper orderStatus={req.order_status} />}
          {isTrade && isAccepted && <TradeStepper buyerSent={buyerSent} sellerSent={sellerSent} completed={isCompleted} />}

          {/* Contextual Action Alerts */}
          {isAccepted && !hasOrder && !isTrade && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 space-y-3 text-center">
              <p className="text-xs font-medium text-slate-600">Request Accepted! Complete checkout to proceed.</p>
              <button onClick={() => navigate(`/order-summary?request_id=${req.request_id}`)} className={`${styles.btnAction} ${styles.btnChat}`}>
                <ClipboardList size={15} /> Place Order (COD)
              </button>
            </div>
          )}

          {/* Confirm Receipt button – now uses modal opener */}
          {hasOrder && req.order_status === 'shipped' && (
            <button 
              onClick={() => onConfirmReceiptClick(req.order_id)} 
              className={`${styles.btnAction} bg-green-500 text-white hover:bg-green-600`}
            >
              <CheckCircle2 size={15} /> Confirm Receipt
            </button>
          )}

          {/* Review Button for completed transactions */}
          {(req.status === 'completed' || req.order_status === 'completed') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  onReviewUser({
                    transactionId: req.transaction_id,
                    reviewedUserId: req.seller_id,
                    reviewedUserName: req.seller_name,
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
              >
                <Star size={14} /> Rate Seller
              </button>
            </div>
          )}

          {/* I've Sent My Item button – trade, uses modal opener */}
          {isTrade && isAccepted && !buyerSent && (
            <button 
              onClick={() => onSentItemClick(req.request_id)} 
              className={`${styles.btnAction} bg-[#4B99D4] text-white`}
            >
              <CheckCircle2 size={15} /> I've Sent My Item
            </button>
          )}

          {req.message && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Message</p>
              <p className="text-sm font-medium text-slate-600 italic">"{req.message}"</p>
            </div>
          )}

          <div className={styles.buttonArea}>
            <button onClick={() => onOpenChat(req)} className={`${styles.btnAction} ${styles.btnSecondary}`}>
              <MessageCircle size={14} /> Chat
            </button>
            {isPending && (
              <button onClick={handleCancelClick} className={`${styles.btnAction} ${styles.btnDanger}`}>
                <Ban size={14} /> Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
const Purchase = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [toast, setToast]       = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportUser, setReportUser] = useState(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState(null);

  // Cancel modal state (already present)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);

  // New modal states
  const [confirmReceiptModalOpen, setConfirmReceiptModalOpen] = useState(false);
  const [pendingReceiptId, setPendingReceiptId] = useState(null);
  const [sentItemModalOpen, setSentItemModalOpen] = useState(false);
  const [pendingSentId, setPendingSentId] = useState(null);

  const handleReviewUser = (reviewPayload) => {
    setReviewData(reviewPayload);
    setReviewModalOpen(true);
  };

  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "user") navigate("/login");
  }, []);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${BASE}/get_buyer_requests.php?user_id=${user.user_id}`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  // Cancel handlers (already present)
  const handleCancelRequest = (requestId) => {
    setPendingCancelId(requestId);
    setConfirmModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!pendingCancelId) return;
    try {
      const res = await axios.post(`${BASE}/cancel_request.php`,
        { request_id: pendingCancelId, buyer_id: user.user_id },
        { headers: { "Content-Type": "application/json" } });
      if (res.data.success) {
        showToast("Request cancelled.");
        fetchRequests();
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast("Server error.", false);
    } finally {
      setConfirmModalOpen(false);
      setPendingCancelId(null);
    }
  };

  // New: open confirm receipt modal
  const handleConfirmReceiptClick = (orderId) => {
    setPendingReceiptId(orderId);
    setConfirmReceiptModalOpen(true);
  };

  const confirmReceipt = async () => {
    if (!pendingReceiptId) return;
    try {
      const res = await axios.post(`${BASE}/update_order_status.php`,
        { order_id: pendingReceiptId, status: 'completed', user_id: user.user_id },
        { headers: { "Content-Type": "application/json" } });
      if (res.data.success) {
        showToast("Order completed!");
        fetchRequests();
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast("Server error.", false);
    } finally {
      setConfirmReceiptModalOpen(false);
      setPendingReceiptId(null);
    }
  };

  // New: open sent item modal
  const handleSentItemClick = (requestId) => {
    setPendingSentId(requestId);
    setSentItemModalOpen(true);
  };

  const confirmSentItem = async () => {
    if (!pendingSentId) return;
    try {
      const res = await axios.post(`${BASE}/confirm_trade_exchange.php`,
        { request_id: pendingSentId, user_id: user.user_id, action: 'buyer_sent' },
        { headers: { "Content-Type": "application/json" } });
      if (res.data.success) {
        showToast(res.data.message);
        fetchRequests();
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast("Server error.", false);
    } finally {
      setSentItemModalOpen(false);
      setPendingSentId(null);
    }
  };

  const handleOpenChat = (req) => {
    navigate("/messages", {
      state: {
        listing_id:     req.listing_id,
        listing_title:  req.listing_title,
        listing_image:  req.listing_image,
        other_user_id:  req.seller_id,
        other_username: req.seller_name,
      }
    });
  };

  // The original onConfirmReceipt and onConfirmTradeSent functions are now only used via modal,
  // but we can keep them as they are, or remove them if not used elsewhere. We'll keep them
  // because they are called by the confirm functions above.
  // Actually we are not using them directly anymore, but they are defined above. It's fine.

  const filtered = requests.filter(r => {
    if (filter === "all")       return true;
    if (filter === "pending")   return r.status === "pending";
    if (filter === "accepted")  return r.status === "accepted";
    if (filter === "shipped")   return r.order_status === "shipped";
    if (filter === "completed") return r.status === "completed";
    if (filter === "declined")  return r.status === "declined";
    if (filter === "cancelled") return r.status === "cancelled";
    return true;
  });

  const counts = {
    all:       requests.length,
    pending:   requests.filter(r => r.status === "pending").length,
    accepted:  requests.filter(r => r.status === "accepted" && r.status !== "completed").length,
    shipped:   requests.filter(r => r.order_status === "shipped").length,
    completed: requests.filter(r => r.status === "completed").length,
    declined:  requests.filter(r => r.status === "declined").length,
    cancelled: requests.filter(r => r.status === "cancelled").length,
  };

  const stats = {
    activeRequests: requests.filter(r => r.status === 'pending').length,
    incomingItems: requests.filter(r => r.order_status === 'shipped' || (r.request_type === 'trade' && r.trade_seller_sent == 1 && r.status !== 'completed')).length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalSpent: requests.reduce((acc, r) => r.status === 'completed' && r.request_type === 'buy' ? acc + Number(r.listing_price) * (r.quantity || 1)  : acc, 0)
  };

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-black text-sm uppercase tracking-widest ${
          toast.success !== false ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 transition-colors">
          <ArrowLeft size={18} /> Home
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black tracking-tight text-slate-800">My Requests</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Dashboard</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className={`max-w-3xl mx-auto ${styles.statsGrid}`}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.activeRequests}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statCardHighlight}>
          <span className={styles.statValueHighlight}>{stats.incomingItems}</span>
          <span className={styles.statLabelHighlight}>In Transit</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>₱{stats.totalSpent.toLocaleString()}</span>
          <span className={styles.statLabel}>Total Spent</span>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-3xl mx-auto mb-6 flex gap-2 flex-wrap">
        {["all","pending","accepted","shipped","completed","declined","cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
              filter === f ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
            }`}>
            {f}
            <span className={`text-[10px] px-1 py-0.5 rounded-md font-black ${filter === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {counts[f] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Request List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-20 font-black text-slate-300 uppercase tracking-widest animate-pulse text-xs">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Package size={40} className="mx-auto text-slate-200" />
            <p className="font-black text-slate-300 uppercase tracking-widest text-xs">No {filter !== "all" ? filter : ""} requests found</p>
          </div>
        ) : (
          filtered.map(req => (
            <RequestCard
              key={req.request_id}
              req={req}
              onCancel={handleCancelRequest}
              onOpenChat={handleOpenChat}
              // Pass the new modal‑opening handlers
              onConfirmReceiptClick={handleConfirmReceiptClick}
              onSentItemClick={handleSentItemClick}
              onReviewUser={handleReviewUser}
              onReportUser={(reportPayload) => {
                setReportUser(reportPayload);
                setReportModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {reportUser && (
        <ReportUserModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportUser(null);
          }}
          reportedUserId={reportUser.id}
          reportedUserName={reportUser.name}
          transactionId={reportUser.transactionId}
        />
      )}

      {reviewData && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setReviewData(null);
          }}
          transactionId={reviewData.transactionId}
          reviewedUserId={reviewData.reviewedUserId}
          reviewedUserName={reviewData.reviewedUserName}
          onSuccess={() => {
            fetchRequests();
          }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingCancelId(null);
        }}
        onConfirm={confirmCancel}
        title="Cancel Request"
        message="Are you sure you want to cancel this request? This action cannot be undone."
        confirmText="Yes, Cancel"
      />

      {/* Confirm Receipt Modal */}
      <ConfirmModal
        isOpen={confirmReceiptModalOpen}
        onClose={() => {
          setConfirmReceiptModalOpen(false);
          setPendingReceiptId(null);
        }}
        onConfirm={confirmReceipt}
        title="Confirm Receipt"
        message="Have you received the item? This will complete the order."
        confirmText="Yes, Received"
      />

      {/* Sent Item Modal (for trades) */}
      <ConfirmModal
        isOpen={sentItemModalOpen}
        onClose={() => {
          setSentItemModalOpen(false);
          setPendingSentId(null);
        }}
        onConfirm={confirmSentItem}
        title="Confirm Sent"
        message="Have you sent your item to the seller? This will update the trade status."
        confirmText="Yes, Sent"
      />
    </div>
  );
};

export default Purchase;