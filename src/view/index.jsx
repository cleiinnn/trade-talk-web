import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Repeat,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageCircle,
  Star,
  Globe,
  Users,
  TrendingUp,
  Package,
  Award,
  ChevronRight,
  Sparkles,
  Heart,
} from "lucide-react";

// ── Animated counter hook ──────────────────────────────────────────────────
const useCounter = (target, duration = 1800, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

// ── Category pill data ─────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Trading Cards", emoji: "🃏", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { label: "Action Figures", emoji: "🤖", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { label: "Sneakers", emoji: "👟", color: "bg-rose-50 text-rose-600 border-rose-100" },
  { label: "Comics", emoji: "📚", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { label: "Vintage Toys", emoji: "🧸", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { label: "Anime Merch", emoji: "⚔️", color: "bg-orange-50 text-orange-600 border-orange-100" },
];

// ── Marquee card data ──────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  { name: "Charizard Holo 1st Ed.", price: "₱48,000", badge: "🔥 Hot", bg: "from-orange-100 to-amber-50" },
  { name: "RX-78-2 MG 1/100", price: "₱3,200", badge: "✨ New", bg: "from-blue-100 to-sky-50" },
  { name: "Jordan 1 Retro High", price: "₱12,500", badge: "👟 Grail", bg: "from-rose-100 to-pink-50" },
  { name: "One Piece Vol. 1 JP", price: "₱7,800", badge: "📚 Rare", bg: "from-purple-100 to-violet-50" },
  { name: "Mewtwo PSA 10", price: "₱90,000", badge: "💎 Elite", bg: "from-slate-100 to-zinc-50" },
  { name: "Vintage Optimus Prime", price: "₱15,000", badge: "🤖 Vintage", bg: "from-emerald-100 to-teal-50" },
];

// ── How It Works steps ─────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: <Users size={22} />,
    title: "Create Your Account",
    desc: "Sign up in seconds. Verify your email and you're in the collector's circle.",
  },
  {
    num: "02",
    icon: <Package size={22} />,
    title: "List Your Collection",
    desc: "Upload photos, set your price or trade terms. Admin approves within 24 hrs.",
  },
  {
    num: "03",
    icon: <MessageCircle size={22} />,
    title: "Chat & Negotiate",
    desc: "DM interested buyers or sellers directly. Agree on terms in real-time.",
  },
  {
    num: "04",
    icon: <Award size={22} />,
    title: "Trade & Review",
    desc: "Complete the deal and earn trust points. Build your collector reputation.",
  },
];

