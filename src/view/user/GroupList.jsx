import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Users, Search, PlusCircle, Filter, ArrowLeft,
  UserPlus, UserMinus, Loader2, ChevronRight,
} from 'lucide-react';
import { BASE } from "../../viewmodel/constants";

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
  }),
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '14px 22px', borderRadius: 16,
          fontWeight: 900, fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          background: toast.success ? '#0f172a' : '#dc2626',
          color: '#ffffff',
          boxShadow: '0 8px 28px rgba(15,23,42,0.25)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: toast.success ? '#4ade80' : '#fca5a5',
          flexShrink: 0,
        }} />
        {toast.msg}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── GROUP CARD ───────────────────────────────────────────────────────────────
const GroupCard = ({ group, index, onJoin, onLeave }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const isMember = !!group.user_role;

  const handle = async (fn) => {
    setActionLoading(true);
    await fn(group.group_id);
    setActionLoading(false);
  };

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(75,153,212,0.1)' }}
      transition={{ duration: 0.25 }}
      style={{
        background: '#ffffff', borderRadius: 24, overflow: 'hidden',
        border: '1px solid rgba(75,153,212,0.1)',
        boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Image / gradient banner */}
      <div style={{
        height: 120, position: 'relative', overflow: 'hidden',
        background: group.image_url
          ? 'transparent'
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0c1829 100%)',
        flexShrink: 0,
      }}>
        {group.image_url ? (
          <img
            src={group.image_url} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <>
            {/* grid overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(75,153,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              opacity: 0.15,
            }}>
              <Users size={40} color="#4B99D4" />
            </div>
          </>
        )}

        {/* Category badge */}
        <div style={{
          position: 'absolute', bottom: 12, left: 14,
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)',
          fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.18em', color: '#7ec8f0',
          border: '1px solid rgba(75,153,212,0.2)',
        }}>
          {group.category_name || 'General'}
        </div>

        {/* Member badge */}
        {isMember && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(16,185,129,0.15)', backdropFilter: 'blur(8px)',
            fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.15em', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            ✓ Joined
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/groups/${group.group_id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: 16, fontWeight: 900, color: '#0f172a',
            margin: '0 0 6px', lineHeight: 1.2,
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = '#4B99D4'}
            onMouseLeave={e => e.target.style.color = '#0f172a'}
          >
            {group.name}
          </h3>
        </Link>

        <p style={{
          fontSize: 12, color: '#64748b', fontWeight: 500,
          lineHeight: 1.6, margin: '0 0 16px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          flex: 1,
        }}>
          {group.description || 'No description provided.'}
        </p>

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={12} color="#94a3b8" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
              {group.member_count} {Number(group.member_count) === 1 ? 'member' : 'members'}
            </span>
          </div>

          <button
            onClick={() => isMember ? handle(onLeave) : handle(onJoin)}
            disabled={actionLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10, border: 'none',
              fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.14em', cursor: actionLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              ...(isMember
                ? { background: 'rgba(239,68,68,0.07)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }
                : { background: 'linear-gradient(135deg, #4B99D4, #2563eb)', color: '#ffffff', boxShadow: '0 4px 14px rgba(75,153,212,0.3)' }
              ),
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            {actionLoading
              ? <Loader2 size={12} style={{ animation: 'spin 0.75s linear infinite' }} />
              : isMember
                ? <><UserMinus size={12} /> Leave</>
                : <><UserPlus size={12} /> Join</>
            }
          </button>
        </div>

        {/* Created date */}
        <p style={{
          fontSize: 9, fontWeight: 700, color: '#cbd5e1',
          textTransform: 'uppercase', letterSpacing: '0.15em',
          marginTop: 12,
        }}>
          Created {new Date(group.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const GroupList = () => {
  void motion;
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const [user] = useState(() => JSON.parse(sessionStorage.getItem('user')));

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }

    fetchCategories();
  }, [navigate, user]);

  useEffect(() => {
    if (!user || user.role !== 'user') {
      return;
    }

    fetchGroups();
  }, [selectedCategory, user]);

  useEffect(() => () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE}/get_meta.php`);
      setCategories(res.data.categories || []);
    } catch (err) { console.error('Failed to fetch categories', err); }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const uid = user?.user_id;
      const url = selectedCategory
        ? `${BASE}/get_groups.php?user_id=${uid}&category=${selectedCategory}`
        : `${BASE}/get_groups.php?user_id=${uid}`;
      const res = await axios.get(url);
      if (res.data.success) setGroups(res.data.groups);
    } catch (err) { console.error('Failed to fetch groups', err); }
    finally { setLoading(false); }
  };

  const showToast = (msg, success = true) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ msg, success });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  const handleJoin = async (groupId) => {
    try {
      const res = await axios.post(`${BASE}/join_group.php`, { group_id: groupId, user_id: user.user_id });
      if (res.data.success) { showToast('Joined group!'); fetchGroups(); }
      else showToast(res.data.message, false);
    } catch { showToast('Server error', false); }
  };

  const handleLeave = async (groupId) => {
    try {
      const res = await axios.post(`${BASE}/leave_group.php`, { group_id: groupId, user_id: user.user_id });
      if (res.data.success) { showToast('Left group'); fetchGroups(); }
      else showToast(res.data.message, false);
    } catch { showToast('Server error', false); }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
  );

  const joinedCount = groups.filter(g => g.user_role).length;

  return (
    <div style={{
      minHeight: '100vh', background: '#F6FAFD',
      fontFamily: 'sans-serif', position: 'relative',
    }}>
      <Toast toast={toast} />

      {/* ── Atmospheric background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-5%', right: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(75,153,212,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(75,153,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.04) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}
        >
          {/* Back + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 12,
                background: '#ffffff', cursor: 'pointer',
                fontSize: 12, fontWeight: 800, color: '#64748b',
                boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                border: '1px solid rgba(75,153,212,0.1)',
              }}
            >
              <ArrowLeft size={15} /> Home
            </button>

            <div>
              <p style={{ fontSize: 10, fontWeight: 900, color: '#4B99D4', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 3px' }}>
                Community
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em', textTransform: 'uppercase', fontStyle: 'italic' }}>
                Hobby Groups
              </h1>
            </div>
          </div>

          {/* Stats + Create */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {joinedCount > 0 && (
              <div style={{
                padding: '9px 16px', borderRadius: 12,
                background: 'rgba(75,153,212,0.07)', border: '1px solid rgba(75,153,212,0.15)',
                fontSize: 11, fontWeight: 800, color: '#4B99D4',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {joinedCount} Joined
              </div>
            )}
            <button
              onClick={() => navigate('/groups/create')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #4B99D4 0%, #2563eb 100%)',
                color: '#ffffff', fontWeight: 900, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.15em',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(75,153,212,0.3)',
              }}
            >
              <PlusCircle size={15} /> Create Group
            </button>
          </div>
        </motion.div>

        {/* ── Filters bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{
            background: '#ffffff', borderRadius: 20, padding: '16px 20px',
            display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
            marginBottom: 28, border: '1px solid rgba(75,153,212,0.1)',
            boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
          }}
        >
          {/* Search */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: searchFocused ? '#4B99D4' : '#94a3b8', transition: 'color 0.2s',
              pointerEvents: 'none',
            }} />
            <input
              type="text" placeholder="Search groups…"
              value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '11px 14px 11px 40px', borderRadius: 12,
                fontSize: 13, fontWeight: 600, color: '#0f172a',
                background: searchFocused ? '#ffffff' : '#f8fafc',
                border: `1.5px solid ${searchFocused ? '#4B99D4' : '#e2e8f0'}`,
                boxShadow: searchFocused ? '0 0 0 4px rgba(75,153,212,0.1)' : 'none',
                outline: 'none', transition: 'all 0.2s',
              }}
            />
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: '#e2e8f0', flexShrink: 0 }} />

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={13} color="#94a3b8" />
            {[{ category_id: '', category_name: 'All' }, ...categories].map(cat => {
              const isActive = selectedCategory === cat.category_id;
              return (
                <button
                  key={cat.category_id || 'all'}
                  onClick={() => setSelectedCategory(cat.category_id)}
                  style={{
                    padding: '7px 14px', borderRadius: 10, border: 'none',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    transition: 'all 0.18s',
                    ...(isActive
                      ? { background: '#0f172a', color: '#ffffff' }
                      : { background: '#f1f5f9', color: '#64748b' }
                    ),
                  }}
                >
                  {cat.category_name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Results count ── */}
        {!loading && filteredGroups.length > 0 && (
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
            {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 size={36} color="#4B99D4" />
            </motion.div>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Loading Groups…
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              background: '#ffffff', borderRadius: 24,
              border: '2px dashed rgba(75,153,212,0.15)',
              padding: '80px 40px', textAlign: 'center',
            }}
          >
            <Users size={48} color="rgba(75,153,212,0.2)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 18, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              No Groups Found
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', margin: '0 0 24px' }}>
              {search ? 'Try a different search term.' : 'Be the first to create one!'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/groups/create')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #4B99D4, #2563eb)',
                  color: '#ffffff', fontWeight: 900, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(75,153,212,0.3)',
                }}
              >
                <PlusCircle size={14} /> Create First Group
              </button>
            )}
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {filteredGroups.map((group, i) => (
              <GroupCard
                key={group.group_id}
                group={group}
                index={i}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))}
          </div>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default GroupList;
