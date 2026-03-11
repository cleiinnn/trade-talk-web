/* src/styles/home.styles.js */
import { theme } from "./Global.styles.js";

export const ui = {
  ...theme, // Spread global theme into this object
  
  // Layout specific to Home
  layout: "min-h-screen bg-[#FBFCFD] font-sans text-slate-900",
  header: "sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm",
  navBar: "flex h-[68px] items-center justify-between max-w-[1440px] mx-auto px-10",
  main: "mx-auto w-full max-w-[1440px] px-10 py-8 animate-in fade-in duration-500",
  
  
  // Specific notification components
  notifDropdown: "absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
  notifHeader: "p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center",
  notifItem: (isRead) => `p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default ${!isRead ? "bg-blue-50/30" : ""}`,

  // Category buttons
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
};