/**
 * GuestGate.jsx — Trade & Talk
 * Improved: stronger contrast on preview items, crisper typography,
 * solid card background, consistent design tokens with Login/Register
 *
 * USAGE in App.jsx:
 *   <Route path="/marketplace" element={<GuestGate page="Marketplace" />} />
 *   <Route path="/community"   element={<GuestGate page="Community" />} />
 *   <Route path="/safety"      element={<GuestGate page="Safety" />} />
 */

import React, { useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  Repeat, ArrowRight, Lock, ShieldCheck,
  Package, Users, LogIn, UserPlus,
} from "lucide-react";

// ─── PAGE METADATA ─────────────────────────────────────────────────────────────
const PAGE_META = {
  Marketplace: {
    icon: <Package size={24} />,
    headline: "The Collector's Marketplace",
    sub: "Browse thousands of verified listings — trading cards, figures, sneakers, and more.",
    preview: [
      { label: "🃏 Charizard Holo 1st Ed.", sub: "Trading Cards · PSA 10",  price: "₱48,000", badge: "🔥 Hot" },
      { label: "👟 Jordan 1 Retro High",   sub: "Sneakers · DS",            price: "₱12,500", badge: "👟 Grail" },
      { label: "💎 Mewtwo PSA 10",          sub: "Trading Cards · Mint",     price: "₱90,000", badge: "💎 Elite" },
      { label: "🤖 RX-78-2 MG 1/100",      sub: "Action Figures · Sealed",  price: "₱3,200",  badge: "✨ New" },
    ],
  },
  Community: {
    icon: <Users size={24} />,
    headline: "The Collector's Circle",
    sub: "Connect with 12,400+ collectors across the Philippines. Share, discuss, and grow.",
    preview: [
      { label: "💬 \"Found my grail after 3 years!\"",  sub: "Carlo M. · Manila",    price: "⭐⭐⭐⭐⭐",   badge: "Review" },
      { label: "📣 New drop: Jordan 1 Travis Scott",   sub: "Community · Just Now", price: "12 replies", badge: "Hot" },
      { label: "🏆 Top Collector of the Month",         sub: "Rina S. · Cebu",       price: "5 trades",   badge: "Award" },
      { label: "⭐ Trust Elite badge unlocked",          sub: "Jm Dela Cruz · Davao", price: "Verified",   badge: "New" },
    ],
  },
  Safety: {
    icon: <ShieldCheck size={24} />,
    headline: "Trade With Confidence",
    sub: "Every listing is admin-approved. Learn how we keep the platform scam-free.",
    preview: [
      { label: "✅ Admin-verified listings",      sub: "All items reviewed within 24h", price: "Active",  badge: "Policy" },
      { label: "🔒 Secure DM transactions",       sub: "End-to-end encrypted chat",    price: "Enabled", badge: "Shield" },
      { label: "⚠️ Report & review system",       sub: "Community-driven moderation",  price: "24/7",    badge: "Safety" },
      { label: "🛡️ Collector protection policy",  sub: "Dispute resolution center",    price: "Free",    badge: "Protect" },
    ],
  },
};

