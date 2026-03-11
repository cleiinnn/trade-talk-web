export const styles = {
  // ─── CONTAINER & LAYOUT ───
  container: "min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans",
  card: (status) => `w-full bg-white rounded-3xl border p-2 md:p-6 mb-6 shadow-sm transition-all ${
    status === 'pending' ? "border-blue-100 shadow-md" : "border-slate-100 opacity-90"
  }`,

  // ─── DASHBOARD OVERVIEW ───
  statsGrid: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-10",
  statCard: "bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm hover:border-blue-200 transition-colors",
  statValue: "text-2xl font-black text-slate-900 block",
  statLabel: "text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1",
  
  // High contrast version for important metrics
  statCardHighlight: "bg-slate-900 border-2 border-slate-900 rounded-2xl p-5 shadow-lg",
  statValueHighlight: "text-2xl font-black text-white block",
  statLabelHighlight: "text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1",


  // ─── SELLER INTELLIGENCE (Top Badges) ───
  intelRow: "flex flex-wrap gap-2 mb-4",
  intelBadge: "px-2.5 py-1 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5",
  
  // ─── HEADER ───
  buyerName: "text-lg font-black text-slate-900 leading-tight",
  divider: "border-t border-slate-100 my-4",

  // ─── GRID COMPARISON (The "Trade" Look) ───
  grid: "grid grid-cols-1 md:grid-cols-[1fr_30px_1fr] gap-4 items-center mb-6",
  itemBox: "border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-row items-center gap-4 text-left",
  label: "text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block",
  image: "w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0",
  title: "text-sm font-black text-slate-900 leading-tight truncate",
  value: "text-[11px] font-bold text-slate-600",
  badge: "inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[8px] uppercase font-black text-slate-500",
  
  // ─── ALERTS & GUIDANCE (The "Process Map") ───
  stockAlert: "text-[10px] font-bold text-amber-500 mt-2 flex items-center gap-1 justify-center",
  // Guidance
  guidanceBox: "bg-blue-600 rounded-2xl p-4 mb-6 text-white shadow-inner",
  guidanceText: "text-[11px] text-blue-50 leading-relaxed font-bold",
  
  // ─── ACTION BUTTONS ───
  buttonArea: "flex justify-end gap-3",
  swapIcon: "flex justify-center text-slate-400 rotate-90 md:rotate-0",
  btnSecondary: "px-6 py-3 rounded-xl border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all",
  btnPrimary: "px-8 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95",
  
  // ─── FILTERS ───
  filterBtn: (isActive) => `flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
    isActive ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
  }`
};
