import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, MapPin, User, Search, Eye, EyeOff,
  ImageOff, SlidersHorizontal, Lock, Globe,
} from "lucide-react";
import { BASE } from "../../viewmodel/constants";

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.055 },
  }),
};

// ─── VISIBILITY TOGGLE ───────────────────────────────────────────────────────
const VisibilityToggle = ({ isPublic, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const on = Number(isPublic) === 1;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={on ? "Set to Private" : "Set to Public"}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 10, border: "none",
        cursor: "pointer", fontSize: 9, fontWeight: 900,
        textTransform: "uppercase", letterSpacing: "0.12em",
        transition: "all 0.2s",
        ...(on
          ? {
              background: hovered ? "rgba(239,68,68,0.08)" : "rgba(75,153,212,0.07)",
              color: hovered ? "#dc2626" : "#4B99D4",
              border: `1px solid ${hovered ? "rgba(239,68,68,0.2)" : "rgba(75,153,212,0.18)"}`,
            }
          : {
              background: "rgba(100,116,139,0.07)",
              color: "#94a3b8",
              border: "1px solid rgba(100,116,139,0.15)",
            }
        ),
      }}
    >
      {on
        ? hovered ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Public</>
        : <><Lock size={11} /> Private</>
      }
    </button>
  );
};

