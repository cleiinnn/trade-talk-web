export const styles = {
  container: "min-h-screen bg-[#F1F5F9] p-4 md:p-8 font-sans",
  
  // Dashboard Metrics
  statsGrid: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-10",
  statCard: "bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm hover:border-blue-200 transition-all",
  statValue: "text-2xl font-black text-slate-900 block",
  statLabel: "text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1",
  statCardHighlight: "bg-[#4B99D4] border-2 border-[#4B99D4] rounded-2xl p-5 shadow-lg shadow-blue-100",
  statValueHighlight: "text-2xl font-black text-white block",
  statLabelHighlight: "text-[10px] font-black uppercase tracking-widest text-blue-100 mt-1",

  // Main Card Design
  card: "bg-white rounded-3xl border-2 border-slate-100 p-5 md:p-6 max-w-3xl mx-auto mb-6 shadow-sm transition-all",
  cardHeader: "flex justify-between items-start mb-4",
  
  // Comparison Grid (Trade/Buy Visual)
  grid: "grid grid-cols-1 md:grid-cols-[1fr_30px_1fr] gap-4 items-center mb-6",
  itemBox: "border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-row items-center gap-4 text-left",
  image: "w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0",
  title: "text-sm font-black text-slate-900 leading-tight truncate",
  value: "text-[11px] font-bold text-slate-600",
  badge: "inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[8px] uppercase font-black text-slate-500",

  // Action Bar
  buttonArea: "flex gap-3 pt-4 border-t border-slate-50",
  btnAction: "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
  btnChat: "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
  btnSecondary: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
  btnDanger: "bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white"
};