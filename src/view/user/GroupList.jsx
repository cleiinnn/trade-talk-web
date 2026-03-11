import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Search, PlusCircle, Filter, ArrowLeft,
  UserPlus, UserMinus, Loader2
} from 'lucide-react';

import { BASE } from "../../viewmodel/constants";

const GroupList = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toast, setToast] = useState(null);

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchGroups();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE}/get_meta.php`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const uid = user?.user_id;
      const url = selectedCategory
        ? `${BASE}/get_groups.php?user_id=${uid}&category=${selectedCategory}`
        : `${BASE}/get_groups.php?user_id=${uid}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setGroups(res.data.groups);
      }
    } catch (err) {
      console.error('Failed to fetch groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [selectedCategory]);

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  const handleJoin = async (groupId) => {
    try {
      const res = await axios.post(
        `${BASE}/join_group.php`,
        { group_id: groupId, user_id: user.user_id }
      );
      if (res.data.success) {
        showToast('Joined group!');
        fetchGroups(); // refresh list
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast('Server error', false);
    }
  };

  const handleLeave = async (groupId) => {
    try {
      const res = await axios.post(
        `${BASE}/leave_group.php`,
        { group_id: groupId, user_id: user.user_id }
      );
      if (res.data.success) {
        showToast('Left group');
        fetchGroups();
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast('Server error', false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-black text-sm uppercase tracking-widest ${
          toast.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100"
          >
            <ArrowLeft size={18} /> Home
          </button>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic">Hobby Groups</h1>
          <button
            onClick={() => navigate('/groups/create')}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#4B99D4] transition-all"
          >
            <PlusCircle size={18} /> Create Group
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px] relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Group Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#4B99D4]" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black italic uppercase">No groups found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <div
                key={group.group_id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Optional image */}
                {group.image_url && (
                  <img src={group.image_url} alt="" className="w-full h-32 object-cover" />
                )}
                <div className="p-6">
                  <Link to={`/groups/${group.group_id}`}>
                    <h3 className="text-xl font-black text-slate-800 mb-1 hover:text-[#4B99D4]">
                      {group.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                    {group.category_name || 'Uncategorized'} · {group.member_count} members
                  </p>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {group.description || 'No description'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </span>
                    {group.user_role ? (
                      <button
                        onClick={() => handleLeave(group.group_id)}
                        className="flex items-center gap-1 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100"
                      >
                        <UserMinus size={14} /> Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(group.group_id)}
                        className="flex items-center gap-1 px-4 py-2 bg-[#4B99D4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600"
                      >
                        <UserPlus size={14} /> Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupList;