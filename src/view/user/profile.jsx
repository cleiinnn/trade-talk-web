import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, LogOut, Home as HomeIcon, Package,
  History, ShieldCheck, ChevronRight, Camera, LayoutGrid,
  Phone, MapPin, Pencil, Check, X, Loader2, Star, ShoppingBag,
  TrendingUp, Award, Users, CheckCircle, AlertCircle,
} from "lucide-react";
import { BASE } from "../../viewmodel/constants";
import { useValidation, phoneMessage, addressMessage } from "../../hooks/useValidation";

// ── Validation status display config ──────────────────────────────────────────
const statusConfig = {
  phone: {
    valid:   { icon: CheckCircle, label: "VERIFIED",       color: "#10b981", bg: "rgba(16,185,129,0.07)",  border: "rgba(52,211,153,0.45)" },
    invalid: { icon: AlertCircle, label: "INVALID FORMAT", color: "#f43f5e", bg: "rgba(244,63,94,0.06)",   border: "rgba(251,113,133,0.4)" },
    empty:   null,
  },
  address: {
    valid:          { icon: CheckCircle, label: "VERIFIED",          color: "#10b981", bg: "rgba(16,185,129,0.07)", border: "rgba(52,211,153,0.45)" },
    too_short:      { icon: AlertCircle, label: "TOO SHORT",         color: "#f43f5e", bg: "rgba(244,63,94,0.06)",  border: "rgba(251,113,133,0.4)" },
    no_letters:     { icon: AlertCircle, label: "INVALID — ADD STREET NAME", color: "#f43f5e", bg: "rgba(244,63,94,0.06)", border: "rgba(251,113,133,0.4)" },
    too_few_words:  { icon: AlertCircle, label: "TOO VAGUE — ADD BARANGAY & CITY", color: "#f97316", bg: "rgba(249,115,22,0.06)", border: "rgba(253,186,116,0.5)" },
    empty:          null,
  },
};

// ── Inline validation badge ────────────────────────────────────────────────────
const ValidationBadge = ({ type, status }) => {
  const cfg = statusConfig[type]?.[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1,  y:  0, scale: 1    }}
      exit={{    opacity: 0,  y: -4, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-1 mt-1.5"
    >
      <Icon size={10} style={{ color: cfg.color, flexShrink: 0 }} />
      <span style={{
        fontFamily:    "'Courier New', Courier, monospace",
        fontSize:      8,
        fontWeight:    800,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        color:         cfg.color,
      }}>
        {cfg.label}
      </span>
    </motion.div>
  );
};

