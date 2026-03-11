import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Search, MessageCircle, Star, Flame, Repeat, Sparkles, Boxes, 
  Users, Heart, Bell, PlusCircle, BookOpen, X, ChevronDown, Coins
} from "lucide-react";

// Import the UI object from your central styles folder
import { ui } from "../styles/home.styles.js";
import { BASE } from "../../viewmodel/constants";

/* --- HELPER COMPONENTS --- */
const MenuLink = ({ label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative text-xs font-black uppercase tracking-widest transition-all pb-1 hover:text-slate-900 ${
      active ? "text-slate-900" : "text-slate-500"
    }`}
  >
    {label}
    {active && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#4B99D4] rounded-full" />}
  </button>
);

// IconButton now accepts onClick and passes it to the div
const IconButton = ({ icon, badge, hoverColor, onClick }) => (
  <div 
    className={`relative cursor-pointer transition-colors ${hoverColor} text-slate-500`}
    onClick={onClick}
  >
    {icon}
    {badge && <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-md bg-red-500 text-[9px] font-black text-white shadow-sm ring-2 ring-white">{badge}</span>}
  </div>
);

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc",label: "Price: High → Low" },
];

const SortDropdown = ({ sortBy, setSortBy }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const current = SORT_OPTIONS.find(o => o.value === sortBy);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 whitespace-nowrap"
      >
        {current.label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors hover:bg-slate-50 ${sortBy === opt.value ? "text-[#4B99D4]" : "text-slate-600"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Toast = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className="flex items-center gap-2.5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
        {t.icon} {t.message}
      </div>
    ))}
  </div>
);

// StarRating: filled/half/empty stars + score + review count
const StarRating = ({ rating, count }) => {
  const score = Number(rating);
  const hasRating = score > 0;

  if (!hasRating) return (
    <p className="text-[10px] text-slate-400 font-medium italic mt-1">No ratings yet</p>
  );

  const fullStars  = Math.floor(score);
  const halfStar   = score - fullStars >= 0.25 && score - fullStars < 0.75;
  const roundedUp  = score - fullStars >= 0.75 ? fullStars + 1 : fullStars;

  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={11}
            className={
              i <= roundedUp
                ? "fill-amber-400 text-amber-400"
                : i === fullStars + 1 && halfStar
                ? "fill-amber-200 text-amber-300"
                : "fill-slate-200 text-slate-200"
            }
          />
        ))}
      </div>
      <span className="text-[10px] font-black text-slate-700">{score.toFixed(1)}</span>
      {Number(count) > 0 && (
        <span className="text-[10px] text-slate-400 font-medium">({count})</span>
      )}
    </div>
  );
};

const getCurrentUser = () => {
  const userStr = sessionStorage.getItem("user");
  if (!userStr) return null;
  try { 
    return JSON.parse(userStr); 
  } catch {
     return null; }
};

const resolveNotificationLink = (rawLink) => {
  if (typeof rawLink !== "string") return null;
  const link = rawLink.trim();
  if (!link) return null;

  if (/^https?:\/\//i.test(link)) {
    try {
      const url = new URL(link);
      if (url.origin === window.location.origin || url.hostname === "localhost") {
        return `${url.pathname}${url.search}${url.hash}`;
      }
      window.open(link, "_blank", "noopener,noreferrer");
      return null;
    } catch {
      return null;
    }
  }

  if (link.startsWith("/")) return link;
  return `/${link.replace(/^\.?\//, "")}`;
};

// Icon mapping for categories
const categoryIcons = {
  'Cards': Sparkles,
  'Mystery/Blind Boxes': Boxes,
  'Figures': Flame,
  'Comic Books': BookOpen,
  'Memorabilia': Star,
  'Coins': Coins,
};

/* --- MAIN COMPONENT --- */
const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [toasts, setToasts] = useState([]);
  const notifRef = useRef(null);

  // Toast helper
  const showToast = (message, icon) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE}/get_meta.php`);
        setDynamicCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);
  
  // 1. Fetch Notifications
  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`${BASE}/get_notifications.php?user_id=${userId}`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "user") {
      alert("Access denied. Please log in as a regular user.");
      navigate("/login");
      return;
    }
    setUser(currentUser);

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch Listings and Favorites
        const [listingsRes, favsRes] = await Promise.all([
          axios.get(`${BASE}/get_listings.php`, { withCredentials: true }),
          axios.get(`${BASE}/get_user_favorites.php?user_id=${currentUser.user_id}`)
        ]);
        
        // Ensure listings are always arrays
        const listingsData = Array.isArray(listingsRes.data) ? listingsRes.data : [];
        setListings(listingsData);
        setFilteredListings(listingsData);

        // Process Favorites into simple ID array
        const favData = Array.isArray(favsRes.data) ? favsRes.data : [];
        const favoriteIds = favData.map(item => String(item.listing_id ?? item.id ?? item));
        setFavorites(favoriteIds);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    fetchNotifications(currentUser.user_id);
  }, [navigate]);

  // 2. Toggle Favorites
  const toggleFavorite = async (listingId) => {
    if (!user) return;
    try {
      const res = await axios.post(`${BASE}/toggle_favorite.php`, {
        user_id: user.user_id,
        listing_id: listingId,
      });
      if (res.data.success) {
        const wasLiked = favorites.includes(String(listingId));
        setFavorites(prev => prev.includes(String(listingId)) 
          ? prev.filter(id => id !== String(listingId)) 
          : [...prev, String(listingId)]
        );
        showToast(
          wasLiked ? "Removed from favorites" : "Added to favorites",
          wasLiked
            ? <Heart size={14} className="text-slate-400" />
            : <Heart size={14} fill="currentColor" className="text-red-400" />
        );
      }
    } catch (err) {
      console.error("Failed to update favorite", err);
    }
  };

  // 3. Mark Notifications
  const markAsRead = async () => {
    if (unreadCount === 0 || !user) return;
    try {
      await axios.post(`${BASE}/mark_notifications_read.php`, {
        user_id: user.user_id
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

    // Filter listings by category and search
  useEffect(() => {
    let filtered = listings;
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => (item.category_name ?? item.category) === selectedCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.seller?.toLowerCase().includes(term)
      );
    }
    setFilteredListings(filtered);
  }, [selectedCategory, searchTerm, listings]);

  // Helper to determine if listing is new (within 7 days)
  const isNew = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const unreadCount = notifications.filter(n => Number(n.is_read) === 0).length;

  // Sort filteredListings based on sortBy
  const sortedListings = useMemo(() => {
    const arr = [...filteredListings];
    if (sortBy === "price_asc")  return arr.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "price_desc") return arr.sort((a, b) => Number(b.price) - Number(a.price));
    // newest: default — sort by created_at descending
    return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [filteredListings, sortBy]);

  // Outside-click closes notification dropdown
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return <div className="flex h-screen items-center justify-center bg-slate-50 font-bold text-slate-600">Loading...</div>;

  return (
    <div className={`${ui.layout} bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]`}>
      {/* --- HEADER --- */}
      <header className={`${ui.header} sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-slate-100`}>
        <div className={ui.navBar}>
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg"><Repeat size={20} /></div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-800 uppercase">
              Trade<span className="text-[#4B99D4]">&</span>Talk
            </h1>
          </div>

          <div className="relative w-[380px] group">
            <input
              type="text"
              placeholder="Search grails or sellers..."
              value={searchTerm}
              className={ui.input.search}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 group-focus-within:text-[#4B99D4] transition-colors" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors"
                aria-label="Clear search"
              >
                <X size={11} className="text-white" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/listings")} className={ui.button.primary}>
              <PlusCircle size={18} /> Create new listing
            </button>

            <div className="flex items-center gap-3 border-x border-slate-100 px-6">
              <div onClick={() => navigate("/favorites")} className="cursor-pointer">
                <IconButton 
                  icon={<Heart size={22} fill={favorites.length > 0 ? "#ef4444" : "none"} className={favorites.length > 0 ? "text-red-500" : ""} />} 
                  badge={favorites.length > 0 ? favorites.length : null} 
                  hoverColor="hover:text-red-500" 
                />
              </div>
              
              <div className="relative" ref={notifRef}>
                <div onClick={() => { setShowNotifDropdown(!showNotifDropdown); if (!showNotifDropdown) markAsRead(); }}>
                  <IconButton icon={<Bell size={22} />} badge={unreadCount > 0 ? unreadCount : null} hoverColor="hover:text-blue-500" />
                </div>

                {showNotifDropdown && (
                  <div className={ui.notifDropdown}>
                    <div className={ui.notifHeader}>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Notifications</h3>
                      <span className="bg-[#4B99D4] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
	                      {notifications.length > 0 ? (
	                        notifications.map((n) => (
	                          <div 
	                            key={n.notification_id} 
	                            className={`${ui.notifItem(Number(n.is_read) === 1)} cursor-pointer hover:bg-slate-100`}
	                            onClick={() => {
	                              const targetLink = resolveNotificationLink(n.link);
	                              if (targetLink) navigate(targetLink);
	                              setShowNotifDropdown(false);
	                            }}
	                          >
                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-slate-500 mt-2 font-medium">{new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center"><p className="text-xs font-bold text-slate-300 italic">No recent activity</p></div>
                      )}
                    </div>
                  </div>
                )}
              </div>

                {/* Messages icon - now clickable */}
                  <IconButton 
                    icon={<MessageCircle size={22} />} 
                    hoverColor="hover:text-blue-500"
                    onClick={() => navigate("/messages")}
                  />
                </div>

            <div onClick={() => navigate("/profile")} className="flex items-center gap-3 pl-2 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-2xl transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800 leading-none group-hover:text-[#4B99D4] transition-colors">{user.username}</p>
                <p className="text-[10px] font-bold text-[#4B99D4] uppercase tracking-tighter">Collector</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 shadow-sm group-hover:border-[#4B99D4] transition-all overflow-hidden">
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <Users size={20} className="text-slate-500 group-hover:text-[#4B99D4]" />
                )}
              </div>
            </div>
          </div>
        </div>



        <nav className="flex items-center justify-center gap-12 bg-white py-3 border-y border-slate-100 shadow-sm">
          <MenuLink label="Dashboard" active={window.location.pathname === "/home"} onClick={() => navigate("/home")}/>

          {/* Update this line below */}
         <MenuLink label="Showcase" active={window.location.pathname === "/showcase"} onClick={() => navigate("/showcase")}/>
          <MenuLink label="Orders" active={window.location.pathname === "/orders"} onClick={() => navigate("/orders")} />
         <MenuLink label="Groups" active={window.location.pathname === "/groups"} onClick={() => navigate("/groups")} />
          <MenuLink label="Purchase" active={window.location.pathname === "/purchase"} onClick={() => navigate("/purchase")} />
          <MenuLink label="Settings" />
        </nav>
      </header>

                  {/* --- MAIN CONTENT --- */}
            <main className={ui.main}>
              {/* ── Section header row ─────────────────────────────────────── */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[#4B99D4] text-xs font-black uppercase tracking-[0.2em] mb-1">Discover</p>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {selectedCategory === "All" ? "All Listings" : selectedCategory}
                    {!loading && (
                      <span className="ml-3 text-base font-bold text-slate-400">
                        ({sortedListings.length})
                      </span>
                    )}
                  </h2>
                </div>
                <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
              </div>

              {/* ── Categories scrollable pill row ─────────────────────────── */}
              <div className="relative mb-8">
                {/* fade-out mask on the right to hint at scroll */}
                <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#FBFCFD] to-transparent z-10" />
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
                     style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {/* All button */}
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={ui.catBtn(selectedCategory === "All")}
                  >
                    <Boxes size={15} /> All
                  </button>

                  {/* Dynamic category buttons */}
                  {dynamicCategories.map(cat => {
                    const Icon = categoryIcons[cat.category_name] || Boxes;
                    return (
                      <button
                        key={cat.category_id}
                        onClick={() => setSelectedCategory(cat.category_name)}
                        className={ui.catBtn(selectedCategory === cat.category_name)}
                      >
                        <Icon size={15} /> {cat.category_name}
                      </button>
                    );
                  })}

                  {/* Right-side spacer so last item clears the fade mask */}
                  <span className="flex-shrink-0 w-12" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {loading ? (
                  <div className="col-span-full py-40 flex flex-col items-center opacity-50">
                      <div className="animate-spin mb-4"><Repeat size={40}/></div>
                      <p className="font-black text-slate-400 uppercase tracking-widest">Loading Collection</p>
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="col-span-full py-40 text-center"><p className="text-xl font-bold text-slate-300 italic">No grails found...</p></div>
                ) : (
                  /* Using ( ) here for implicit return to keep it clean */
                  sortedListings.map((listing) => {
                  const listingId = listing.listing_id ?? listing.id;
                  const isLiked = favorites.includes(String(listingId));
                  const itemIsNew = isNew(listing.created_at);
                    return (
                      <div key={listingId} className={ui.card.container}>

                        {/* Container for Image and Heart */}
                        <div className={ui.card.imageWrapper}>
                          
                          {/* 1. Clickable Image Area */}
                          <Link to={`/product/${listingId}`} className="block h-full w-full">
                            <div 
                              className={ui.card.image} 
                              style={{ backgroundImage: listing.image_url ? `url(${listing.image_url})` : "linear-gradient(to bottom right, #f1f5f9, #e2e8f0)" }} 
                            />

                          </Link>

                          {/* 2. Heart Button - Absolute positioned relative to imageWrapper */}
                          <button 
                            onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation();
                              toggleFavorite(listingId);
                            }} 
                            className={`${ui.button.fav(isLiked)} z-10`}
                            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }} 
                          >
                            <Heart size={22} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-pulse" : ""} />
                          </button>
                        </div>

                        {/* Info Section Below */}
                        <div className="px-1 mt-2">
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <Link to={`/product/${listingId}`}>
                                <h3 className="text-sm font-black tracking-tight text-slate-800 transition-colors hover:text-[#4B99D4]">
                                  {listing.title}
                                </h3>
                              </Link>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                Seller: <span className="text-[#4B99D4]">{listing.seller || "Private"}</span>
                              </p>
                              <StarRating rating={listing.seller_avg_rating} count={listing.seller_review_count} />
                            </div>
                            {itemIsNew && (
                            <span className="rounded-lg bg-[#D9E9EE] px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter text-[#4B99D4]">New</span>
                            )}
                            </div>

                          <div className="mt-4 flex items-center justify-between">
                            <p className={ui.price}><span className="text-sm font-bold align-top mr-1">{"\u20B1"}</span>{Number(listing.price).toLocaleString()}</p>
                            <button 
                              onClick={() => navigate('/messages', { 
                                state: { 
                                  listing_id: listingId,
                                  listing_title: listing.title,
                                  listing_image: listing.image_url,
                                  other_user_id: listing.seller_id,
                                  other_username: listing.seller
                                }
                              })}
                              className={ui.button.darkIcon}
                            >
                              <MessageCircle size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </main>
      <Toast toasts={toasts} />
    </div>
  );
};

export default Home;