// ─── MAGNETIC BUTTON ──────────────────────────────────────────────────────────
const MagneticBtn = ({ children, onClick, style = {} }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 28 });
  const sy = useSpring(y, { stiffness: 400, damping: 28 });
  return (
    <motion.button
      ref={ref} onClick={onClick}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={e => {
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.2);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const GuestGate = ({ page = "Marketplace" }) => {
  void motion;
  const navigate = useNavigate();
  const meta = PAGE_META[page] || PAGE_META.Marketplace;
  let hasSession = false;
  try {
    hasSession = !!sessionStorage.getItem("user");
  } catch {
    hasSession = false;
  }
  useEffect(() => {
    if (hasSession) {
      navigate("/home", { replace: true });
    }
  }, [hasSession, navigate]);

  if (hasSession) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24, background: "#F6FAFD",
        position: "relative", overflow: "hidden", fontFamily: "sans-serif",
      }}
    >
      {/* ── Atmospheric Background ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(75,153,212,0.12) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-15%", left: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(75,153,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.05) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }} />
        <div style={{
          position: "absolute", top: "-10%", right: "30%", width: 1, height: "130%",
          background: "linear-gradient(180deg, transparent 0%, rgba(75,153,212,0.1) 30%, rgba(75,153,212,0.1) 70%, transparent 100%)",
          transform: "rotate(15deg)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 740 }}>

        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ marginBottom: 28 }}>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 10, fontWeight: 900, textTransform: "uppercase",
            letterSpacing: "0.2em", color: "#94a3b8", textDecoration: "none",
          }}>
            ← Back to Home
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            padding: 7, borderRadius: 10,
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            boxShadow: "0 4px 12px rgba(15,23,42,0.2)",
          }}>
            <Repeat size={16} color="#ffffff" />
          </div>
          <span style={{
            fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em",
            textTransform: "uppercase", fontStyle: "italic", color: "#0f172a",
          }}>
            Trade<span style={{ color: "#4B99D4" }}>&</span>Talk
          </span>
        </motion.div>

        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "#ffffff",
            borderRadius: 28, overflow: "hidden",
            border: "1px solid rgba(75,153,212,0.14)",
            boxShadow: "0 4px 6px rgba(15,23,42,0.04), 0 20px 50px rgba(75,153,212,0.09)",
          }}
        >
         

          <div style={{ padding: "36px 40px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, alignItems: "start" }}>

              {/* ── Left: Gate message ── */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                  <div style={{
                    padding: 12, borderRadius: 16,
                    background: "rgba(75,153,212,0.08)",
                    border: "1.5px solid rgba(75,153,212,0.14)",
                    color: "#4B99D4", display: "flex",
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 999,
                    fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    background: "rgba(239,68,68,0.06)",
                    color: "#dc2626",
                    border: "1px solid rgba(239,68,68,0.18)",
                  }}>
                    <Lock size={9} /> Members Only
                  </div>
                </div>

                <h2 style={{
                  fontSize: 26, fontWeight: 900, textTransform: "uppercase",
                  fontStyle: "italic", letterSpacing: "-0.03em",
                  color: "#0f172a", lineHeight: 1.05, margin: "0 0 14px",
                }}>
                  {meta.headline}
                </h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", lineHeight: 1.65, margin: "0 0 28px" }}>
                  {meta.sub}{" "}
                  <span style={{ fontWeight: 900, color: "#0f172a" }}>Log in or register free</span>{" "}
                  to access this section.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                  <MagneticBtn
                    onClick={() => navigate("/login")}
                    style={{
                      flex: "1 1 120px", display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 8,
                      padding: "13px 20px", borderRadius: 14,
                      fontWeight: 900, textTransform: "uppercase",
                      letterSpacing: "0.15em", fontSize: 11,
                      color: "#ffffff", border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, #1e293b 100%)",
                      boxShadow: "0 8px 28px rgba(75,153,212,0.35)",
                    }}
                  >
                    
                    Login
                    
                  </MagneticBtn>

                  <MagneticBtn
                    onClick={() => navigate("/register")}
                    style={{
                      flex: "1 1 120px", display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 8,
                      padding: "13px 20px", borderRadius: 14,
                      fontWeight: 900, textTransform: "uppercase",
                      letterSpacing: "0.15em", fontSize: 11,
                      color: "#0f172a", cursor: "pointer",
                      background: "#ffffff",
                      border: "2px solid #1e293b",
                      boxShadow: "0 2px 10px rgba(15,23,42,0.08)",
                    }}
                  >
                    <UserPlus size={13} />
                    Get started
                  </MagneticBtn>
                </div>

                {/* Social proof */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", marginLeft: 0 }}>
                    {["CM","RS","JD","AK"].map((init, i) => (
                      <div key={init} style={{
                        width: 26, height: 26, borderRadius: "50%",
                        border: "2px solid #ffffff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#ffffff", fontSize: 8, fontWeight: 900,
                        background: "linear-gradient(135deg, #4B99D4, #1e293b)",
                        marginLeft: i > 0 ? -8 : 0,
                        position: "relative", zIndex: 4 - i,
                      }}>
                        {init}
                      </div>
                    ))}
                  </div>
                  <p style={{
                    fontSize: 10, fontWeight: 800, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: "0.18em", margin: 0,
                  }}>
                    12,400+ collectors inside
                  </p>
                </div>
              </div>

              {/* ── Right: Blurred preview ── */}
              <div style={{ position: "relative" }}>
                <p style={{
                  fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                  letterSpacing: "0.22em", color: "#94a3b8",
                  margin: "0 0 14px 2px",
                }}>
                  Preview
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {meta.preview.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1 - i * 0.12, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                      style={{
                        borderRadius: 14, padding: "13px 16px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: i === 0 ? "#ffffff" : `rgba(255,255,255,${0.85 - i * 0.12})`,
                        border: `1px solid ${i === 0 ? "rgba(75,153,212,0.18)" : "rgba(75,153,212,0.08)"}`,
                        boxShadow: i === 0 ? "0 2px 12px rgba(75,153,212,0.08)" : "none",
                        filter: i > 1 ? `blur(${(i - 1) * 2.5}px)` : "none",
                        userSelect: i > 1 ? "none" : "auto",
                      }}
                    >
                      <div>
                        <p style={{
                          fontSize: 12, fontWeight: 800, color: "#0f172a",
                          margin: "0 0 3px", lineHeight: 1.3,
                        }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", margin: 0 }}>
                          {item.sub}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 900, color: "#4B99D4", margin: "0 0 2px" }}>
                          {item.price}
                        </p>
                        <p style={{
                          fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                          letterSpacing: "0.15em", color: "#94a3b8", margin: 0,
                        }}>
                          {item.badge}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Fade + lock overlay */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
                  borderRadius: "0 0 14px 14px", pointerEvents: "none",
                  background: "linear-gradient(0deg, rgba(255,255,255,0.98) 0%, transparent 100%)",
                }} />
                <div style={{
                  position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                  letterSpacing: "0.18em", color: "rgba(75,153,212,0.55)",
                  whiteSpace: "nowrap",
                }}>
                  <Lock size={9} /> Login to see all
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Footer badge */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{
            marginTop: 20, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}
        >
          <ShieldCheck size={11} color="#cbd5e1" />
          <p style={{
            fontSize: 10, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.2em", margin: 0,
          }}>
            Trade<span style={{ color: "#4B99D4" }}>&</span>Talk · Members Only
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GuestGate;
