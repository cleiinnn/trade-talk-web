/**
 * Home.jsx — Trade & Talk Landing Page
 * ─────────────────────────────────────
 * MASTER REFACTOR: "Collector's Vault" premium edition
 * Palette: Arctic White · Ice Steel Blue (#4B99D4) · Deep Navy · Metallic Silver
 * Inspired by the F1 helmet aesthetic — high-contrast, sharp, technical luxury
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Repeat, ArrowRight, ShieldCheck, Zap, MessageCircle,
  Star, Globe, Users, TrendingUp, Package, Award,
  ChevronRight, Sparkles, Heart, LogOut, LayoutDashboard,
  ChevronDown, Search, Bell, Menu, X, ArrowUpRight,
} from "lucide-react";

import {
  CATEGORIES, MARQUEE_ITEMS, STEPS, TESTIMONIALS,
  DEFAULT_STATS, STATS_META,
} from "./styles/Homeconfig";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_BASE_URL + "/get_stats.php";
const COUNTER_DURATION = 1800;
const ICON_MAP = { Users, Package, MessageCircle, Award, TrendingUp };

// ─── HOOKS ─────────────────────────────────────────────────────────────────────
const useCounter = (target, duration = COUNTER_DURATION, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let raf, startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
};

const useStats = () => {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 8000);
    (async () => {
      try {
        const res = await fetch(API_URL, { signal: ctrl.signal, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        setStats({
          users:    Number(d.users    ?? d.total_users    ?? 0),
          listings: Number(d.listings ?? d.total_listings ?? 0),
          trades:   Number(d.trades   ?? d.total_trades   ?? 0),
        });
      } catch {
        setStats({ users: 12400, listings: 3800, trades: 9200 });
      } finally {
        clearTimeout(tid);
        setLoading(false);
      }
    })();
    return () => { clearTimeout(tid); ctrl.abort(); };
  }, []);
  return { stats, loading };
};

const useAuth = () => {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      sessionStorage.removeItem("user");
      return null;
    }
  });
  const logout = useCallback(() => { sessionStorage.removeItem("user"); setUser(null); }, []);
  return { user, logout };
};

const useWelcomeBanner = () => {
  const [show, setShow] = useState(() => {
    try { return sessionStorage.getItem("showWelcome") === "true"; } catch { return false; }
  });
  const dismiss = useCallback(() => { sessionStorage.removeItem("showWelcome"); setShow(false); }, []);
  return { show, dismiss };
};

// ─── ANIMATION VARIANTS ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay } },
});

const stagger = (staggerDelay = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: staggerDelay, delayChildren: 0.1 } },
});

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── MAGNETIC BUTTON ───────────────────────────────────────────────────────────
// style prop is spread AFTER x/y so backgrounds & borders always apply
const MagneticButton = ({ children, className, onClick, style = {}, to, type }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 28 });
  const sy = useSpring(y, { stiffness: 400, damping: 28 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.22);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  if (to) {
    return (
      <motion.div ref={ref} style={{ x: sx, y: sy, ...style }} onMouseMove={onMove} onMouseLeave={onLeave}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link to={to} className={className}>{children}</Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      ref={ref} type={type} onClick={onClick}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// ─── GLASS CARD ────────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.9)",
      boxShadow: "0 8px 40px rgba(75,153,212,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
const StatCard = ({ meta, value, animate }) => {
  const Icon = ICON_MAP[meta.iconKey];
  const count = useCounter(value, COUNTER_DURATION, animate);

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -4, boxShadow: "0 20px 50px rgba(75,153,212,0.15)" }}
      className="relative overflow-hidden rounded-3xl p-8 group cursor-default"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(217,233,238,0.5) 100%)",
        border: "1px solid rgba(75,153,212,0.12)",
        boxShadow: "0 4px 20px rgba(75,153,212,0.06)",
      }}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(75,153,212,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "rgba(75,153,212,0.1)" }}
        >
          <Icon size={18} style={{ color: "#4B99D4" }} />
        </div>
        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-[#4B99D4] transition-colors" />
      </div>
      <p className="text-4xl font-black tracking-tighter text-slate-900 mb-1">
        {count.toLocaleString()}<span style={{ color: "#4B99D4" }}>{meta.suffix}</span>
      </p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{meta.label}</p>
    </motion.div>
  );
};

// ─── MARQUEE STRIP ─────────────────────────────────────────────────────────────
const MarqueeStrip = () => {
  const navigate = useNavigate();
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  const BADGE_COLORS = {
    "🔥 Hot":    { bg: "rgba(251,146,60,0.12)", text: "#f97316", border: "rgba(251,146,60,0.2)" },
    "✨ New":    { bg: "rgba(75,153,212,0.1)",  text: "#4B99D4", border: "rgba(75,153,212,0.2)" },
    "👟 Grail": { bg: "rgba(244,63,94,0.1)",   text: "#f43f5e", border: "rgba(244,63,94,0.2)" },
    "📚 Rare":   { bg: "rgba(139,92,246,0.1)",  text: "#8b5cf6", border: "rgba(139,92,246,0.2)" },
    "💎 Elite":  { bg: "rgba(15,23,42,0.08)",   text: "#334155", border: "rgba(15,23,42,0.15)" },
    "🤖 Vintage":{ bg: "rgba(16,185,129,0.1)",  text: "#10b981", border: "rgba(16,185,129,0.2)" },
  };

  return (
    <div
      className="py-5 overflow-hidden relative"
      style={{ background: "linear-gradient(90deg, #f0f7fd 0%, #e8f3fb 50%, #f0f7fd 100%)", borderTop: "1px solid rgba(75,153,212,0.1)", borderBottom: "1px solid rgba(75,153,212,0.1)" }}
    >
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #f0f7fd, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(-90deg, #f0f7fd, transparent)" }} />

      <style id="tt-marquee-kf">{`
        @keyframes tt-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tt-marquee { animation: tt-marquee 32s linear infinite; }
        .tt-marquee:hover { animation-play-state: paused; }
      `}</style>

      <div className="tt-marquee flex gap-3 w-max">
        {doubled.map((item, i) => {
          const badge = BADGE_COLORS[item.badge] || BADGE_COLORS["✨ New"];
          return (
            <motion.div
              key={`${item.slug}-${i}`}
              onClick={() => navigate(`/listing/${item.slug}`)}
              whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(75,153,212,0.15)" }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 cursor-pointer rounded-2xl px-5 py-3.5 flex items-center gap-4 min-w-[210px]"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(75,153,212,0.1)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: badge.bg, border: `1px solid ${badge.border}` }}
              >
                {item.badge.split(" ")[0]}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: badge.text }}>
                  {item.badge.split(" ").slice(1).join(" ")}
                </p>
                <p className="text-sm font-black text-slate-800 leading-tight">{item.name}</p>
                <p className="text-xs font-black mt-0.5" style={{ color: "#4B99D4" }}>{item.price}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── WELCOME BANNER ────────────────────────────────────────────────────────────
const WelcomeBanner = ({ onDismiss }) => {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -80 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-24 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto max-w-2xl w-full px-6 py-4 rounded-2xl flex items-center gap-4"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(75,153,212,0.25)",
            boxShadow: "0 20px 60px rgba(75,153,212,0.15)",
          }}
        >
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(75,153,212,0.1)" }}>
            <Sparkles size={18} style={{ color: "#4B99D4" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-slate-900">Welcome to Trade & Talk! 🎉</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">You're in the circle. Start hunting.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { onDismiss(); navigate("/listing/new"); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
              style={{ background: "linear-gradient(135deg, #4B99D4, #2563eb)" }}>
              List an Item <ArrowRight size={12} />
            </button>
            <button onClick={onDismiss} className="text-slate-300 hover:text-slate-600 transition-colors ml-1">
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── NAV AUTH BLOCK ────────────────────────────────────────────────────────────
const NavAuthBlock = ({ user, logout }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user) return (
    <div className="flex items-center gap-3">
      <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
        Login
      </Link>
      <MagneticButton
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all"
        style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: "0 4px 14px rgba(15,23,42,0.25)" }}
        onClick={() => navigate("/register")}
      >
        Get Started
      </MagneticButton>
    </div>
  );

  const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ME";

  return (
    <div className="flex items-center gap-3 relative" ref={menuRef}>
      <MagneticButton
        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white"
        style={{ background: "linear-gradient(135deg, #4B99D4, #2563eb)", boxShadow: "0 4px 14px rgba(75,153,212,0.3)" }}
        onClick={() => navigate("/dashboard")}
      >
        <LayoutDashboard size={14} /> Dashboard
      </MagneticButton>

      <button
        onClick={() => setMenuOpen(v => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
        style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(75,153,212,0.15)", backdropFilter: "blur(8px)" }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black"
          style={{ background: "linear-gradient(135deg, #4B99D4, #1e293b)" }}>{initials}</div>
        <span className="hidden sm:block text-xs font-black text-slate-700 max-w-[80px] truncate">{user.name ?? user.email}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.18 }}
            className="absolute top-14 right-0 w-52 rounded-2xl overflow-hidden z-50"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(75,153,212,0.12)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(75,153,212,0.08)" }}>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Signed in as</p>
              <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{user.email ?? user.name}</p>
            </div>
            <button onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">
              <LayoutDashboard size={14} style={{ color: "#4B99D4" }} /> Go to Dashboard
            </button>
            <button onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 transition-colors"
              style={{ borderTop: "1px solid rgba(75,153,212,0.08)" }}>
              <LogOut size={14} /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── FLOATING HERO CARD ────────────────────────────────────────────────────────
const FloatingHeroCard = ({ item, delay, style }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, rotate: 0, boxShadow: "0 30px 60px rgba(75,153,212,0.2)" }}
      onClick={() => navigate(`/listing/${item.slug}`)}
      className="absolute cursor-pointer rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.95)",
        boxShadow: "0 16px 40px rgba(75,153,212,0.12)",
        padding: "14px 18px",
        width: 200,
        ...style,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(75,153,212,0.12), rgba(37,99,235,0.08))", border: "1px solid rgba(75,153,212,0.15)" }}>
          {item.badge.split(" ")[0]}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#4B99D4] mb-0.5">
            {item.badge.split(" ").slice(1).join(" ")}
          </p>
          <p className="text-xs font-black text-slate-800 leading-tight">{item.name}</p>
          <p className="text-[10px] font-black text-[#4B99D4] mt-0.5">{item.price}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── NEW "ABOUT" SECTION ───────────────────────────────────────────────────────
const AboutSection = () => {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-12"
      >
        <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-4"
          style={{ color: "#4B99D4", background: "rgba(75,153,212,0.08)", border: "1px solid rgba(75,153,212,0.15)" }}>
          Our Mission
        </span>
        <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-8">
          Why Trade&Talk?
        </h3>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left side – problem statement */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="p-1 inline-block rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest">
            The Problem
          </div>
          <p className="text-lg text-slate-600 leading-relaxed">
            Hobby collectors often rely on fragmented online platforms or informal groups to buy, sell, and trade items. These environments are prone to scams, fake sellers, and lack of accountability. Communication is limited, and communities are often scattered, making it difficult to build trust and maintain accurate transaction records.
          </p>
        </motion.div>

        {/* Right side – solution */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="p-1 inline-block rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest">
            Our Solution
          </div>
          <p className="text-lg text-slate-600 leading-relaxed">
            The Trade & Talk system addresses these issues by providing a <span className="font-black text-slate-900">secure, centralized, and community-driven marketplace</span> with integrated communication and community features. Every listing is verified, every trader is real, and every transaction is protected.
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            {["🔒 Admin‑Approved", "💬 Built‑in Chat", "👥 Collector Groups"].map((tag) => (
              <span key={tag} className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-black">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const Home = () => {
  void motion;
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useStats();
  const { user, logout } = useAuth();
  const { show: showWelcome, dismiss: dismissWelcome } = useWelcomeBanner();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const stepsRef = useRef(null);
  const stepsInView = useInView(stepsRef, { once: true, amount: 0.2 });
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const categoriesRef = useRef(null);
  const categoriesInView = useInView(categoriesRef, { once: true, amount: 0.2 });
  const testimonialsRef = useRef(null);
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const OnboardingSteps = () => (
    <motion.div 
      variants={stagger(0.2)} 
      initial="hidden" 
      whileInView="visible" 
      className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 py-20"
    >
      {[
        { icon: Search, title: "The Hunt", desc: "Use the Grail Search to find rare cards, figures, and collectibles." },
        { icon: Repeat, title: "Fair Trade", desc: "Our 'Talk & Trade' system ensures both parties agree before a deal is locked." },
        { icon: ShieldCheck, title: "Verified", desc: "Every collector in the circle is verified for safe and secure swapping." }
      ].map((step, i) => (
        <motion.div key={i} variants={fadeUp(i * 0.1)} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#D9E9EE] flex items-center justify-center mb-6">
            <step.icon size={24} className="text-[#4B99D4]" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-2">{step.title}</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">{step.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div className="min-h-screen font-sans text-slate-900 overflow-x-hidden" style={{ background: "#F6FAFD" }}>

      {showWelcome && <WelcomeBanner onDismiss={dismissWelcome} />}

      {/* ── NAVIGATION ──────────────────────────────────────────────────────── */}
      <motion.nav
        className="sticky top-0 z-50 flex h-18 items-center justify-between px-6 md:px-10 transition-all duration-300"
        style={{
          height: 72,
          background: scrolled ? "rgba(246,250,253,0.92)" : "rgba(246,250,253,0.7)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(75,153,212,0.12)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(75,153,212,0.06)" : "none",
        }}
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="p-1.5 rounded-lg"
            style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", boxShadow: "0 4px 12px rgba(15,23,42,0.25)" }}
          >
            <Repeat size={18} className="text-white" />
          </motion.div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
            Trade<span style={{ color: "#4B99D4" }}>&</span>Talk
          </span>
        </Link>

        {/* Centre nav – removed How It Works link */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Marketplace", to: "/marketplace" },
            { label: "Community",   to: "/community" },
            { label: "Safety",      to: "/safety" },
          ].map(({ label, to }) => (
            <Link key={label} to={to}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-white/60 transition-all">
              {label}
            </Link>
          ))}
          {/* The How It Works button is removed */}
        </div>

        {/* Auth + mobile menu */}
        <div className="flex items-center gap-3">
          <NavAuthBlock user={user} logout={logout} />
          <button onClick={() => setMobileNavOpen(v => !v)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/60 transition-all">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="md:hidden sticky top-[72px] z-40 overflow-hidden"
            style={{ background: "rgba(246,250,253,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(75,153,212,0.1)" }}
          >
            {[
              { label: "Marketplace", to: "/marketplace" },
              { label: "Community", to: "/community" },
              { label: "Safety", to: "/safety" },
            ].map(({ label, to }) => (
              <Link key={label} to={to} onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-[#4B99D4] border-b border-slate-100 transition-colors">
                <ChevronRight size={14} /> {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28">
        {/* Atmospheric background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main gradient */}
          <div style={{
            background: "radial-gradient(ellipse 80% 60% at 60% 30%, rgba(75,153,212,0.1) 0%, transparent 70%)",
            position: "absolute", inset: 0,
          }} />
          {/* Grid */}
          <div style={{
            backgroundImage: "linear-gradient(rgba(75,153,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.06) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            position: "absolute", inset: 0, opacity: 1,
          }} />
          {/* Diagonal accent line */}
          <div style={{
            position: "absolute", top: "-10%", right: "20%",
            width: 1, height: "130%",
            background: "linear-gradient(180deg, transparent 0%, rgba(75,153,212,0.12) 30%, rgba(75,153,212,0.12) 70%, transparent 100%)",
            transform: "rotate(15deg)",
          }} />
          <div style={{
            position: "absolute", top: "-10%", right: "35%",
            width: 1, height: "130%",
            background: "linear-gradient(180deg, transparent 0%, rgba(75,153,212,0.07) 40%, transparent 100%)",
            transform: "rotate(15deg)",
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div>
              {/* Badge */}
              <motion.div
                variants={fadeUp(0)} initial="hidden" animate="visible"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                style={{
                  background: "rgba(75,153,212,0.08)",
                  border: "1px solid rgba(75,153,212,0.2)",
                  color: "#4B99D4",
                }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#4B99D4" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                The Philippines' #1 Collector Hub
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUp(0.08)} initial="hidden" animate="visible">
                <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-2 uppercase italic">
                  Your Grails.
                </h1>
                <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic"
                  style={{ color: "#4B99D4" }}>
                  Reimagined.
                </h1>
              </motion.div>

              {/* Sub */}
              <motion.p variants={fadeUp(0.15)} initial="hidden" animate="visible"
                className="text-slate-500 font-semibold text-lg mb-10 leading-relaxed max-w-md">
                The elite destination for trading rare cards, figures, and collectibles.
                Join a community that understands the value of the hunt.
              </motion.p>

              {/* CTA – replaced Sign In with How It Works */}
              <motion.div variants={fadeUp(0.22)} initial="hidden" animate="visible"
                className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                {user ? (
                  <MagneticButton onClick={() => navigate("/dashboard")}
                    className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #4B99D4 0%, #2563eb 100%)", boxShadow: "0 8px 30px rgba(75,153,212,0.35)" }}>
                    <LayoutDashboard size={18} /> Go to Dashboard
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </MagneticButton>
                ) : (
                  <>
                    <MagneticButton onClick={() => navigate("/register")}
                      className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white"
                      style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: "0 8px 24px rgba(15,23,42,0.25)" }}>
                      Get Started
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </MagneticButton>
                    {/* New How It Works button – same style as old Sign In */}
                    <MagneticButton onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-slate-700 transition-all"
                      style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(75,153,212,0.2)", backdropFilter: "blur(8px)" }}>
                      How It Works
                    </MagneticButton>
                  </>
                )}
              </motion.div>

              {/* Social proof */}
              <motion.div variants={fadeUp(0.3)} initial="hidden" animate="visible"
                className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex -space-x-2">
                  {["CM","RS","JD","AK","LB"].map((init) => (
                    <div key={init}
                      className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black"
                      style={{ background: "linear-gradient(135deg, #4B99D4, #1e293b)" }}>
                      {init}
                    </div>
                  ))}
                </div>
                <span>12,400+ collectors already trading</span>
              </motion.div>
            </div>

            {/* Right: floating cards visual (unchanged) */}
            <div className="relative h-[400px] hidden lg:block">
              {/* Central glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(75,153,212,0.12) 0%, transparent 70%)" }} />

              {/* Central hub card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 rounded-3xl p-6 z-10"
                style={{
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  boxShadow: "0 30px 80px rgba(15,23,42,0.35)",
                  border: "1px solid rgba(75,153,212,0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg" style={{ background: "rgba(75,153,212,0.2)" }}>
                    <Repeat size={16} style={{ color: "#4B99D4" }} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-white">Trade&Talk</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#4B99D4" }}>Live Listings</p>
                <p className="text-3xl font-black text-white tracking-tighter">3,800<span style={{ color: "#4B99D4" }}>+</span></p>
                <div className="mt-4 flex gap-1.5">
                  {[40, 65, 45, 80, 55, 70].map((h, i) => (
                    <motion.div key={i} className="flex-1 rounded-sm"
                      style={{ background: "rgba(75,153,212,0.3)", height: 24 }}
                      initial={{ scaleY: 0 }} animate={{ scaleY: h / 80 }}
                      transition={{ duration: 0.6, delay: 0.8 + i * 0.08, ease: "easeOut" }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating item cards */}
              <FloatingHeroCard item={MARQUEE_ITEMS[0]} delay={0.4}
                style={{ top: "6%", left: "5%", rotate: -4 }} />
              <FloatingHeroCard item={MARQUEE_ITEMS[2]} delay={0.55}
                style={{ top: "8%", right: "0%", rotate: 3 }} />
              <FloatingHeroCard item={MARQUEE_ITEMS[4]} delay={0.7}
                style={{ bottom: "10%", left: "2%", rotate: 2 }} />
              <FloatingHeroCard item={MARQUEE_ITEMS[1]} delay={0.85}
                style={{ bottom: "8%", right: "-2%", rotate: -3 }} />
            </div>
          </div>
        </div>
      </header>

      {/* ── MARQUEE ───────────────────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          variants={stagger(0.1)} initial="hidden" animate={statsInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {statsLoading
            ? STATS_META.map(m => (
                <div key={m.key} className="rounded-3xl p-8 animate-pulse"
                  style={{ background: "rgba(75,153,212,0.05)", border: "1px solid rgba(75,153,212,0.08)" }}>
                  <div className="h-10 w-10 rounded-xl mb-4" style={{ background: "rgba(75,153,212,0.1)" }} />
                  <div className="h-10 w-32 rounded-xl mb-3" style={{ background: "rgba(75,153,212,0.08)" }} />
                  <div className="h-3 w-24 rounded" style={{ background: "rgba(75,153,212,0.06)" }} />
                </div>
              ))
            : STATS_META.map(meta => (
                <StatCard key={meta.key} meta={meta} value={stats[meta.key]} animate={statsInView} />
              ))
          }
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6 md:px-10">
        <motion.div variants={fadeUp(0)} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-center mb-16">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-4"
            style={{ color: "#4B99D4", background: "rgba(75,153,212,0.08)", border: "1px solid rgba(75,153,212,0.15)" }}>
            The Process
          </span>
          <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">How It Works</h3>
        </motion.div>

        <motion.div ref={stepsRef} variants={stagger(0.15)} initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">

          {/* Connector line */}
          <div className="hidden md:block absolute top-[2.6rem] left-[14%] right-[14%] h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(75,153,212,0.2), rgba(75,153,212,0.2), transparent)" }} />

          {STEPS.map(({ num, iconKey, title, desc }) => {
            const Icon = ICON_MAP[iconKey];
            return (
              <motion.div key={num} variants={scaleIn}
                whileHover={{ y: -6 }} transition={{ duration: 0.25 }}
                className="relative z-10 flex flex-col items-center text-center rounded-3xl p-6 cursor-default"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(75,153,212,0.08)", backdropFilter: "blur(12px)" }}>
                <motion.div
                  whileHover={{ boxShadow: "0 0 0 6px rgba(75,153,212,0.1)", background: "rgba(75,153,212,0.1)" }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all"
                  style={{ background: "rgba(75,153,212,0.06)", border: "1.5px solid rgba(75,153,212,0.15)" }}>
                  <Icon size={20} style={{ color: "#4B99D4" }} />
                </motion.div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: "#4B99D4" }}>{num}</span>
                <h4 className="font-black text-sm uppercase tracking-tighter mb-2 text-slate-900">{title}</h4>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">{desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────────── */}
      <section ref={categoriesRef} className="py-20 max-w-7xl mx-auto px-6 md:px-10">
        <motion.div variants={fadeUp(0)} initial="hidden" animate={categoriesInView ? "visible" : "hidden"}
          className="flex items-end justify-between mb-12">
          <div>
            <span className="block text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: "#4B99D4" }}>Browse By Category</span>
            <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">What Are You Hunting?</h3>
          </div>
          <Link to="/marketplace" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#4B99D4] transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div variants={stagger(0.06)} initial="hidden" animate={categoriesInView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map(({ label, emoji, slug }) => (
            <motion.div key={slug} variants={scaleIn}>
              <Link to={`/marketplace?cat=${slug}`}
                className="group relative overflow-hidden rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-300 block"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(75,153,212,0.1)", backdropFilter: "blur(8px)" }}
              >
                <motion.div whileHover={{ scale: 1.15, rotate: [-2, 2, 0] }} transition={{ duration: 0.3 }}
                  className="text-3xl">{emoji}</motion.div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 group-hover:text-[#4B99D4] transition-colors text-center leading-tight">
                  {label}
                </span>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(75,153,212,0.05) 0%, transparent 100%)", border: "1px solid rgba(75,153,212,0.2)" }} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── NEW ABOUT SECTION ─────────────────────────────────────────────────── */}
      <AboutSection />

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="py-24"
        style={{ background: "linear-gradient(180deg, rgba(75,153,212,0.04) 0%, rgba(246,250,253,0) 100%)", borderTop: "1px solid rgba(75,153,212,0.08)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div variants={fadeUp(0)} initial="hidden" animate={featuresInView ? "visible" : "hidden"}
            className="text-center mb-14">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-4"
              style={{ color: "#4B99D4", background: "rgba(75,153,212,0.08)", border: "1px solid rgba(75,153,212,0.15)" }}>
              Why Trade&Talk
            </span>
            <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Built for Collectors</h3>
          </motion.div>

          <motion.div variants={stagger(0.1)} initial="hidden" animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <ShieldCheck size={26} />, title: "Secure Trading", desc: "Admin-approved listings mean you only deal with verified collectors. No scammers, no fakes.", badge: "Trust Layer" },
              { icon: <MessageCircle size={26} />, title: "Direct Talk", desc: "Connect instantly with sellers. Negotiate, swap, or geek out on hobby specs in real-time.", badge: "Real-Time Chat" },
              { icon: <Zap size={26} />, title: "Fast Listing", desc: "Showcase your collection to thousands in minutes with our streamlined upload process.", badge: "24hr Approval" },
            ].map(({ icon, title, desc, badge }) => (
              <motion.div key={title} variants={scaleIn}
                whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(75,153,212,0.12)" }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl p-8 cursor-default"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(75,153,212,0.1)", backdropFilter: "blur(12px)" }}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6"
                  style={{ background: "rgba(75,153,212,0.08)", color: "#4B99D4", border: "1px solid rgba(75,153,212,0.15)" }}>
                  {badge}
                </div>
                <div className="mb-4 p-3 inline-flex rounded-2xl" style={{ background: "rgba(75,153,212,0.08)", color: "#4B99D4" }}>
                  {icon}
                </div>
                <h4 className="text-lg font-black uppercase italic tracking-tighter mb-3 text-slate-900">{title}</h4>
                <p className="text-slate-500 font-semibold text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <section ref={testimonialsRef} className="py-24 max-w-7xl mx-auto px-6 md:px-10">
        <motion.div variants={fadeUp(0)} initial="hidden" animate={testimonialsInView ? "visible" : "hidden"}
          className="text-center mb-14">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-4"
            style={{ color: "#4B99D4", background: "rgba(75,153,212,0.08)", border: "1px solid rgba(75,153,212,0.15)" }}>
            Real Collectors
          </span>
          <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">They Found Their Grail</h3>
        </motion.div>

        <motion.div variants={stagger(0.1)} initial="hidden" animate={testimonialsInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, location, avatar, text, rating, category }) => (
            <motion.div key={name} variants={scaleIn}
              whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(75,153,212,0.1)" }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7 cursor-default"
              style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(75,153,212,0.08)", backdropFilter: "blur(12px)" }}>
              <div className="flex gap-0.5 mb-4">
                {Array(rating).fill(0).map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed mb-6 italic">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black"
                  style={{ background: "linear-gradient(135deg, #4B99D4, #1e293b)" }}>
                  {avatar}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{name}</p>
                  <p className="text-[10px] font-bold text-slate-400">{location} · {category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[3rem] px-10 py-20 text-center"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1829 100%)",
            boxShadow: "0 40px 100px rgba(15,23,42,0.3)",
          }}
        >
          {/* Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(75,153,212,0.15) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(75,153,212,0.1) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
              style={{ background: "rgba(75,153,212,0.15)", color: "#7ec8f0", border: "1px solid rgba(75,153,212,0.2)" }}>
              <Heart size={12} className="fill-current" /> Free to Join
            </div>
            <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-5 text-white">
              Ready to Find<br /><span style={{ color: "#4B99D4" }}>Your Grail?</span>
            </h3>
            <p className="font-semibold text-lg mb-10 max-w-lg mx-auto" style={{ color: "rgba(148,163,184,0.9)" }}>
              Join 12,400+ collectors already trading on the Philippines' most trusted platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <MagneticButton onClick={() => navigate("/dashboard")}
                  className="group inline-flex items-center gap-3 px-9 py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #4B99D4 0%, #2563eb 100%)", boxShadow: "0 8px 30px rgba(75,153,212,0.4)" }}>
                  <LayoutDashboard size={18} /> Go to Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              ) : (
                <>
                  <MagneticButton onClick={() => navigate("/register")}
                    className="group inline-flex items-center gap-3 px-9 py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #4B99D4 0%, #2563eb 100%)", boxShadow: "0 8px 30px rgba(75,153,212,0.4)" }}>
                    Create Account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </MagneticButton>
                  <MagneticButton onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
                    style={{ border: "1.5px solid rgba(75,153,212,0.3)", color: "rgba(148,163,184,0.9)" }}>
                    Already a Member? Login
                  </MagneticButton>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="pt-20 pb-10" style={{ background: "#0f172a" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-12 pb-20"
          style={{ borderBottom: "1px solid rgba(75,153,212,0.08)" }}>
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-1.5 rounded-lg" style={{ background: "rgba(75,153,212,0.15)" }}>
                <Repeat size={18} style={{ color: "#4B99D4" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase text-white">
                Trade<span style={{ color: "#4B99D4" }}>&</span>Talk
              </h1>
            </div>
            <p className="font-semibold max-w-sm leading-relaxed text-sm mb-6" style={{ color: "rgba(148,163,184,0.7)" }}>
              The premier destination for Philippine collectors. Join the hunt and trade your passion.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Marketplace Active
            </div>
          </div>

          <div>
            <h5 className="font-black uppercase tracking-widest text-[10px] mb-6" style={{ color: "#4B99D4" }}>Platform</h5>
            <ul className="space-y-4 text-xs uppercase tracking-widest font-bold" style={{ color: "rgba(100,116,139,1)" }}>
              {[
                { label: "Marketplace", to: "/marketplace" },
                { label: "Safety",      to: "/safety" },
                { label: "Community",   to: "/community" },
                { label: "How It Works",to: "/#how-it-works" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-white transition-colors flex items-center gap-2">
                    <ChevronRight size={12} />{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-black uppercase tracking-widest text-[10px] mb-6" style={{ color: "#4B99D4" }}>Connect</h5>
            <div className="flex gap-3 mb-6">
              {[Globe, Users].map((Icon, i) => (
                <motion.div key={i} whileHover={{ y: -2, background: "#4B99D4" }}
                  className="h-10 w-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(75,153,212,0.1)" }}>
                  <Icon size={16} className="text-slate-400" />
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(75,85,99,1)" }}>
              support@tradetalk.ph
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 flex flex-col md:flex-row justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] gap-4"
          style={{ color: "rgba(75,85,99,0.8)" }}>
          <p>© 2026 Trade & Talk Development. All Rights Reserved.</p>
          <div className="flex gap-8">
            {["Terms","Privacy","Contact"].map((l) => (
              <span key={l} className="hover:text-slate-400 cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
