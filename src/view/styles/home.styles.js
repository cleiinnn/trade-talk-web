/* src/styles/home.styles.js */
import { theme } from "./Global.styles.js";

export const ui = {
  ...theme,

  // Layout
  layout: "min-h-screen bg-[#FBFCFD] font-sans text-slate-900",
  header: "sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm",
  navBar: "flex h-[68px] items-center justify-between max-w-[1440px] mx-auto px-10",
  main: "mx-auto w-full max-w-[1440px] px-10 py-8 animate-in fade-in duration-500",

  // Notifications
  notifDropdown: "absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
  notifHeader: "p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center",
  notifItem: (isRead) => `p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default ${!isRead ? "bg-blue-50/30" : ""}`,

  // Category pill buttons (legacy / fallback)
  catBtn: (isActive) => `flex flex-shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
    isActive
      ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/15"
      : "border-slate-200 bg-white text-slate-500 hover:border-[#4B99D4] hover:text-[#4B99D4] hover:bg-[#D9E9EE]/40"
  }`,

  input: {
    ...theme.input,
    search: "w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-12 pr-5 text-sm transition-all focus:bg-white focus:border-[#4B99D4] focus:ring-4 focus:ring-[#4B99D4]/10 outline-none placeholder:text-slate-400",
  },

  price: "text-xl font-black text-[#4B99D4] tracking-tighter",

  // ── LISTING CARD — image border only ────────────────────────────────────────
  // Overrides the Global theme card to add a visible border + blue hover glow
  // around the image wrapper specifically. The outer container stays unchanged.
  card: {
    container: "group flex flex-col",
    imageWrapper: [
      "relative mb-3 aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-slate-100",
      // Border — visible slate with blue transition on hover
      "border-2 border-slate-200",
      "shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
      "transition-all duration-500",
      "group-hover:-translate-y-1",
      "group-hover:border-[#4B99D4]/50",
      "group-hover:shadow-[0_20px_50px_rgba(75,153,212,0.18)]",
    ].join(" "),
    image: "h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110",
  },

  // ── CATEGORY MEGA-MENU ────────────────────────────────────────────────────────
  //
  //  STYLE PRESERVED: original frosted-glass shell (#F6FAFD/95, backdrop-blur-2xl,
  //  border white/80, rounded-3xl) — exactly as the reverted styles.js.
  //
  //  FEATURES ADDED (non-destructive):
  //  • max-h + flex-col so the grid can scroll when categories overflow
  //  • gridBody  — the scrollable wrapper around gridContainer
  //  • itemIcon  — gains overflow-hidden + relative so photos clip inside it
  //  • tilePhoto — <img> class that fills itemIcon edge-to-edge
  //  • liveBadge / liveDot — shown only on photo tiles (never on SVG fallbacks)
  // ─────────────────────────────────────────────────────────────────────────────

  categoryMegaMenu: {

    // ── Shell — original frosted-glass style, now with flex-col + max-h ───────
    container: [
      "absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2",
      "w-[700px] max-w-[calc(100vw-2rem)]",
      "max-h-[min(600px,calc(100vh-130px))]", // ← scroll fix: cap height
      "flex flex-col",                         // ← scroll fix: header/footer pinned
      "bg-[#F6FAFD]/95 backdrop-blur-2xl",     // ← original glass style
      "rounded-3xl",
      "shadow-[0_30px_80px_rgba(75,153,212,0.15),0_2px_12px_rgba(0,0,0,0.06)]",
      "border border-white/80",                // ← original border
      "z-[100] overflow-hidden",
    ].join(" "),

    // ── Scrollable grid body — only section that overflows ───────────────────
    // Header and footer are flex-shrink-0 siblings, so they stay pinned.
    gridBody: "flex-1 overflow-y-auto overscroll-contain",

    // ── 4-column grid — original spacing ─────────────────────────────────────
    gridContainer: "grid grid-cols-4 gap-3 p-6 pt-4",

    // ── Individual tile — original style, no changes ─────────────────────────
    itemTile: (isActive) => [
      "group relative flex flex-col items-center gap-2 px-3 py-5",
      "rounded-2xl border cursor-pointer text-center",
      "transition-colors duration-200",
      isActive
        ? "border-[#4B99D4]/50 bg-white shadow-[0_0_0_3px_rgba(75,153,212,0.15),0_4px_24px_rgba(75,153,212,0.18)]"
        : "border-slate-100 bg-white hover:border-[#4B99D4]/30 hover:shadow-[0_8px_30px_rgba(75,153,212,0.15)]",
    ].join(" "),

    // ── Icon container — original dims + overflow-hidden for photo clipping ──
    // Adding: overflow-hidden, relative, flex-shrink-0
    // These are invisible when showing icons; required when showing photos.
    itemIcon: [
      "w-14 h-14 rounded-xl flex items-center justify-center",
      "relative overflow-hidden flex-shrink-0", // ← photo clip additions
      "shadow-sm transition-transform duration-300",
      "group-hover:scale-110",
    ].join(" "),

    // ── Photo inside itemIcon — absolute inset-0 fills the 56×56 rounded box ─
    tilePhoto: "absolute inset-0 w-full h-full object-cover",

    // ── Live badge — frosted pill, only rendered on photo tiles ──────────────
    liveBadge: [
      "absolute -bottom-0.5 left-1/2 -translate-x-1/2",
      "flex items-center gap-1",
      "rounded-md bg-black/55 backdrop-blur-sm",
      "px-1.5 py-0.5",
      "text-[7px] font-black uppercase tracking-widest text-white whitespace-nowrap",
      "z-10",
    ].join(" "),

    // Live dot inside badge
    liveDot: "w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0",

    // ── Active indicator dot — original, unchanged ────────────────────────────
    activeDot: "absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#4B99D4]",

    // ── Header / footer divider — original ───────────────────────────────────
    divider: "flex-shrink-0 mx-6 border-t border-slate-200/60",

    // ── Footer — original, flex-shrink-0 so it stays pinned ──────────────────
    footer: "flex-shrink-0 flex items-center justify-center gap-2 py-4 border-t border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#4B99D4] transition-colors cursor-pointer",
  },
};