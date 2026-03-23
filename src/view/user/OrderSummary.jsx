import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Phone, User, Package,
  Truck, ShieldCheck, CheckCircle, Loader2, Repeat2,
  AlertCircle,
} from "lucide-react";

import { BASE } from "../../viewmodel/constants";
import { useValidation, phoneMessage, addressMessage } from "../../hooks/useValidation";

// ── Status config (mirrors profile.jsx) ──────────────────────────────────────
const statusConfig = {
  phone: {
    valid:   { icon: CheckCircle, label: "VERIFIED",       color: "#10b981", border: "rgba(52,211,153,0.5)",  glow: "0 0 0 3px rgba(52,211,153,0.12)"  },
    invalid: { icon: AlertCircle, label: "INVALID FORMAT", color: "#f43f5e", border: "rgba(251,113,133,0.45)", glow: "0 0 0 3px rgba(251,113,133,0.1)" },
    empty:   null,
  },
  address: {
    valid:         { icon: CheckCircle, label: "VERIFIED",          color: "#10b981", border: "rgba(52,211,153,0.5)",   glow: "0 0 0 3px rgba(52,211,153,0.12)"  },
    too_short:     { icon: AlertCircle, label: "TOO SHORT",         color: "#f43f5e", border: "rgba(251,113,133,0.45)", glow: "0 0 0 3px rgba(251,113,133,0.1)" },
    no_letters:    { icon: AlertCircle, label: "INVALID — ADD STREET NAME", color: "#f43f5e", border: "rgba(251,113,133,0.45)", glow: "0 0 0 3px rgba(251,113,133,0.1)" },
    too_few_words: { icon: AlertCircle, label: "TOO VAGUE — ADD BARANGAY & CITY", color: "#f97316", border: "rgba(253,186,116,0.55)", glow: "0 0 0 3px rgba(249,115,22,0.08)" },
    empty:         null,
  },
};

// ── Inline validation badge ───────────────────────────────────────────────────
const ValidationBadge = ({ type, status }) => {
  const cfg = statusConfig[type]?.[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1,  y:  0 }}
      exit={{    opacity: 0,  y: -4 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-1 mt-1.5"
    >
      <Icon size={10} style={{ color: cfg.color, flexShrink: 0 }} />
      <span style={{
        fontFamily:    "'Courier New', Courier, monospace",
        fontSize:      8,
        fontWeight:    800,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        color:         cfg.color,
      }}>
        {cfg.label}
      </span>
    </motion.div>
  );
};

