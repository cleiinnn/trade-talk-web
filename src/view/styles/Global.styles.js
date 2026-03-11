/* src/styles/Global.styles.js */
export const theme = {
  colors: {
    brand: "#4B99D4",
    brandLight: "#D9E9EE",
    bg: "#FBFCFD",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate800: "#1e293b",
  },
  
  // Reusable UI components
  button: {
    primary: "flex items-center gap-2 rounded-full bg-[#4B99D4] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#3a88c3] active:scale-95 shadow-sm",
    darkIcon: "rounded-xl bg-slate-900 p-3 text-white transition-all hover:bg-[#4B99D4] hover:shadow-lg hover:shadow-[#4B99D4]/20 active:scale-90",
    fav: (isLiked) => `absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm backdrop-blur transition-all active:scale-75 ${
      isLiked ? "bg-white text-red-500" : "bg-white/90 text-slate-500 hover:text-red-500"
    }`,
  },

  input: {
    search: "w-full rounded-2xl border-2 border-slate-100 bg-slate-100/50 py-3 pl-12 pr-5 text-sm transition-all focus:bg-white focus:border-[#4B99D4] focus:ring-0 outline-none placeholder:text-slate-400",
  },

  card: {
    container: "group flex flex-col",
    imageWrapper: "relative mb-3 aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-slate-100 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_20px_50px_rgba(75,153,212,0.15)]",
    image: "h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110",
  }
};