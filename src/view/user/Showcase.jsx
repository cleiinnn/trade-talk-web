import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import { Layers, MapPin, User, Search, Info, Eye, EyeOff } from "lucide-react";
import { BASE } from "../../viewmodel/constants";

const Showcase = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = useMemo(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (err) {
      console.error("Invalid user session data", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchShowcase = async () => {
      if (!currentUser?.user_id) {
        setItems([]);
        return;
      }
      try {
        const res = await axios.get(`${BASE}/get_showcase.php?user_id=${currentUser.user_id}`);
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching showcase:", err);
      }
    };
    fetchShowcase();
  }, [currentUser]); // Trigger when currentUser state is set

  const handleToggleVisibility = async (listingId) => {
    if (!currentUser?.user_id) return;
    try {
      const res = await axios.post(`${BASE}/toggle_visibility.php`, {
        listing_id: listingId,
        user_id: currentUser.user_id,
      });
      if (!res?.data?.success) {
        console.error("Toggle visibility failed:", res?.data?.message || "Unknown error");
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          Number(item.listing_id) === Number(listingId)
            ? { ...item, is_public: Number(item.is_public) === 1 ? 0 : 1 }
            : item
        )
      );
    } catch (err) {
      console.error("Toggle visibility failed", err);
    }
  };

  const isOwnedByCurrentUser = (item) => {
    if (!currentUser) return false;
    const ownerId = item.user_id ?? item.owner_id ?? item.collector_id;
    return Number(ownerId) === Number(currentUser.user_id);
  };

  const filteredItems = items.filter((item) => {
    const title = (item?.title ?? "").toLowerCase();
    const category = (item?.category_name ?? "").toLowerCase();
    const needle = searchTerm.toLowerCase();
    return title.includes(needle) || category.includes(needle);
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-12">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">The Vault</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Verified Collector Showcases</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4B99D4] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search the collection..."
            className="bg-white border-none rounded-2xl py-4 pl-12 pr-6 shadow-sm w-full md:w-80 outline-none focus:ring-2 ring-[#4B99D4]/20 transition-all font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GALLERY GRID */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map((item) => (
                    <div 
            key={item.listing_id} 
            className={`bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
                Number(item.is_public) === 0 ? 'opacity-70 grayscale-[0.5]' : ''
            }`}
            >
            {/* If private, add a small "Hidden" badge over the image */}
            {Number(item.is_public) === 0 && (
                <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <p className="text-[8px] font-black text-white uppercase tracking-widest">Private Vault</p>
                </div>
            )}

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-black text-slate-800 leading-tight">{item.title}</h3>
                <div className="flex items-center gap-2">
                  {isOwnedByCurrentUser(item) && (
                    <button
                      onClick={() => handleToggleVisibility(item.listing_id)}
                      className={`p-2 rounded-lg transition-all ${
                        Number(item.is_public) === 1
                          ? "text-[#4B99D4] bg-[#D9E9EE]"
                          : "text-slate-300 hover:text-[#4B99D4]"
                      }`}
                      title={Number(item.is_public) === 1 ? "Public" : "Private"}
                    >
                      {Number(item.is_public) === 1 ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  )}
                  <button className="text-slate-300 hover:text-[#4B99D4] transition-colors">
                    <Info size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#4B99D4]">
                  <Layers size={14} /> {item.category_name}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <MapPin size={14} /> {item.location_name}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <User size={12} className="text-slate-400" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">{item.collector_name}</span>
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 font-black italic uppercase tracking-widest">No items found in the vault.</p>
        </div>
      )}
    </div>
  );
};

export default Showcase;