// ── Validated input wrapper ───────────────────────────────────────────────────
const ValidatedField = ({ type, status, children }) => {
  const cfg     = statusConfig[type]?.[status];
  const isValid = status === "valid";
  return (
    <motion.div layout className="flex-1">
      <div style={{
        borderRadius: 16,
        border:       `1.5px solid ${cfg ? cfg.border : "rgba(226,232,240,1)"}`,
        background:   isValid ? "rgba(16,185,129,0.03)" : "#f8fafc",
        transition:   "all 0.25s",
        boxShadow:    cfg?.glow || "none",
        overflow:     "hidden",
      }}>
        {children}
      </div>
      <AnimatePresence mode="wait">
        <ValidationBadge key={status} type={type} status={status} />
      </AnimatePresence>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const OrderSummary = () => {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const request_id = params.get("request_id");

  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [placed,     setPlaced]     = useState(false);
  const [error,      setError]      = useState("");
  const [buyerName,  setBuyerName]  = useState("");

  // ── Shared validation hook ─────────────────────────────────────────────────
  const {
    phone, setPhone,
    address, setAddress,
    phoneStatus, addressStatus,
    isFormValid, resetFields,
  } = useValidation();

  useEffect(() => {
    if (!user || user.role !== "user") { navigate("/login"); return; }
    if (!request_id) { navigate("/purchase"); return; }
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${BASE}/get_order_summary.php`, {
        params: { request_id, buyer_id: user.user_id },
      });
      if (res.data.success) {
        const d = res.data.data;
        setSummary(d);
        setPlaced(d.already_placed);
        const name = [d.buyer_first_name, d.buyer_last_name].filter(Boolean).join(" ") || d.buyer_name || user.username;
        setBuyerName(name);
        resetFields(d.buyer_phone || "", d.buyer_address || "");
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
    if (!isFormValid) {
      setError(
        phoneStatus   !== "valid" ? (phoneMessage(phoneStatus)   || "Invalid phone number.") :
        addressStatus !== "valid" ? (addressMessage(addressStatus) || "Address is too short.") :
        "Please fill in all fields."
      );
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

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid rgba(75,153,212,0.15)",
            borderTopColor: "#4B99D4",
          }}
        />
        <p style={{
          fontFamily:    "'Courier New', Courier, monospace",
          fontSize:      9,
          fontWeight:    700,
          color:         "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.25em",
        }}>
          LOADING ACQUISITION…
        </p>
      </div>
    </div>
  );

  if (error && !summary) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-slate-400 bg-[#F1F5F9]">
      <p className="font-bold">{error}</p>
      <button onClick={() => navigate("/purchase")}
        className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest">
        Back to Requests
      </button>
    </div>
  );

  const isTrade     = summary?.request_type === "trade";
  const itemPrice   = parseFloat(summary?.listing_price || 0);
  const quantity    = parseInt(summary?.quantity || 1);
  const subtotal    = itemPrice * quantity;
  const shippingFee = parseFloat(summary?.shipping_fee || 60);
  const total       = subtotal + shippingFee;

  // ── Success State — Certificate of Completion ──────────────────────────────
  if (placed) return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1,  y:  0, scale: 1    }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:   "#ffffff",
          borderRadius: 36,
          padding:      "52px 44px",
          maxWidth:     480,
          width:        "100%",
          textAlign:    "center",
          // Layered white-on-white shadow for certificate look
          boxShadow:    "0 0 0 1px rgba(75,153,212,0.08), 0 8px 32px rgba(15,23,42,0.08), 0 32px 80px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,1)",
          border:       "1px solid rgba(75,153,212,0.1)",
          position:     "relative",
          overflow:     "hidden",
        }}
      >
        {/* Watermark grid */}
        <div style={{
          position:        "absolute",
          inset:           0,
          backgroundImage: "linear-gradient(rgba(75,153,212,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.025) 1px, transparent 1px)",
          backgroundSize:  "28px 28px",
          pointerEvents:   "none",
          borderRadius:    36,
        }} />

        {/* Certificate header label */}
        <p style={{
          fontFamily:    "'Courier New', Courier, monospace",
          fontSize:      8,
          fontWeight:    700,
          color:         "#4B99D4",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginBottom:  20,
          opacity:       0.8,
        }}>
          — CERTIFICATE OF ACQUISITION —
        </p>

        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ boxShadow: "0 4px 16px rgba(16,185,129,0.15)" }}
        >
          <CheckCircle size={32} className="text-emerald-400" />
        </div>

        <h2 style={{
          fontSize:      28,
          fontWeight:    900,
          fontStyle:     "italic",
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color:         "#0f172a",
          marginBottom:  10,
        }}>
          Order Placed!
        </h2>
        <p className="text-sm font-medium text-slate-400 mb-8">
          Your COD order for <span className="text-slate-700 font-bold">{summary?.listing_title}</span> has been confirmed.
          The seller will prepare your item.
        </p>

        {/* Mini receipt */}
        <div style={{
          background:   "#f8fafc",
          borderRadius: 20,
          padding:      "20px 24px",
          textAlign:    "left",
          marginBottom: 28,
          border:       "1px solid rgba(75,153,212,0.08)",
        }}>
          {[
            { label: "Item", value: `₱${itemPrice.toLocaleString()}` },
            { label: "Shipping", value: `₱${shippingFee.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm mb-2">
              <span className="text-slate-400 font-bold">{label}</span>
              <span className="text-slate-700 font-black">{value}</span>
            </div>
          ))}
          <div className="h-px bg-slate-200 my-3" />
          <div className="flex justify-between items-baseline">
            <span className="text-slate-900 font-black text-sm">Total (COD)</span>
            <span style={{ fontSize: 26, fontWeight: 900, fontStyle: "italic", color: "#4B99D4", letterSpacing: "-0.03em" }}>
              ₱{total.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate("/purchase")}
            className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#4B99D4] transition-all">
            My Requests
          </button>
          <button onClick={() => navigate("/messages", {
            state: { other_user_id: summary.seller_id, other_username: summary.seller_name },
          })}
            className="flex-1 py-4 bg-[#D9E9EE] text-[#4B99D4] font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#4B99D4] hover:text-white transition-all">
            Chat Seller
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 font-sans">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => navigate("/purchase")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="text-right">
          <h1 style={{
            fontSize:      24,
            fontWeight:    900,
            fontStyle:     "italic",
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color:         "#0f172a",
            margin:        0,
          }}>
            Order Summary
          </h1>
          <p style={{
            fontFamily:    "'Courier New', Courier, monospace",
            fontSize:      9,
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color:         "#94a3b8",
            margin:        "2px 0 0",
          }}>
            {isTrade ? "Trade + COD Shipping" : "Cash on Delivery"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">

        {/* ── Item Card ── */}
        <div style={{
          background:   "#ffffff",
          borderRadius: 32,
          border:       "1px solid rgba(75,153,212,0.08)",
          boxShadow:    "0 2px 16px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,1)",
          padding:      24,
        }}>
          <p style={{
            fontFamily:    "'Courier New', Courier, monospace",
            fontSize:      9,
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color:         "#94a3b8",
            marginBottom:  16,
            display:       "flex",
            alignItems:    "center",
            gap:           6,
          }}>
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
              <p className="text-xs text-slate-400 mt-1">Qty: {summary.quantity}</p>
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

        {/* ── Delivery Information ── */}
        <div style={{
          background:   "#ffffff",
          borderRadius: 32,
          border:       "1px solid rgba(75,153,212,0.08)",
          boxShadow:    "0 2px 16px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,1)",
          padding:      24,
        }}>
          <p style={{
            fontFamily:    "'Courier New', Courier, monospace",
            fontSize:      9,
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color:         "#94a3b8",
            marginBottom:  16,
            display:       "flex",
            alignItems:    "center",
            gap:           6,
          }}>
            <MapPin size={12} /> Delivery Information
          </p>

          {/* Recipient (read-only) */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
            <User size={18} className="text-slate-300 flex-shrink-0" />
            <div>
              <p style={{
                fontFamily:    "'Courier New', Courier, monospace",
                fontSize:      8,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color:         "#94a3b8",
                marginBottom:  2,
              }}>
                Recipient
              </p>
              <p className="text-sm font-bold text-slate-800">{buyerName}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Phone */}
            <motion.div layout>
              <label style={{
                fontFamily:    "'Courier New', Courier, monospace",
                fontSize:      8,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color:         "#94a3b8",
                display:       "block",
                marginBottom:  6,
              }}>
                Phone Number *
              </label>
              <div className="relative flex items-center gap-3">
                <Phone
                  size={16}
                  className="flex-shrink-0"
                  style={{ color: phoneStatus === "valid" ? "#10b981" : phoneStatus === "invalid" ? "#f43f5e" : "#cbd5e1" }}
                />
                <ValidatedField type="phone" status={phoneStatus}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                    style={{
                      width:      "100%",
                      padding:    "12px 16px",
                      background: "transparent",
                      border:     "none",
                      outline:    "none",
                      fontSize:   13,
                      fontWeight: 600,
                      color:      "#0f172a",
                    }}
                  />
                </ValidatedField>
              </div>
            </motion.div>

            {/* Address */}
            <motion.div layout>
              <label style={{
                fontFamily:    "'Courier New', Courier, monospace",
                fontSize:      8,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color:         "#94a3b8",
                display:       "block",
                marginBottom:  6,
              }}>
                Delivery Address *
              </label>
              <div className="relative flex items-start gap-3">
                <MapPin
                  size={16}
                  className="flex-shrink-0 mt-3"
                  style={{ color: addressStatus === "valid" ? "#10b981" : addressStatus === "too_short" ? "#f43f5e" : "#cbd5e1" }}
                />
                <ValidatedField type="address" status={addressStatus}>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="House No., Street, Barangay, City, Province"
                    rows={3}
                    style={{
                      width:      "100%",
                      padding:    "12px 16px",
                      background: "transparent",
                      border:     "none",
                      outline:    "none",
                      fontSize:   13,
                      fontWeight: 600,
                      color:      "#0f172a",
                      resize:     "none",
                    }}
                  />
                </ValidatedField>
              </div>
            </motion.div>

            <p style={{
              fontFamily:    "'Courier New', Courier, monospace",
              fontSize:      8,
              fontWeight:    600,
              color:         "#cbd5e1",
              letterSpacing: "0.08em",
              paddingLeft:   4,
            }}>
              Phone and address will be saved to your profile for future orders.
            </p>
          </div>
        </div>

        {/* ── Certificate of Acquisition — Total ── */}
        <div style={{
          background:   "#ffffff",
          borderRadius: 32,
          border:       "1px solid rgba(75,153,212,0.08)",
          // White-on-white layered shadow — the "certificate" look
          boxShadow:    "0 0 0 1px rgba(75,153,212,0.06), 0 4px 24px rgba(15,23,42,0.07), 0 16px 60px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,1)",
          padding:      24,
          position:     "relative",
          overflow:     "hidden",
        }}>
          {/* Watermark grid */}
          <div style={{
            position:        "absolute",
            inset:           0,
            backgroundImage: "linear-gradient(rgba(75,153,212,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.02) 1px, transparent 1px)",
            backgroundSize:  "24px 24px",
            pointerEvents:   "none",
          }} />

          <p style={{
            fontFamily:    "'Courier New', Courier, monospace",
            fontSize:      9,
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color:         "#94a3b8",
            marginBottom:  16,
            display:       "flex",
            alignItems:    "center",
            gap:           6,
            position:      "relative",
          }}>
            <Truck size={12} /> Order Total
          </p>

          {/* Line items */}
          <div style={{ position: "relative", marginBottom: 8 }}>
            {[
              { label: `Subtotal (${quantity} item${quantity > 1 ? "s" : ""})`, value: `₱${subtotal.toLocaleString()}` },
              { label: "Item Price",         value: `₱${itemPrice.toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-500">{label}</span>
                <span className="text-sm font-black text-slate-800">{value}</span>
              </div>
            ))}

            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-sm font-bold text-slate-500">Standard Shipping</span>
                <p style={{
                  fontFamily:    "'Courier New', Courier, monospace",
                  fontSize:      8,
                  color:         "#cbd5e1",
                  letterSpacing: "0.08em",
                  marginTop:     2,
                }}>
                  Guaranteed delivery in 2–3 days
                </p>
              </div>
              <span className="text-sm font-black text-slate-800">₱{shippingFee.toLocaleString()}</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(75,153,212,0.15), transparent)", margin: "16px 0" }} />

          {/* TOTAL — massive italic */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", position: "relative", marginBottom: 20 }}>
            <div>
              <p style={{
                fontFamily:    "'Courier New', Courier, monospace",
                fontSize:      8,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color:         "#94a3b8",
                marginBottom:  4,
              }}>
                Total Due on Delivery
              </p>
              <span style={{
                fontSize:      13,
                fontWeight:    900,
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                color:         "#0f172a",
              }}>
                TOTAL
              </span>
            </div>
            <span style={{
              fontSize:      48,
              fontWeight:    900,
              fontStyle:     "italic",
              letterSpacing: "-0.04em",
              color:         "#4B99D4",
              lineHeight:    1,
            }}>
              ₱{total.toLocaleString()}
            </span>
          </div>

          {/* ── Security Protocol / COD Badge ── */}
          <motion.div
            style={{
              background:    "#4B99D4",
              borderRadius:  18,
              padding:       "14px 18px",
              display:       "flex",
              alignItems:    "center",
              gap:           12,
              position:      "relative",
              overflow:      "hidden",
            }}
          >
            {/* Subtle inner grid */}
            <div style={{
              position:        "absolute",
              inset:           0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize:  "16px 16px",
              borderRadius:    18,
              pointerEvents:   "none",
            }} />

            {/* Pulsing shield icon */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position:     "absolute",
                  inset:        -6,
                  borderRadius: "50%",
                  background:   "rgba(255,255,255,0.25)",
                }}
              />
              <ShieldCheck size={22} color="#ffffff" style={{ position: "relative" }} />
            </div>

            <div style={{ position: "relative" }}>
              <p style={{
                fontFamily:    "'Courier New', Courier, monospace",
                fontSize:      8,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color:         "rgba(255,255,255,0.7)",
                marginBottom:  2,
              }}>
                Security Protocol — COD
              </p>
              <p style={{
                fontSize:   12,
                fontWeight: 800,
                color:      "#ffffff",
                lineHeight: 1.3,
              }}>
                Cash on Delivery — Pay only when your item arrives safely.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1,  y:  0 }}
              exit={{    opacity: 0          }}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3"
            >
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-xs font-bold text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Place Order button */}
        <motion.button
          onClick={handlePlaceOrder}
          disabled={submitting}
          whileTap={{ scale: 0.98 }}
          style={{
            width:         "100%",
            padding:       "20px 0",
            background:    isFormValid ? "#0f172a" : "#cbd5e1",
            color:         "#ffffff",
            fontWeight:    900,
            borderRadius:  24,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontSize:      13,
            border:        "none",
            cursor:        isFormValid && !submitting ? "pointer" : "not-allowed",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"center",
            gap:           8,
            boxShadow:     isFormValid ? "0 8px 32px rgba(15,23,42,0.2)" : "none",
            transition:    "background 0.2s, box-shadow 0.2s",
          }}
        >
          {submitting ? (
            <><Loader2 size={18} className="animate-spin" /> Placing Order…</>
          ) : (
            <><ShieldCheck size={18} /> Place Order (COD)</>
          )}
        </motion.button>

        <p style={{
          textAlign:     "center",
          fontFamily:    "'Courier New', Courier, monospace",
          fontSize:      8,
          fontWeight:    600,
          color:         "#cbd5e1",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          paddingBottom: 24,
        }}>
          By placing this order you agree to pay upon delivery
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;