// ── Testimonials ───────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Carlo M.",
    location: "Manila",
    avatar: "CM",
    text: "Found my PSA 10 Charizard here after years of searching. The community is legit and the process was smooth.",
    rating: 5,
    category: "Trading Cards",
  },
  {
    name: "Rina S.",
    location: "Cebu",
    avatar: "RS",
    text: "Sold 3 MG Gundam kits in one week. The buyers here actually know the hobby — no low-ballers!",
    rating: 5,
    category: "Figures",
  },
  {
    name: "Jm Dela Cruz",
    location: "Davao",
    avatar: "JD",
    text: "Trade & Talk replaced my Facebook group search. Everything in one place, way more secure.",
    rating: 5,
    category: "Sneakers",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
const Home = () => {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Intersection observer for stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.4 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const countUsers    = useCounter(12400, 1800, statsVisible);
  const countListings = useCounter(3800,  1600, statsVisible);
  const countTrades   = useCounter(9200,  2000, statsVisible);

  return (
    <div className="min-h-screen bg-[#FBFCFD] font-sans text-slate-900 overflow-x-hidden">

      {/* ── NAVIGATION ─────────────────────────────────────────────────────── */}
      <nav className="flex h-20 items-center justify-between px-6 md:px-10 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg">
            <Repeat size={20} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-800 uppercase">
            Trade<span className="text-[#4B99D4]">&</span>Talk
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">Marketplace</span>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">Community</span>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">Safety</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#4B99D4] transition-all shadow-lg shadow-slate-200"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden pt-20 pb-28 bg-white">
        {/* subtle grid bg */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#0f172a 1px,transparent 1px),linear-gradient(90deg,#0f172a 1px,transparent 1px)", backgroundSize: "48px 48px" }}
        />
        {/* soft blue blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4B99D4]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#D9E9EE] text-[#4B99D4] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Sparkles size={13} /> The Philippines' #1 Collector Hub
            </div>

            <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.88] mb-7 uppercase italic">
              Your Grails.<br />
              <span className="text-[#4B99D4]">Reimagined.</span>
            </h2>

            <p className="max-w-xl mx-auto text-slate-500 font-semibold text-lg mb-10 leading-relaxed">
              The elite destination for trading rare cards, figures, and collectibles.
              Join a community that understands the value of the hunt.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="group inline-flex items-center gap-3 bg-slate-900 text-white px-9 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#4B99D4] transition-all shadow-2xl shadow-blue-500/20"
              >
                Start Trading Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 px-9 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:border-slate-400 transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Social proof line */}
            <div className="mt-10 flex items-center justify-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex -space-x-2">
                {["CM","RS","JD","AK","LB"].map((init) => (
                  <div key={init} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4B99D4] to-slate-700 border-2 border-white flex items-center justify-center text-white text-[8px] font-black">
                    {init}
                  </div>
                ))}
              </div>
              <span>12,400+ collectors already trading</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── SCROLLING MARQUEE ───────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-y border-slate-100 py-6 overflow-hidden">
        <div className="flex gap-4 animate-[marquee_30s_linear_infinite] w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div
              key={i}
              className={`flex-shrink-0 bg-gradient-to-br ${item.bg} border border-white rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-sm min-w-[220px]`}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.badge}</p>
                <p className="text-sm font-black text-slate-800 leading-tight">{item.name}</p>
                <p className="text-xs font-black text-[#4B99D4] mt-0.5">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {[
              { count: countUsers,    suffix: "+", label: "Verified Collectors", icon: <Users size={20} /> },
              { count: countListings, suffix: "+", label: "Active Listings",     icon: <Package size={20} /> },
              { count: countTrades,   suffix: "+", label: "Trades Completed",    icon: <TrendingUp size={20} /> },
            ].map(({ count, suffix, label, icon }) => (
              <div key={label} className="text-center py-10 md:py-0 px-8">
                <div className="inline-flex items-center justify-center text-[#4B99D4] mb-3">{icon}</div>
                <p className="text-5xl font-black tracking-tighter mb-2">
                  {count.toLocaleString()}{suffix}
                </p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B99D4] mb-3">Browse By Category</p>
          <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">What Are You Hunting?</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map(({ label, emoji, color }) => (
            <button
              key={label}
              onClick={() => navigate("/register")}
              className={`border ${color} rounded-2xl py-5 px-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform font-black text-xs uppercase tracking-wide`}
            >
              <span className="text-2xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B99D4] mb-3">Why Trade&Talk</p>
            <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Built for Collectors</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck size={28} />,
                title: "Secure Trading",
                desc: "Admin-approved listings mean you only deal with verified collectors. No scammers, no fakes.",
                badge: "Trust Layer",
              },
              {
                icon: <MessageCircle size={28} />,
                title: "Direct Talk",
                desc: "Connect instantly with sellers. Negotiate, swap, or geek out on hobby specs in real-time.",
                badge: "Real-Time Chat",
              },
              {
                icon: <Zap size={28} />,
                title: "Fast Listing",
                desc: "Showcase your collection to thousands in minutes with our streamlined upload process.",
                badge: "24hr Approval",
              },
            ].map(({ icon, title, desc, badge }) => (
              <div key={title} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                <div className="inline-flex items-center gap-1.5 bg-[#D9E9EE] text-[#4B99D4] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                  {badge}
                </div>
                <div className="text-[#4B99D4] mb-4">{icon}</div>
                <h4 className="text-lg font-black uppercase italic tracking-tighter mb-3">{title}</h4>
                <p className="text-slate-500 font-semibold text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B99D4] mb-3">The Process</p>
          <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">How It Works</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* connector line (desktop) */}
          <div className="hidden md:block absolute top-[2.75rem] left-[12.5%] right-[12.5%] h-px bg-slate-200 z-0" />
          {STEPS.map(({ num, icon, title, desc }) => (
            <div key={num} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 group-hover:border-[#4B99D4] group-hover:text-[#4B99D4] flex items-center justify-center mb-5 shadow-sm transition-all text-slate-400">
                {icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#4B99D4] mb-2">{num}</span>
              <h4 className="font-black text-sm uppercase tracking-tighter mb-2">{title}</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B99D4] mb-3">Real Collectors</p>
            <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">They Found Their Grail</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, location, avatar, text, rating, category }) => (
              <div key={name} className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B99D4] to-slate-700 flex items-center justify-center text-white text-xs font-black">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{location} · {category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-10">
        <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] px-10 py-16 text-center text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4B99D4]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4B99D4]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#4B99D4]/20 text-[#7ec8f0] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Heart size={12} className="fill-[#7ec8f0]" /> Free to Join
            </div>
            <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-5">
              Ready to Find<br />
              <span className="text-[#4B99D4]">Your Grail?</span>
            </h3>
            <p className="text-slate-400 font-semibold text-lg mb-10 max-w-lg mx-auto">
              Join 12,400+ collectors already trading on the Philippines' most trusted platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="group inline-flex items-center gap-3 bg-[#4B99D4] text-white px-9 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#3a88c3] transition-all shadow-2xl shadow-blue-500/30"
              >
                Create Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 border-2 border-slate-700 text-slate-300 px-9 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:border-slate-500 transition-all"
              >
                Already a Member? Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-[#4B99D4] text-white p-1.5 rounded-lg">
                <Repeat size={20} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                Trade<span className="text-[#4B99D4]">&</span>Talk
              </h1>
            </div>
            <p className="text-slate-400 font-semibold max-w-sm leading-relaxed text-sm mb-6">
              The premier destination for Philippine collectors. Join the hunt and trade your passion.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-900/40 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Marketplace Active
            </div>
          </div>

          <div>
            <h5 className="font-black uppercase tracking-widest text-[#4B99D4] text-[10px] mb-6">Platform</h5>
            <ul className="space-y-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={12} />Marketplace</li>
              <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={12} />Safety</li>
              <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={12} />Community</li>
              <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={12} />How It Works</li>
            </ul>
          </div>

          <div>
            <h5 className="font-black uppercase tracking-widest text-[#4B99D4] text-[10px] mb-6">Connect</h5>
            <div className="flex gap-3 mb-6">
              <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-[#4B99D4] cursor-pointer transition-colors"><Globe size={16} /></div>
              <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-[#4B99D4] cursor-pointer transition-colors"><Users size={16} /></div>
            </div>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">support@tradetalk.ph</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 flex flex-col md:flex-row justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 gap-4">
          <p>© 2026 Trade & Talk Development. All Rights Reserved.</p>
          <div className="flex gap-8">
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;