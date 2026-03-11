import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Heart, MessageCircle, Search } from "lucide-react";
import { BASE } from "../../viewmodel/constants";

const Favorites = () => {
  const navigate = useNavigate();
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(() => JSON.parse(sessionStorage.getItem("user")));
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchFavoritesFromDB = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE}/get_user_favorites_details.php?user_id=${user.user_id}`
        );

        if (res.data && Array.isArray(res.data)) {
          console.log("Favorite Item 0 Image URL:", res.data[0]?.image_url);
          setFavoriteListings(res.data);
        } else {
          console.error("Backend did not return an array:", res.data);
          setFavoriteListings([]);
        }
      } catch (err) {
        console.error("Error loading favorites:", err);
        setFavoriteListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritesFromDB();
  }, [user, navigate]);

  const handleToggleFav = async (listingId) => {
    try {
      const res = await axios.post(`${BASE}/toggle_favorite.php`, {
        user_id: user.user_id,
        listing_id: listingId
      });
      if (res.data.success) {
        setFavoriteListings(prev => prev.filter(item => (item.listing_id || item.id) !== listingId));
      }
    } catch (err) {
      console.error("Error updating favorite:", err);
    }
  };

  const filteredFavorites = favoriteListings.filter((listing) =>
    listing.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/600x600/f1f5f9/4B99D4?text=No+Image";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFCFD] p-10">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-50">
                <div className="aspect-square bg-slate-100 animate-pulse rounded-[2rem] mb-4"></div>
                <div className="h-6 w-3/4 bg-slate-100 animate-pulse rounded-md mb-4 mx-2"></div>
                <div className="flex justify-between items-center px-2">
                  <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md"></div>
                  <div className="h-10 w-10 bg-slate-100 animate-pulse rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFCFD] p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <button onClick={() => navigate("/home")} className="flex items-center gap-2 font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft size={20} /> Back to Market
            </button>
            <h1 className="text-3xl font-black text-slate-900">
              My Favorites <span className="text-[#4B99D4]">({favoriteListings.length})</span>
            </h1>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4B99D4] transition-colors" />
            <input
              type="text"
              placeholder="Search your saved grails..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-5 text-sm outline-none focus:ring-4 focus:ring-[#4B99D4]/10 focus:border-[#4B99D4] transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {!Array.isArray(favoriteListings) || favoriteListings.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
            <Heart size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">No grails saved yet.</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-bold italic">No favorites match your search...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredFavorites.map((listing) => (
              <div key={listing.listing_id || listing.id} className="group bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-50 transition-all hover:shadow-xl hover:shadow-blue-900/5">
                {/* Clickable image area */}
                <Link to={`/product/${listing.listing_id || listing.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-[2rem] mb-4">
                    <img
                      src={listing.image_url || ""}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={listing.title}
                      onError={handleImageError}
                    />
                    {/* Favorite button – click stops navigation */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleFav(listing.listing_id || listing.id);
                      }}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-2xl text-red-500 shadow-sm hover:scale-110 active:scale-90 transition-all"
                    >
                      <Heart size={20} fill="currentColor" />
                    </button>
                  </div>
                </Link>

                {/* Clickable title */}
                <Link to={`/product/${listing.listing_id || listing.id}`} className="block">
                  <h3 className="font-black text-lg px-2 text-slate-800 hover:text-[#4B99D4] transition-colors">
                    {listing.title}
                  </h3>
                </Link>

                <div className="flex justify-between items-center mt-4 px-2">
                  <p className="text-2xl font-black text-[#4B99D4]">
                    <span className="text-sm mr-0.5">₱</span>
                    {Number(listing.price).toLocaleString()}
                  </p>
                  <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-[#4B99D4] transition-all active:scale-95 shadow-lg shadow-slate-200">
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;