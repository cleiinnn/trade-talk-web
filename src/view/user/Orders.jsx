import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Repeat2, Package, Loader2,
  UserCheck, Info, Truck, ClipboardList, CheckCircle2, Flag, Star
} from "lucide-react";
import { styles } from "../styles/Orders.styles.js";
import ReportUserModal from "./ReportUserModal";
import ReviewModal from "./ReviewModal";
import ConfirmModal from "./ConfirmModal";

import { BASE } from "../../viewmodel/constants";

// ── STEPPER (shared) ─────────────────────────────────────────────────────────
const Stepper = ({ steps }) => (
  <div className="py-4 px-2 mb-2">
    <div className="flex justify-between items-center relative">
      <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-0" />
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
            step.done || step.active ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-300"
          }`}>
            <step.icon size={14} />
          </div>
          <span className="text-[8px] font-black uppercase text-slate-400 text-center leading-tight">{step.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── REQUEST CARD ─────────────────────────────────────────────────────────────
const RequestCard = ({ req, onRespond, onConfirmTradeSent, onReportUser, onReviewUser, onAccept, onShip, onDecline }) => {
  const [loading,      setLoading]      = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);

  const handleAction    = async (action) => {
    if (action === 'decline') {
      onDecline(req.request_id);
    } else {
      setLoading(true);     
      await onRespond(req.request_id, action);    
      setLoading(false);
    }
  }; 

  const handleShip      = async ()   => { 
    // Instead of directly calling onMarkShipped, we open the ship confirmation
    onShip(req.order_id);
  };
  
  const handleTradeSent = async ()   => { setTradeLoading(true); await onConfirmTradeSent(req.request_id); setTradeLoading(false); };

  const isTrade   = req.request_type === "trade";
  const isPending = req.status === "pending";
  const isAccepted = req.status === "accepted";
  const hasOrder  = !!req.order_id;
  const buyerSent  = !!parseInt(req.trade_buyer_sent  ?? 0);
  const sellerSent = !!parseInt(req.trade_seller_sent ?? 0);

  // Safely get requested quantity (default to 1 if missing)
  const requestedQty = req.quantity && !isNaN(req.quantity) ? parseInt(req.quantity) : 1;
  const listingPrice = Number(req.listing_price) || 0;
  const totalAmount = listingPrice * requestedQty;

   // For buy requests, the displayed price should be the total (if quantity > 1)
  const displayPrice = isTrade ? Number(req.offered_price || 0) : totalAmount;

  const priceDiff = Math.abs(req.listing_price - (isTrade ? req.offered_price : req.listing_price));
  const isFair    = priceDiff <= (req.listing_price * 0.25);

  // Buy stepper steps
  const buySteps = [
    { label: "Placed",    icon: ClipboardList, done: ['shipped','completed'].includes(req.order_status), active: req.order_status === 'placed' },
    { label: "Shipped",   icon: Truck,         done: req.order_status === 'completed',                   active: req.order_status === 'shipped' },
    { label: "Completed", icon: CheckCircle2,  done: false,                                              active: req.order_status === 'completed' },
  ];

  // Trade stepper steps
  const tradeSteps = [
    { label: "Accepted",    icon: CheckCircle2, done: true,       active: false },
    { label: "You Sent",    icon: Truck,        done: sellerSent, active: !sellerSent && buyerSent },
    { label: "Buyer Sent",  icon: Truck,        done: buyerSent,  active: !buyerSent },
    { label: "Complete",    icon: CheckCircle2, done: req.status === 'completed', active: false },
  ];

  return (
    <div className={styles.card(isPending)}>

      {/* Intel Row */}
      <div className={styles.intelRow}>
        <div className={styles.intelBadge}><UserCheck size={12} /> Verified Buyer</div>
        <div className={styles.intelBadge}><Info size={12} /> ID: {req.request_id}</div>
        {isTrade && (
          <div className={`${styles.intelBadge} ${isFair ? 'text-green-600' : 'text-amber-600'}`}>
            {isFair ? "✓ Fair Market Trade" : "⚠ Price Gap"}
          </div>
        )}
        {hasOrder && (
          <div className={`${styles.intelBadge} text-blue-600`}>
            <Truck size={12} /> Order: {req.order_status?.toUpperCase()}
          </div>
        )}
        {isTrade && isAccepted && (
          <div className={`${styles.intelBadge} text-[#4B99D4]`}>
            <Repeat2 size={12} /> Trade in Progress
          </div>
        )}
      </div>

      {/* Buyer name */}
      <div className="flex items-center gap-2">
        <h2 className={styles.buyerName}>
          {req.buyer_name} <span className="text-slate-400 font-medium text-lg">proposes a {req.request_type}</span>
        </h2>
        <button
          onClick={() => {
            onReportUser({
              id: req.buyer_id,
              name: req.buyer_name,
              transactionId: req.status === 'completed' ? req.transaction_id : null
            });
          }}
          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
          title="Report buyer"
        >
          <Flag size={14} />
        </button>
      </div>
      <div className={styles.divider} />

      {/* Steppers */}
      {hasOrder && req.order_status !== 'cancelled' && <Stepper steps={buySteps} />}
      {isTrade && isAccepted && <Stepper steps={tradeSteps} />}

      {/* Item grid */}
      <div className={styles.grid}>
        <div className="flex flex-col">
          <span className={styles.label}>Incoming Offer</span>
          <div className={styles.itemBox}>
            <img src={isTrade ? req.offered_image : req.listing_image} className={styles.image} alt="" />
            <div className="overflow-hidden">
              <h3 className={styles.title}>{isTrade ? req.offered_title : "Cash Payment"}</h3>
             <p className={styles.value}>
                Value: ₱{displayPrice.toLocaleString()}
                {!isTrade && requestedQty > 1 && (
                  <span className="ml-2 text-[9px] font-bold text-slate-400">
                    (₱{listingPrice.toLocaleString()} × {requestedQty})
                  </span>
                )}
              </p>
              {!isTrade && requestedQty > 1 && (
                <p className="text-[9px] font-bold text-slate-400">
                  Qty: {requestedQty}
                </p>
              )}
              <span className={styles.badge}>{isTrade ? "Trade" : "Buy"}</span>
            </div>
          </div>
        </div>

        <div className={styles.swapIcon}><Repeat2 size={20} /></div>

        <div className="flex flex-col">
          <span className={styles.label}>Your Item</span>
          <div className={styles.itemBox}>
            <img src={req.listing_image} className={styles.image} alt="" />

           <div className="overflow-hidden">
              <h3 className={styles.title}>{req.listing_title}</h3>
              <p className={styles.value}>
                Listed: ₱{listingPrice.toLocaleString()}
              </p>
              {/* Show requested quantity prominently */}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] font-black uppercase text-slate-400">Requested Qty:</span>
                <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {requestedQty}
                </span>
                </div>
              <span className={styles.badge}>Inventory</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BUY: Mark as Shipped ── */}
      {!isTrade && hasOrder && req.order_status === 'placed' && (
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
            <ClipboardList size={12} /> Order Received — Ready to Ship?
          </p>
          <p className="text-xs text-slate-500 font-medium">Buyer placed the COD order. Pack and ship when ready.</p>
          <button onClick={handleShip}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50">
            <Truck size={16} />
            Mark as Shipped
          </button>
        </div>
      )}

      {/* ── BUY: Shipped awaiting buyer ── */}
      {!isTrade && hasOrder && req.order_status === 'shipped' && (
        <div className="mt-4 bg-purple-50 border border-purple-100 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
            <Truck size={12} /> Shipped — Awaiting Buyer Confirmation
          </p>
        </div>
      )}

      {/* ── BUY: Completed ── */}
      {!isTrade && hasOrder && req.order_status === 'completed' && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
            <CheckCircle2 size={12} /> Transaction Complete
          </p>
          <button
            onClick={() => {
              onReviewUser({
                transactionId: req.transaction_id,
                reviewedUserId: req.buyer_id,
                reviewedUserName: req.buyer_name,
              });
            }}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all">
            <Star size={14} /> Rate Buyer
          </button>
        </div>
      )}

      {/* ── TRADE: Confirm Seller Sent ── */}
      {isTrade && isAccepted && !sellerSent && (
        <div className="mt-4 bg-[#D9E9EE]/50 border border-[#D9E9EE] rounded-2xl p-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#4B99D4]">
            {buyerSent ? "Buyer sent their item — Send yours now!" : "Coordinate exchange with buyer via chat"}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            {buyerSent
              ? "The buyer confirmed they sent their item. Confirm once you've dispatched yours."
              : "Agree on the meetup or shipping method with the buyer, then confirm when sent."
            }
          </p>
          <button onClick={handleTradeSent} disabled={tradeLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4B99D4] text-white font-black rounded-xl hover:bg-slate-900 transition-all uppercase tracking-widest text-xs disabled:opacity-50">
            {tradeLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            I've Sent My Item
          </button>
        </div>
      )}

      {/* ── TRADE: Waiting for buyer ── */}
      {isTrade && isAccepted && sellerSent && !buyerSent && (
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
            Waiting for buyer to confirm they sent their item...
          </p>
        </div>
      )}

      {/* ── TRADE: Complete ── */}
      {isTrade && req.status === 'completed' && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-2xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
            <CheckCircle2 size={12} /> Trade Complete — Both items exchanged!
          </p>
          <button
            onClick={() => {
              onReviewUser({
                transactionId: req.transaction_id,
                reviewedUserId: req.buyer_id,
                reviewedUserName: req.buyer_name,
              });
            }}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
          >
            <Star size={14} /> Rate Buyer
          </button>
        </div>
      )}

      {/* Guidance box */}
      {isPending && !hasOrder && (
        <div className={styles.guidanceBox}>
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-[#4B99D4]" />
            <p className="font-black text-[10px] uppercase tracking-widest text-[#4B99D4]">Seller's Guidance</p>
          </div>
          <p className={styles.guidanceText}>
            Clicking <b>Accept</b> tells {req.buyer_name} you agree to the deal.
            {isTrade
              ? " Both parties will then confirm they've sent their items to complete the trade."
              : " They will then place the final COD order."
            }
          </p>
        </div>
      )}

      {/* Accept / Decline */}
      {isPending && !hasOrder ? (
        <div className={styles.buttonArea}>
          <button onClick={() => handleAction("decline")} disabled={loading} className={styles.btnSecondary}>Decline</button>
          <button onClick={() => onAccept(req.request_id)} disabled={loading} className={styles.btnPrimary}>
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Accept Request"}
          </button>
        </div>
      ) : !hasOrder && !isTrade && req.status !== 'accepted' ? (
        <div className="flex justify-end italic text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
          Request has been {req.status}
        </div>
      ) : null}
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────────────────────
const Orders = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'buy', 'trade'
  const [toast, setToast]       = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [soldItems, setSoldItems] = useState([]);
  const [loadingSold, setLoadingSold] = useState(false);

  // state for report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportUser, setReportUser] = useState(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState(null);

  // confirm modal for decline
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingDeclineId, setPendingDeclineId] = useState(null);

  // confirm modal for accept
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [pendingAcceptId, setPendingAcceptId] = useState(null);

  // confirm modal for ship
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [pendingShipId, setPendingShipId] = useState(null);

  const handleReviewUser = (reviewPayload) => {
    setReviewData(reviewPayload);
    setReviewModalOpen(true);
  };

  const [user] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null"); }
    catch { return null; }
  });
  const userId = user?.user_id ?? 0;
  const userRole = user?.role ?? null;

  useEffect(() => {
    if (!userId || userRole !== "user") navigate("/login");
  }, [userId, userRole, navigate]);

  const fetchRequests = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${BASE}/get_incoming_requests.php?user_id=${userId}`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  }, [userId]);

  const fetchTotalSales = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${BASE}/get_seller_total_sales.php?user_id=${userId}`);
      if (res.data.success) setTotalSales(res.data.total);
    } catch (err) {
      console.error("Failed to fetch total sales", err);
    }
  }, [userId]);

  const fetchSoldItems = useCallback(async () => {
    if (!userId) return;
    setLoadingSold(true);
    try {
      const res = await axios.get(`${BASE}/get_seller_sold_items.php?user_id=${userId}`);
      if (res.data.success) setSoldItems(res.data.items);
    } catch (err) {
      console.error("Failed to fetch sold items", err);
    } finally {
      setLoadingSold(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRequests();
      fetchTotalSales();
      fetchSoldItems();
    }
  }, [userId, fetchRequests, fetchTotalSales, fetchSoldItems]);

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRespond = async (requestId, action) => {
    try {
      const res = await axios.post(`${BASE}/respond_request.php`,
        { request_id: requestId, action, seller_id: userId },
        { headers: { "Content-Type": "application/json" } });
      if (res.data.success) { showToast(res.data.message); fetchRequests(); }
      else showToast(res.data.message, false);
    } catch { showToast("Server error.", false); }
  };

  const handleMarkShipped = async (orderId) => {
    try {
      const res = await axios.post(`${BASE}/update_order_status.php`,
        { order_id: orderId, status: 'shipped', user_id: userId },
        { headers: { "Content-Type": "application/json" } });
      if (res.data.success) { showToast("Order marked as shipped!"); fetchRequests(); }
      else showToast(res.data.message, false);
    } catch { showToast("Server error.", false); }
  };

  const handleConfirmTradeSent = async (requestId) => {
    try {
      const res = await axios.post(`${BASE}/confirm_trade_exchange.php`,
        { request_id: requestId, user_id: userId, action: 'seller_sent' },
        { headers: { "Content-Type": "application/json" } });
      if (res.data.success) { showToast(res.data.message); fetchRequests(); }
      else showToast(res.data.message, false);
    } catch { showToast("Server error.", false); }
  };

  // open confirm modal for decline
  const handleDeclineClick = (requestId) => {
    setPendingDeclineId(requestId);
    setConfirmModalOpen(true);
  };

  const confirmDecline = async () => {
    if (!pendingDeclineId) return;
    try {
      const res = await axios.post(`${BASE}/respond_request.php`,
        { request_id: pendingDeclineId, action: 'decline', seller_id: userId },
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
      setConfirmModalOpen(false);
      setPendingDeclineId(null);
    }
  };

  // open confirm modal for accept
  const handleAcceptClick = (requestId) => {
    setPendingAcceptId(requestId);
    setAcceptModalOpen(true);
  };

  const confirmAccept = async () => {
    if (!pendingAcceptId) return;
    try {
      const res = await axios.post(`${BASE}/respond_request.php`,
        { request_id: pendingAcceptId, action: 'accept', seller_id: userId },
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
      setAcceptModalOpen(false);
      setPendingAcceptId(null);
    }
  };

  // open confirm modal for ship
  const handleShipClick = (orderId) => {
    setPendingShipId(orderId);
    setShipModalOpen(true);
  };

  const confirmShip = async () => {
    if (!pendingShipId) return;
    try {
      await handleMarkShipped(pendingShipId);
    } finally {
      setShipModalOpen(false);
      setPendingShipId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === "all")       return true;
    if (filter === "pending")   return r.status === "pending";
    if (filter === "accepted")  return r.status === "accepted";
    if (filter === "declined")  return r.status === "declined";
    if (filter === "shipped")   return r.order_status === "shipped";
    if (filter === "completed") return r.order_status === "completed" || r.status === "completed";
    return true;
  }).filter(r => {
    if (typeFilter === "all") return true;
    return r.request_type === typeFilter;
  });

  const counts = {
    all:       requests.length,
    pending:   requests.filter(r => r.status === "pending").length,
    accepted:  requests.filter(r => r.status === "accepted").length,
    declined:  requests.filter(r => r.status === "declined").length,
    shipped:   requests.filter(r => r.order_status === "shipped").length,
    completed: requests.filter(r => r.order_status === "completed" || r.status === "completed").length,
  };

  const stats = {
    totalOrders: requests.filter(r => !!r.order_id).length,
    activeListings: [...new Set(requests.map(r => r.listing_id))].length,
    pendingRequests: requests.filter(r => r.status === "pending").length,
    completed: requests.filter(r => r.order_status === "completed" || r.status === "completed").length,
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

      <div className="max-w-3xl mx-auto mb-10 flex items-center justify-between flex-wrap gap-4">
        <button onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100">
          <ArrowLeft size={18} /> Home
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Incoming Requests</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seller Dashboard</p>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Sales Overview</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.totalOrders}</span>
            <span className={styles.statLabel}>Total Orders</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.activeListings}</span>
            <span className={styles.statLabel}>Active Items</span>
          </div>
          <div className={styles.statCardHighlight}>
            <span className={styles.statValueHighlight}>{stats.pendingRequests}</span>
            <span className={styles.statLabelHighlight}>New Requests</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>₱{totalSales.toLocaleString()}</span>
            <span className={styles.statLabel}>Total Sales</span>
          </div>
        </div>
        <div className="h-px bg-slate-200 w-full mb-8" />
      </div>

      {/* Type Filter */}
      <div className="max-w-3xl mx-auto mb-4 flex gap-2 flex-wrap">
        {['all', 'buy', 'trade'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
              typeFilter === type
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
            }`}
          >
            {type === 'all' ? 'All Types' : type === 'buy' ? 'Buy' : 'Trade'}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="max-w-3xl mx-auto mb-6 flex gap-2 flex-wrap">
        {["all","pending","accepted","shipped","completed","declined"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={styles.filterBtn(filter === f)}>
            {f}
            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md font-black ${filter === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-20 font-black text-slate-300 uppercase tracking-widest animate-pulse">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 opacity-20">
            <Package size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest">No Requests</p>
          </div>
        ) : (
          filtered.map((req) => (
            <RequestCard key={req.request_id} req={req}
              onRespond={handleRespond}
              onConfirmTradeSent={handleConfirmTradeSent}
              onReviewUser={handleReviewUser}
              onReportUser={(reportPayload) => {
                setReportUser(reportPayload);
                setReportModalOpen(true);
              }}
              onAccept={handleAcceptClick}      // pass accept handler
              onShip={handleShipClick}          // pass ship handler
              onDecline={handleDeclineClick}    // pass decline handler (already used)
            />
          ))
        )}
      </div>

      {/* Sold Items Section */}
      <div className="max-w-3xl mx-auto mt-12">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
          <Package size={16} /> Recently Sold / Traded Items
        </h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loadingSold ? (
            <div className="p-8 flex justify-center">
              <Loader2 size={24} className="animate-spin text-[#4B99D4]" />
            </div>
          ) : soldItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400 font-bold italic">No sold items yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {soldItems.map((item, idx) => (
                    <tr key={item.transaction_id ? `${item.transaction_id}-${item.listing_id}` : `${item.listing_id}-${idx}`} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={item.image_url} alt={item.title} className="w-8 h-8 rounded object-cover" />
                          <span className="text-xs font-bold text-slate-700">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{item.counterpart_name || '—'}</td>
                      <td className="px-4 py-3 text-xs font-bold text-[#4B99D4]">₱{Number(item.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.availability === 'sold' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {item.transaction_type || item.availability}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
            fetchSoldItems();
          }}
        />
      )}

      {/* Confirm modal for decline */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingDeclineId(null);
        }}
        onConfirm={confirmDecline}
        title="Decline Request"
        message="Are you sure you want to decline this request? This action cannot be undone."
        confirmText="Yes, Decline"
      />

      {/* Confirm modal for accept */}
      <ConfirmModal
        isOpen={acceptModalOpen}
        onClose={() => {
          setAcceptModalOpen(false);
          setPendingAcceptId(null);
        }}
        onConfirm={confirmAccept}
        title="Accept Request"
        message="Are you sure you want to accept this request? This will initiate the transaction."
        confirmText="Yes, Accept"
      />

      {/* Confirm modal for ship */}
      <ConfirmModal
        isOpen={shipModalOpen}
        onClose={() => {
          setShipModalOpen(false);
          setPendingShipId(null);
        }}
        onConfirm={confirmShip}
        title="Mark as Shipped"
        message="Have you shipped the item? The buyer will be notified and can confirm receipt."
        confirmText="Yes, Shipped"
      />
    </div>
  );
};

export default Orders;