// ── Validated input wrapper ────────────────────────────────────────────────────
// Wraps an input/textarea with a live glowing border and trailing badge.
const ValidatedField = ({ type, status, children }) => {
  const cfg      = statusConfig[type]?.[status];
  const isValid  = status === "valid";
  const borderColor = isValid
    ? "rgba(52,211,153,0.5)"
    : cfg
    ? "rgba(251,113,133,0.4)"
    : "#e2e8f0";

  return (
    <motion.div layout className="flex-1">
      <div style={{
        borderRadius: 10,
        border:       `1.5px solid ${borderColor}`,
        background:   isValid ? "rgba(16,185,129,0.03)" : "#f8fafc",
        transition:   "border-color 0.25s, background 0.25s",
        boxShadow:    isValid
          ? "0 0 0 3px rgba(52,211,153,0.12)"
          : cfg
          ? "0 0 0 3px rgba(251,113,133,0.08)"
          : "none",
        overflow: "hidden",
      }}>
        {children}
      </div>
      <AnimatePresence mode="wait">
        <ValidationBadge key={status} type={type} status={status} />
      </AnimatePresence>
    </motion.div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const [user] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null"); }
    catch { return null; }
  });
  const targetUserId = routeUserId ? Number(routeUserId) : Number(user?.user_id || 0);
  const isOwnProfile = Number(user?.user_id || 0) === targetUserId;

  const [profile,    setProfile]    = useState(null);
  const [publicItems,setPublicItems]= useState([]);
  const [sellItems,  setSellItems]  = useState([]);

  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState("");
  const [saveError,  setSaveError]  = useState("");

  const [reviews,     setReviews]     = useState([]);
  const [avgRating,   setAvgRating]   = useState(null);
  const [reviewCount, setReviewCount] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState(null);

  // ── Shared validation hook ─────────────────────────────────────────────────
  const {
    phone, setPhone,
    address, setAddress,
    phoneStatus, addressStatus,
    isFormValid, resetFields,
  } = useValidation(
    profile?.phone   || "",
    profile?.address || "",
  );

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "user") { navigate("/login"); return; }
    if (!targetUserId) return;
    fetchProfile();
    fetchSellItems();
    fetchReviews();
  }, [routeUserId, user, navigate, targetUserId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE}/get_user_profile.php?user_id=${targetUserId}`);
      if (res.data.success) {
        setProfile(res.data);
        setPublicItems(res.data.public_items || []);
        resetFields(res.data.phone || "", res.data.address || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchSellItems = async () => {
    const normalizeItems = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.listings)) return payload.listings;
      return [];
    };
    const onlySellListings = (items) =>
      items.filter((item) => {
        const purpose      = String(item?.purpose      || "").toLowerCase();
        const status       = String(item?.status       || "").toLowerCase();
        const availability = String(item?.availability || "available").toLowerCase();
        const stock        = Number(item?.stock ?? 1);
        return purpose === "sell" && status === "approved" && availability !== "archived" && stock > 0;
      });

    try {
      const primary      = await axios.get(`${BASE}/get_user_sell_listings.php?user_id=${targetUserId}`);
      const primaryItems = onlySellListings(normalizeItems(primary.data));
      if (primaryItems.length > 0) { setSellItems(primaryItems); return; }
      const fallback = await axios.get(`${BASE}/get_user_listings.php?user_id=${targetUserId}`);
      setSellItems(onlySellListings(normalizeItems(fallback.data)));
    } catch (err) {
      console.error("Error fetching sell items:", err);
      try {
        const fallback = await axios.get(`${BASE}/get_user_listings.php?user_id=${targetUserId}`);
        setSellItems(onlySellListings(normalizeItems(fallback.data)));
      } catch (fallbackErr) {
        console.error("Fallback fetching sell items failed:", fallbackErr);
        setSellItems([]);
      }
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${BASE}/get_user_reviews.php?user_id=${targetUserId}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
        setAvgRating(res.data.average_rating);
        setReviewCount(res.data.review_count);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleSave = async () => {
    if (!isOwnProfile) return;
    setSaveError("");
    setSaveMsg("");

    // Guard with shared validation
    if (!isFormValid) {
      setSaveError(
        phoneStatus   !== "valid" ? (phoneMessage(phoneStatus)   || "Invalid phone number.") :
        addressStatus !== "valid" ? (addressMessage(addressStatus) || "Address is too short.") :
        "Please fix the errors above."
      );
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(`${BASE}/update_user_profile.php`, {
        user_id: targetUserId,
        phone:   phone.trim(),
        address: address.trim(),
      }, { headers: { "Content-Type": "application/json" } });

      if (res.data.success) {
        setSaveMsg("Saved!");
        setEditing(false);
        setProfile(prev => ({ ...prev, phone: phone.trim(), address: address.trim() }));
        setTimeout(() => setSaveMsg(""), 2500);
      } else {
        setSaveError(res.data.message);
      }
    } catch {
      setSaveError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    resetFields(profile?.phone || "", profile?.address || "");
    setSaveError("");
    setEditing(false);
  };

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("user_id", String(targetUserId));
    formData.append("profile_picture_url", file);
    try {
      const res = await axios.post(`${BASE}/update_profile_picture.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        setProfile(prev => ({ ...prev, profile_picture_url: res.data.profile_picture_url }));
        const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
        if (storedUser) {
          storedUser.profile_picture_url = res.data.profile_picture_url;
          sessionStorage.setItem("user", JSON.stringify(storedUser));
        }
        showToast("Profile picture updated!");
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast("Upload failed.", false);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.username || user.username
    : user.username;

  const sellerReviews = reviews.filter(r => r.as_role === "seller");
  const buyerReviews  = reviews.filter(r => r.as_role === "buyer");

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1,  y:   0, scale: 1    }}
            exit={{    opacity: 0,  y: -12, scale: 0.96 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-black text-sm uppercase tracking-widest ${
              toast.success ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={18} className="rotate-180" /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight">
            {isOwnProfile ? "My Profile" : `${profile?.username || "User"}'s Profile`}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="h-20 bg-gradient-to-r from-[#4B99D4] to-[#2c6b9e]" />

              <div className="px-6 pb-6 relative">
                <div className="flex justify-center -mt-12">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                      <div className="w-full h-full bg-[#D9E9EE] rounded-xl flex items-center justify-center overflow-hidden">
                        {profile?.profile_picture_url ? (
                          <img src={profile.profile_picture_url} alt={profile.username} className="w-full h-full object-cover" />
                        ) : (
                          <User size={48} className="text-[#4B99D4]" />
                        )}
                      </div>
                    </div>
                    {isOwnProfile && (
                      <label className="absolute bottom-0 right-0 bg-[#4B99D4] text-white p-1.5 rounded-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer">
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} disabled={uploading} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="text-center mt-4">
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {profile?.username || user.username}
                  </h2>
                  {fullName !== (profile?.username || user.username) && (
                    <p className="text-sm text-slate-500 mt-0.5">{fullName}</p>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <ShieldCheck size={14} className="text-[#4B99D4]" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verified Collector</span>
                  </div>

                  {profile && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-slate-50">
                      <Award size={14} className="text-[#4B99D4]" />
                      <span className={`text-xs font-black ${
                        profile.credit_score >= 80 ? "text-emerald-600" :
                        profile.credit_score >= 50 ? "text-amber-600"   :
                        profile.credit_score >= 20 ? "text-orange-600"  :
                        "text-rose-600"
                      }`}>
                        Credit Score: {profile.credit_score}
                      </span>
                    </div>
                  )}

                  {!isOwnProfile && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => navigate("/messages", {
                          state: {
                            other_user_id:  targetUserId,
                            other_username: profile?.username || "User",
                            other_avatar:   profile?.profile_picture_url,
                          },
                        })}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-[#4B99D4] transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                      <p className="text-sm font-medium text-slate-700">{profile?.email || user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info (only own profile) */}
                {isOwnProfile && (
                  <motion.div layout className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-400 uppercase">Contact & Delivery</p>
                      {!editing ? (
                        <button
                          onClick={() => setEditing(true)}
                          className="flex items-center gap-1 text-xs font-bold text-[#4B99D4] hover:text-slate-700 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            disabled={saving || !isFormValid}
                            className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 disabled:opacity-40"
                          >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Save
                          </button>
                          <button onClick={handleCancelEdit} className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600">
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <motion.div layout className="flex items-start gap-3 mb-3">
                      <Phone
                        size={18}
                        className="flex-shrink-0 mt-2"
                        style={{ color: phoneStatus === "valid" ? "#10b981" : phoneStatus === "invalid" ? "#f43f5e" : "#94a3b8" }}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Phone</p>
                        {editing ? (
                          <ValidatedField type="phone" status={phoneStatus}>
                            <input
                              type="tel"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                              className="w-full text-sm font-medium text-slate-700 bg-transparent px-3 py-1.5 focus:outline-none"
                            />
                          </ValidatedField>
                        ) : (
                          <p className="text-sm font-medium text-slate-700">
                            {phone || <span className="italic text-slate-400">Not set</span>}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    {/* Address */}
                    <motion.div layout className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="flex-shrink-0 mt-2"
                        style={{ color: addressStatus === "valid" ? "#10b981" : addressStatus === "too_short" ? "#f43f5e" : "#94a3b8" }}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Address</p>
                        {editing ? (
                          <ValidatedField type="address" status={addressStatus}>
                            <textarea
                              value={address}
                              onChange={e => setAddress(e.target.value)}
                              placeholder="House No., Street, Barangay, City"
                              rows={2}
                              className="w-full text-sm font-medium text-slate-700 bg-transparent px-3 py-1.5 focus:outline-none resize-none"
                            />
                          </ValidatedField>
                        ) : (
                          <p className="text-sm font-medium text-slate-700">
                            {address || <span className="italic text-slate-400">Not set</span>}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    {/* Save feedback */}
                    <AnimatePresence>
                      {saveError && (
                        <motion.p
                          layout
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-bold text-red-400 mt-2"
                        >
                          {saveError}
                        </motion.p>
                      )}
                      {saveMsg && (
                        <motion.p
                          layout
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-bold text-green-500 mt-2"
                        >
                          {saveMsg}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-slate-800">{sellItems.length}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">For Sale</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-slate-800">{publicItems.length}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Showcase</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            {isOwnProfile && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400 mb-3">Quick Navigation</p>
                <div className="space-y-2">
                  <ProfileLink to="/home"     icon={<HomeIcon     size={18} />} label="Dashboard"         />
                  <ProfileLink to="/listings" icon={<Package      size={18} />} label="My Listings"       />
                  <ProfileLink to="/orders"   icon={<TrendingUp   size={18} />} label="Orders (Seller)"   />
                  <ProfileLink to="/purchase" icon={<ShoppingBag  size={18} />} label="My Requests (Buyer)" />
                  <ProfileLink to="/groups"   icon={<Users        size={18} />} label="Groups"            />
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-all"
                >
                  <LogOut size={18} /> LOGOUT
                </button>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Items for Sale */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#4B99D4]" /> Items for Sale
                </h3>
                <span className="text-xs font-bold bg-[#D9E9EE] text-[#4B99D4] px-3 py-1 rounded-full">
                  {sellItems.length}
                </span>
              </div>

              {sellItems.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                  <ShoppingBag size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No items for sale</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {sellItems.map(item => (
                    <Link to={`/product/${item.listing_id}`} key={item.listing_id} className="group">
                      <div className="aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <p className="text-xs font-black text-[#4B99D4]">₱{Number(item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Showcase */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <LayoutGrid size={20} className="text-[#4B99D4]" /> Showcase
                </h3>
                <span className="text-xs font-bold bg-[#D9E9EE] text-[#4B99D4] px-3 py-1 rounded-full">
                  {publicItems.length}
                </span>
              </div>

              {publicItems.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                  <LayoutGrid size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No showcase items</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {publicItems.map(item => (
                    <div key={item.listing_id} className="aspect-square rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Star size={20} className="text-[#4B99D4]" /> Reviews Received
                </h3>
                {avgRating && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={14} className={star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-600 ml-1">
                      {avgRating} ({reviewCount})
                    </span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                  <Star size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sellerReviews.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400 mb-3">As Seller</p>
                      <div className="space-y-3">
                        {sellerReviews.map(review => <ReviewItem key={review.review_id} review={review} />)}
                      </div>
                    </div>
                  )}
                  {buyerReviews.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400 mb-3">As Buyer</p>
                      <div className="space-y-3">
                        {buyerReviews.map(review => <ReviewItem key={review.review_id} review={review} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helper components ─────────────────────────────────────────────────────────
const ReviewItem = ({ review }) => (
  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="text-sm font-bold text-slate-800">{review.reviewer.name}</p>
        <p className="text-xs text-slate-400">@{review.reviewer.username}</p>
      </div>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(star => (
          <Star key={star} size={12} className={star <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
        ))}
      </div>
    </div>
    {review.comment && (
      <p className="text-sm text-slate-600 mt-1 italic">"{review.comment}"</p>
    )}
    <p className="text-xs text-slate-400 mt-2">
      {new Date(review.created_at).toLocaleDateString()}
      {review.transaction && (
        <span className="ml-2">· {review.transaction.type} for "{review.transaction.listing_title}"</span>
      )}
    </p>
  </div>
);

const ProfileLink = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
    <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
      <span className="text-slate-400 group-hover:text-[#4B99D4] transition-colors">{icon}</span>
      {label}
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
  </Link>
);

export default Profile;