// ─── SHOWCASE CARD ────────────────────────────────────────────────────────────
const ShowcaseCard = ({ item, index, isOwner, onToggle }) => {
  const isPublic = Number(item.is_public) === 1;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(75,153,212,0.12)" }}
      transition={{ duration: 0.25 }}
      style={{
        background: "#ffffff",
        borderRadius: 24, overflow: "hidden",
        border: "1px solid rgba(75,153,212,0.1)",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        display: "flex", flexDirection: "column",
        opacity: isPublic ? 1 : 0.8,
        position: "relative",
      }}
    >
      {/* ── Image area ── */}
      <div style={{
        height: 180, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
        flexShrink: 0,
      }}>
        {item.image_url ? (
          <img
            src={item.image_url} alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            gap: 8,
          }}>
            {/* Grid overlay */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(75,153,212,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.07) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <ImageOff size={28} color="rgba(75,153,212,0.3)" style={{ position: "relative" }} />
            <span style={{
              fontSize: 9, fontWeight: 900, color: "rgba(75,153,212,0.4)",
              textTransform: "uppercase", letterSpacing: "0.2em", position: "relative",
            }}>
              No Image
            </span>
          </div>
        )}

        {/* Private overlay badge */}
        {!isPublic && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <Lock size={28} color="rgba(255,255,255,0.6)" />
              <span style={{
                fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase", letterSpacing: "0.2em",
              }}>
                Private Vault
              </span>
            </div>
          </div>
        )}

        {/* Category pill */}
        <div style={{
          position: "absolute", bottom: 12, left: 12,
          padding: "4px 10px", borderRadius: 999,
          background: "rgba(15,23,42,0.72)", backdropFilter: "blur(8px)",
          fontSize: 9, fontWeight: 900, textTransform: "uppercase",
          letterSpacing: "0.18em", color: "#7ec8f0",
          border: "1px solid rgba(75,153,212,0.2)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Layers size={9} />
          {item.category_name || "Uncategorized"}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Title + visibility toggle row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h3 style={{
            fontSize: 15, fontWeight: 900, color: "#0f172a",
            margin: 0, lineHeight: 1.3, flex: 1,
          }}>
            {item.title}
          </h3>
          {isOwner && (
            <VisibilityToggle
              isPublic={item.is_public}
              onClick={() => onToggle(item.listing_id)}
            />
          )}
        </div>

        {/* Location */}
        {item.location_name && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 600, color: "#64748b",
            marginBottom: 14,
          }}>
            <MapPin size={12} color="#94a3b8" />
            {item.location_name}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9", marginBottom: 14, marginTop: "auto" }} />

        {/* Footer: collector + date */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {item.profile_picture_url ? (
              <img
                src={item.profile_picture_url} alt=""
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
              />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #4B99D4, #1e293b)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User size={13} color="#ffffff" />
              </div>
            )}
            <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {item.collector_name}
            </span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            {new Date(item.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── FILTER PILL ─────────────────────────────────────────────────────────────
const FilterPill = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 16px", borderRadius: 10, border: "none",
      fontSize: 11, fontWeight: 800, cursor: "pointer",
      textTransform: "uppercase", letterSpacing: "0.1em",
      transition: "all 0.18s",
      ...(active
        ? { background: "#0f172a", color: "#ffffff" }
        : { background: "#f1f5f9", color: "#64748b" }
      ),
    }}
  >
    {Icon && <Icon size={12} />}
    {label}
  </button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Showcase = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filter, setFilter] = useState("all"); // all | public | private
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(() => {
    const s = sessionStorage.getItem("user");
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  }, []);

  useEffect(() => {
    const fetchShowcase = async () => {
      if (!currentUser?.user_id) { setItems([]); setLoading(false); return; }
      try {
        const res = await axios.get(`${BASE}/get_showcase.php?user_id=${currentUser.user_id}`);
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching showcase:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowcase();
  }, [currentUser]);

  const handleToggleVisibility = async (listingId) => {
    if (!currentUser?.user_id) return;
    try {
      const res = await axios.post(`${BASE}/toggle_visibility.php`, {
        listing_id: listingId, user_id: currentUser.user_id,
      });
      if (!res?.data?.success) return;
      setItems(prev =>
        prev.map(item =>
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

  const filteredItems = items.filter(item => {
    const title = (item?.title ?? "").toLowerCase();
    const category = (item?.category_name ?? "").toLowerCase();
    const needle = searchTerm.toLowerCase();
    const matchesSearch = title.includes(needle) || category.includes(needle);
    const matchesFilter =
      filter === "all" ? true :
      filter === "public" ? Number(item.is_public) === 1 :
      Number(item.is_public) === 0;
    return matchesSearch && matchesFilter;
  });

  const publicCount = items.filter(i => Number(i.is_public) === 1).length;
  const privateCount = items.filter(i => Number(i.is_public) === 0).length;

  return (
    <div style={{
      minHeight: "100vh", background: "#F6FAFD",
      fontFamily: "sans-serif", position: "relative",
    }}>
      {/* ── Atmospheric background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-5%", right: "-5%",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(75,153,212,0.08) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(75,153,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.04) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }} />
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 28px", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 36 }}
        >
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 900, color: "#4B99D4", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 5px" }}>
                Collector Gallery
              </p>
              <h1 style={{
                fontSize: 36, fontWeight: 900, color: "#0f172a",
                margin: "0 0 6px", letterSpacing: "-0.04em",
                textTransform: "uppercase", fontStyle: "italic", lineHeight: 1,
              }}>
                The Vault
              </h1>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: 0 }}>
                Verified collector showcases — your collection, curated.
              </p>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{
                padding: "12px 18px", borderRadius: 14,
                background: "#ffffff", border: "1px solid rgba(75,153,212,0.12)",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>{items.length}</p>
                <p style={{ fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", margin: "4px 0 0" }}>Total</p>
              </div>
              <div style={{
                padding: "12px 18px", borderRadius: 14,
                background: "#ffffff", border: "1px solid rgba(75,153,212,0.12)",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#4B99D4", margin: 0, lineHeight: 1 }}>{publicCount}</p>
                <p style={{ fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", margin: "4px 0 0" }}>Public</p>
              </div>
              <div style={{
                padding: "12px 18px", borderRadius: 14,
                background: "#ffffff", border: "1px solid rgba(75,153,212,0.12)",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#64748b", margin: 0, lineHeight: 1 }}>{privateCount}</p>
                <p style={{ fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", margin: "4px 0 0" }}>Private</p>
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div style={{
            background: "#ffffff", borderRadius: 20, padding: "14px 18px",
            display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
            border: "1px solid rgba(75,153,212,0.1)",
            boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
          }}>
            {/* Search */}
            <div style={{ flex: "1 1 220px", position: "relative" }}>
              <Search size={14} style={{
                position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                color: searchFocused ? "#4B99D4" : "#94a3b8", transition: "color 0.2s",
                pointerEvents: "none",
              }} />
              <input
                type="text" placeholder="Search the collection…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 14px 10px 38px", borderRadius: 11,
                  fontSize: 13, fontWeight: 600, color: "#0f172a",
                  background: searchFocused ? "#ffffff" : "#f8fafc",
                  border: `1.5px solid ${searchFocused ? "#4B99D4" : "#e2e8f0"}`,
                  boxShadow: searchFocused ? "0 0 0 4px rgba(75,153,212,0.1)" : "none",
                  outline: "none", transition: "all 0.2s",
                }}
              />
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: "#e2e8f0", flexShrink: 0 }} />

            {/* Visibility filters */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <SlidersHorizontal size={13} color="#94a3b8" />
              <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} />
              <FilterPill label="Public" icon={Globe} active={filter === "public"} onClick={() => setFilter("public")} />
              <FilterPill label="Private" icon={Lock} active={filter === "private"} onClick={() => setFilter("private")} />
            </div>

            {/* Result count */}
            {filteredItems.length > 0 && (
              <p style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Gallery grid ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "3px solid rgba(75,153,212,0.2)",
                borderTopColor: "#4B99D4",
              }} />
            </motion.div>
            <p style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Loading Collection…
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              background: "#ffffff", borderRadius: 24,
              border: "2px dashed rgba(75,153,212,0.15)",
              padding: "80px 40px", textAlign: "center",
            }}
          >
            <ImageOff size={48} color="rgba(75,153,212,0.2)" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 18, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
              No Items Found
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", margin: 0 }}>
              {searchTerm ? "Try a different search term." : "Your vault is empty."}
            </p>
          </motion.div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {filteredItems.map((item, i) => (
              <ShowcaseCard
                key={item.listing_id}
                item={item}
                index={i}
                isOwner={isOwnedByCurrentUser(item)}
                onToggle={handleToggleVisibility}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Showcase;