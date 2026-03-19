import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, MessageCircle, Star, ShieldCheck, Zap,
  Repeat2, ShoppingBag, X, AlertTriangle, CheckCircle, Package, User
} from "lucide-react";
import axios from "axios";

import { BASE } from "../../viewmodel/constants";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const lastFocusedElement = useRef(null);

  const [item, setItem]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [message, setMessage]     = useState(""); // still used in modal

  // Modal state
  const [modal, setModal]         = useState(null); // null | 'buy' | 'trade'
  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fairWarning, setFairWarning] = useState(null);
  const [result, setResult]       = useState(null);
  const [quantity, setQuantity]   = useState(1);

  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  // --- Fetch the listing ---
  useEffect(() => {
    const fetchItem = async () => {
      if (!id || id === "undefined") { setLoading(false); return; }
      try {
        const res = await axios.get(`${BASE}/get_listing_detail.php?id=${id}`);
        const payload = res.data;
        const norm = Array.isArray(payload)
          ? payload[0] || null
          : payload?.data || payload?.listing || payload;
        setItem(norm && typeof norm === "object" ? norm : null);
      } catch { setItem(null); }
      finally { setLoading(false); }
    };
    fetchItem();
  }, [id]);

  // --- Open modals ---
  const openBuyModal = () => {
    if (!user) return navigate("/login");
    setMessage("");
    setResult(null);
    setFairWarning(null);
    setQuantity(1);
    setModal("buy");
    lastFocusedElement.current = document.activeElement;
  };

  const openTradeModal = async () => {
    if (!user) return navigate("/login");
    setMessage("");
    setResult(null);
    setFairWarning(null);
    setSelectedOffer(null);
    setModal("trade");
    lastFocusedElement.current = document.activeElement;
    setLoadingMyListings(true);
    try {
      const res = await axios.get(`${BASE}/get_buyer_listings.php?user_id=${user.user_id}`);
      setMyListings(Array.isArray(res.data) ? res.data : []);
    } catch { setMyListings([]); }
    finally { setLoadingMyListings(false); }
  };

  const closeModal = () => {
    setModal(null);
    setFairWarning(null);
    setResult(null);
    setSelectedOffer(null);
    setQuantity(1);
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
    }
  };

  // Handle Escape key in modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modal && e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modal]);

  // Focus trap inside modal
  useEffect(() => {
    if (modal && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [modal]);

  // --- Submit Request ---
  const submitRequest = async (forceTrade = false) => {
    if (!user || !item) return;
    setSubmitting(true);
    try {
      const payload = {
        buyer_id:     user.user_id,
        listing_id:   item.listing_id ?? id,
        message,
        request_type: modal,
        quantity: modal === "buy" ? quantity : 1,
      };
      if (modal === "trade") {
        if (!selectedOffer) { setSubmitting(false); return; }
        payload.offered_listing_id = selectedOffer.listing_id;
        payload.force_trade = forceTrade;
      }
      const res = await axios.post(`${BASE}/buy_process.php`, payload, {
        headers: { "Content-Type": "application/json" }
      });

      if (res.data.fair_warning) {
        setFairWarning(res.data);
        setSubmitting(false);
        return;
      }

      setResult({ success: res.data.success, message: res.data.message });
    } catch {
      setResult({ success: false, message: "Server error. Please try again." });
    }
    setSubmitting(false);
  };

  const isOwner = user && item && String(item.user_id) === String(user.user_id);

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-black text-slate-600 animate-pulse tracking-widest uppercase">
      Loading Grail...
    </div>
  );
  if (!item) return (
    <div className="p-20 text-center font-bold text-slate-600">Item not found.</div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content link (hidden but focusable) */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-4 z-50 shadow-lg">
        Skip to main content
      </a>

      {/* ── HEADER ── */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2 rounded-lg px-3 py-2"
          aria-label="Go back"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          Back to Collection
        </button>
        <div className="flex items-center gap-2 text-[#4B99D4]">
          <ShieldCheck size={18} aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Verified Listing</span>
        </div>
      </div>

      <main id="main-content" className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 pb-20">
        {/* LEFT: Image */}
        <div className="relative group">
          <div className="aspect-square rounded-[3rem] bg-slate-50 border border-slate-200 overflow-hidden shadow-lg transition-transform duration-500 hover:scale-[1.02]">
            <img
              src={item.image_url?.startsWith("http") ? item.image_url : `${BASE}/${item.image_url}`}
              alt={item.title ? `Image of ${item.title}` : "Product image"}
              className="w-full h-full object-contain p-4"
            />
          </div>
          <div className="absolute top-6 left-8 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-slate-700">
              <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
              Top Tier Item
            </span>
          </div>
          {/* Stock badge */}
          {item.stock !== undefined && (
            <div className="absolute top-4 right-8 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-2xl">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-white">
                <Package size={12} aria-hidden="true" />
                {item.stock > 0 ? `${item.stock} in stock` : "Sold Out"}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-10">
            <p className="text-[#4B99D4] text-xs font-black uppercase tracking-[0.3em] mb-3">Authentic Piece</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">{item.title}</h1>
            <p className="text-2xl font-black text-slate-900 leading-none">
              PHP {new Intl.NumberFormat("en-PH").format(Number(item.price || 0))}
            </p>
            {item.seller && (
              <p className="mt-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                Seller: <span className="text-[#4B99D4]">{item.seller}</span>
              </p>
            )}
          </div>

          <div className="space-y-8">
            {/* Description */}
            <section className="p-4 bg-slate-50 rounded-[2rem] border border-slate-200">
              <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                <Zap size={14} className="text-[#4B99D4]" aria-hidden="true" />
                Seller Description
              </h2>
              <p className="text-slate-700 font-medium leading-relaxed italic">
                "{item.description || "No description provided."}"
              </p>
            </section>

            {/* Seller Info */}
            <section className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
              <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                <User size={14} className="text-[#4B99D4]" aria-hidden="true" />
                Seller Profile
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.seller}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Credit score badge */}
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      item.seller_credit_score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      item.seller_credit_score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      item.seller_credit_score >= 20 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      Credit: {item.seller_credit_score}
                    </span>
                    {/* Rating stars */}
                    {item.seller_avg_rating ? (
                      <div className="flex items-center gap-1">
                        <div className="flex" aria-label={`Rated ${item.seller_avg_rating} out of 5 stars`}>
                          {[1,2,3,4,5].map(star => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= Math.round(item.seller_avg_rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-600 ml-1">
                          {item.seller_avg_rating} ({item.seller_review_count} {item.seller_review_count === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No reviews yet</span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/profile/${item.user_id}`}
                  className="text-[10px] font-black text-[#4B99D4] hover:underline focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2 rounded-lg px-3 py-2"
                >
                  View Profile
                </Link>
              </div>
            </section>

            {/* Action Buttons */}
            {isOwner ? (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                <p className="text-xs font-black text-amber-600 uppercase tracking-widest">This is your listing</p>
              </div>
            ) : (item.stock <= 0) ? (
              <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
                <p className="text-xs font-black text-red-600 uppercase tracking-widest">Sold Out</p>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={openBuyModal}
                  className="flex-[2] flex items-center justify-center gap-2 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#4B99D4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2 active:scale-95 uppercase tracking-widest text-sm min-h-[44px]"
                  aria-label="Buy this item"
                >
                  <ShoppingBag size={18} aria-hidden="true" />
                  Buy Now
                </button>
                <button
                  onClick={openTradeModal}
                  className="flex-[2] flex items-center justify-center gap-2 py-5 bg-[#D9E9EE] text-[#4B99D4] font-black rounded-2xl hover:bg-[#4B99D4] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2 active:scale-95 uppercase tracking-widest text-sm min-h-[44px]"
                  aria-label="Propose a trade"
                >
                  <Repeat2 size={18} aria-hidden="true" />
                  Propose Trade
                </button>
                <button
                  onClick={() => {
                    if (!user) return navigate("/login");
                    navigate("/messages", {
                      state: {
                        other_user_id: item.user_id,
                        other_username: item.seller,
                        other_avatar: item.seller_profile_picture_url,
                      }
                    });
                  }}
                  className="flex-1 flex items-center justify-center bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2 min-h-[44px]"
                  aria-label="Open chat with seller"
                >
                  <MessageCircle size={24} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── MODAL ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {result ? (
              // Result state
              <div className="p-8 flex flex-col items-center text-center gap-4">
                {result.success ? (
                  <CheckCircle size={48} className="text-green-500" aria-hidden="true" />
                ) : (
                  <AlertTriangle size={48} className="text-red-500" aria-hidden="true" />
                )}
                <h2 id="modal-title" className="text-lg font-black uppercase tracking-widest text-slate-900">
                  {result.success ? "Request Sent!" : "Oops!"}
                </h2>
                <p className="text-sm text-slate-600">{result.message}</p>
                <button
                  onClick={result.success ? () => navigate("/home") : closeModal}
                  className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl uppercase tracking-widest text-xs hover:bg-[#4B99D4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2 min-h-[44px]"
                >
                  {result.success ? "Home" : "Try Again"}
                </button>
              </div>
            ) : fairWarning ? (
              // Fair warning state
              <div className="p-8 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                  <AlertTriangle size={28} className="text-amber-500" />
                </div>
                <h2 id="modal-title" className="text-base font-black uppercase tracking-widest text-slate-900">Price Mismatch</h2>
                <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">You want:</span>
                    <span className="text-slate-800">{fairWarning.target_title}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">Their price:</span>
                    <span className="text-[#4B99D4]">₱{Number(fairWarning.target_price).toLocaleString()}</span>
                  </div>
                  <hr className="border-amber-200" />
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">You offer:</span>
                    <span className="text-slate-800">{fairWarning.offered_title}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">Your price:</span>
                    <span className="text-amber-600">₱{Number(fairWarning.offered_price).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fair trades should be within <span className="text-amber-600">±30%</span> of each other's value.
                  The seller may decline, but you can still send it.
                </p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-black rounded-xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setFairWarning(null); submitRequest(true); }}
                    disabled={submitting}
                    className="flex-[2] py-3 bg-amber-500 text-white font-black rounded-xl uppercase tracking-widest text-xs hover:bg-amber-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 min-h-[44px]"
                  >
                    {submitting ? "Sending..." : "Send Anyway"}
                  </button>
                </div>
              </div>
            ) : (
              // Main modal content
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">
                      {modal === "buy" ? "Purchase Request" : "Trade Proposal"}
                    </p>
                    <h2 id="modal-title" className="text-xl font-black text-slate-900 tracking-tight">{item.title}</h2>
                    <p className="text-sm font-bold text-[#4B99D4] mt-1">
                      PHP {new Intl.NumberFormat("en-PH").format(Number(item.price || 0))}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2"
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>

                {modal === "trade" && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Select Your Offer</p>
                    {loadingMyListings ? (
                      <div className="text-center py-6 text-slate-400 font-bold animate-pulse uppercase text-xs">Loading...</div>
                    ) : myListings.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <p className="text-xs font-bold text-slate-500">No eligible listings found.</p>
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {myListings.map((listing) => {
                          const isSelected = selectedOffer?.listing_id === listing.listing_id;
                          const priceDiff = item.price > 0
                            ? Math.abs(((listing.price - item.price) / item.price) * 100).toFixed(0)
                            : null;
                          const isFair = priceDiff !== null && Number(priceDiff) <= 30;

                          return (
                            <button
                              key={listing.listing_id}
                              onClick={() => setSelectedOffer(listing)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                                isSelected
                                  ? "border-[#4B99D4] bg-[#D9E9EE]/30"
                                  : "border-slate-200 hover:border-slate-300 bg-slate-50"
                              } focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-1`}
                              aria-pressed={isSelected}
                            >
                              <img
                                src={listing.image_url}
                                alt={listing.title}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-800 truncate">{listing.title}</p>
                                <p className="text-[10px] font-bold text-[#4B99D4]">
                                  ₱{Number(listing.price).toLocaleString()}
                                  {priceDiff !== null && (
                                    <span className={`ml-1 text-[8px] font-black uppercase ${isFair ? "text-green-600" : "text-amber-600"}`}>
                                      {isFair ? "✓ Fair" : `~${priceDiff}%`}
                                    </span>
                                  )}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle size={16} className="text-[#4B99D4] flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {modal === "buy" && (
                  <div className="space-y-1">
                    <label htmlFor="modal-quantity" className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">
                      Quantity (max {item.stock})
                    </label>
                    <input
                      id="modal-quantity"
                      type="number"
                      min="1"
                      max={item.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(item.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4B99D4] focus:border-transparent"
                    />
                    <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Subtotal:</span>
                    <span className="text-lg font-black text-[#4B99D4]">
                      ₱{(Number(item.price) * quantity).toLocaleString()}
                    </span>
                  </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="modal-message" className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">
                    Message <span className="text-slate-400 normal-case font-medium">(optional)</span>
                  </label>
                  <textarea
                    id="modal-message"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4B99D4] focus:border-transparent resize-none text-sm"
                    rows="2"
                    placeholder={modal === "trade" ? "Why this trade?" : "Questions?"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => submitRequest(false)}
                  disabled={submitting || (modal === "trade" && !selectedOffer)}
                  className={`w-full py-3.5 font-black rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors ${
                    modal === "trade" && !selectedOffer
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-[#4B99D4] focus:outline-none focus:ring-2 focus:ring-[#4B99D4] focus:ring-offset-2"
                  } min-h-[44px]`}
                >
                  {submitting ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : modal === "buy" ? (
                    <><ShoppingBag size={16} aria-hidden="true" /> Confirm Purchase</>
                  ) : (
                    <><Repeat2 size={16} aria-hidden="true" /> Send Trade Proposal</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
