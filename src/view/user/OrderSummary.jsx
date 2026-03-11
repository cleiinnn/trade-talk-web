import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, MapPin, Phone, User, Package,
  Truck, ShieldCheck, CheckCircle, Loader2, Repeat2
} from "lucide-react";

import { BASE } from "../../viewmodel/constants";

const OrderSummary = () => {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const request_id = params.get("request_id");

  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced]         = useState(false);
  const [error, setError]           = useState("");

  // Only phone and address — name comes from users table
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [buyerName, setBuyerName] = useState("");

  useEffect(() => {
    if (!user || user.role !== "user") { navigate("/login"); return; }
    if (!request_id) { navigate("/purchase"); return; }
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${BASE}/get_order_summary.php`, {
        params: { request_id, buyer_id: user.user_id }
      });
      if (res.data.success) {
        const d = res.data.data;
        setSummary(d);
        setPlaced(d.already_placed);
        // Name is read-only — from first_name + last_name in users
        const name = [d.buyer_first_name, d.buyer_last_name].filter(Boolean).join(" ") || d.buyer_name || user.username;
        setBuyerName(name);
        // Pre-fill phone and address from profile
        setPhone(d.buyer_phone || "");
        setAddress(d.buyer_address || "");
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Failed to load order summary.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError("");
    if (!phone.trim() || !address.trim()) {
      setError("Please fill in phone and address.");
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/place_order.php`, {
        request_id: parseInt(request_id),
        buyer_id:   user.user_id,
        phone:      phone.trim(),
        address:    address.trim(),
      }, { headers: { "Content-Type": "application/json" } });

      if (res.data.success) {
        setPlaced(true);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 size={32} className="animate-spin text-slate-300" />
    </div>
  );

  if (error && !summary) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-slate-400">
      <p className="font-bold">{error}</p>
      <button onClick={() => navigate("/purchase")}
        className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest">
        Back to Requests
      </button>
    </div>
  );

  const isTrade     = summary?.request_type === "trade";
  const itemPrice   = parseFloat(summary?.listing_price || 0);
  const quantity = parseInt(summary?.quantity || 1);
  const subtotal = itemPrice * quantity;
  const shippingFee = parseFloat(summary?.shipping_fee || 60);
  const total = subtotal + shippingFee;

  // ── SUCCESS STATE ─────────────────────────────────────────────────────────
  if (placed) return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-12 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Placed!</h2>
          <p className="text-sm font-medium text-slate-400 mt-2">
            Your COD order for <span className="text-slate-700 font-bold">{summary?.listing_title}</span> has been placed.
            The seller will prepare your item for shipment.
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-bold">Item</span>
            <span className="text-slate-700 font-black">₱{itemPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-bold">Shipping</span>
            <span className="text-slate-700 font-black">₱{shippingFee.toLocaleString()}</span>
          </div>
          <hr className="border-slate-100" />
          <div className="flex justify-between text-sm">
            <span className="text-slate-900 font-black">Total (COD)</span>
            <span className="text-[#4B99D4] font-black text-base">₱{total.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/purchase")}
            className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#4B99D4] transition-all">
            My Requests
          </button>
          <button onClick={() => navigate("/messages", {
            state: {
              listing_id:     summary.listing_id,
              listing_title:  summary.listing_title,
              listing_image:  summary.listing_image,
              other_user_id:  summary.seller_id,
              other_username: summary.seller_name,
            }
          })}
            className="flex-1 py-4 bg-[#D9E9EE] text-[#4B99D4] font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#4B99D4] hover:text-white transition-all">
            Chat Seller
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN FORM ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 font-sans">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => navigate("/purchase")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Order Summary</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isTrade ? "Trade + COD Shipping" : "Cash on Delivery"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">

        {/* Item Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Package size={12} /> Item Details
          </p>
          <div className="flex items-center gap-5">
            <img
              src={summary.listing_image}
              alt={summary.listing_title}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900">{summary.listing_title}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                Seller: <span className="text-[#4B99D4]">{summary.seller_name}</span>
              </p>
              <p className="text-xl font-black text-slate-900 mt-2">₱{itemPrice.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Quantity: {summary.quantity}</p>
            </div>
            {isTrade && (
              <div className="flex-shrink-0 bg-[#D9E9EE] rounded-xl p-2">
                <Repeat2 size={20} className="text-[#4B99D4]" />
              </div>
            )}
          </div>

          {isTrade && summary.offered_title && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4B99D4] mb-3">Your Trade Offer</p>
              <div className="flex items-center gap-4 bg-[#D9E9EE]/30 rounded-xl p-3">
                <img src={summary.offered_image} alt={summary.offered_title}
                  className="w-12 h-12 rounded-xl object-cover border border-[#D9E9EE] flex-shrink-0" />
                <div>
                  <p className="text-sm font-black text-slate-800">{summary.offered_title}</p>
                  <p className="text-xs font-bold text-[#4B99D4]">₱{parseFloat(summary.offered_price).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <MapPin size={12} /> Delivery Information
          </p>

          {/* Name — read only, from users table */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <User size={18} className="text-slate-300 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Recipient</p>
              <p className="text-sm font-bold text-slate-800">{buyerName}</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Phone */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="w-full bg-slate-50 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20 focus:bg-white border border-transparent focus:border-[#4B99D4] transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">
                Delivery Address *
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-slate-300" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No., Street, Barangay, City, Province"
                  rows={3}
                  className="w-full bg-slate-50 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20 focus:bg-white border border-transparent focus:border-[#4B99D4] transition-all resize-none"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-300 font-medium ml-1">
              Phone and address will be saved to your profile for future orders.
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <Truck size={12} /> Order Total
          </p>
           {/* NEW: Subtotal line */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">
              Subtotal ({quantity} item{quantity > 1 ? 's' : ''})
            </span>
            <span className="text-sm font-black text-slate-800">
              ₱{subtotal.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Item Price</span>
            <span className="text-sm font-black text-slate-800">₱{itemPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-bold text-slate-500">Standard Shipping</span>
              <p className="text-[10px] text-slate-300 font-medium">Guaranteed delivery in 2-3 days</p>
            </div>
            <span className="text-sm font-black text-slate-800">₱{shippingFee.toLocaleString()}</span>
          </div>
          <div className="h-px bg-slate-100 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-base font-black text-slate-900">Total</span>
            <span className="text-2xl font-black text-[#4B99D4]">₱{total.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 mt-2">
            <ShieldCheck size={16} className="text-[#4B99D4] flex-shrink-0" />
            <p className="text-[10px] font-bold text-slate-400">
              Cash on Delivery — Pay when your item arrives
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-sm hover:bg-[#4B99D4] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
        >
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
            : <><ShieldCheck size={18} /> Place Order (COD)</>
          }
        </button>

        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pb-6">
          By placing this order you agree to pay upon delivery
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;