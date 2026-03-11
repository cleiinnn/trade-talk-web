import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Image, Loader2, X } from 'lucide-react';

import { BASE } from "../../viewmodel/constants";

const CreateGroup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE}/get_meta.php`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE}/create_group.php`,
        {
          user_id: user.user_id,
          name: name.trim(),
          description: description.trim() || null,
          category_id: categoryId || null,
          image_url: imageUrl.trim() || null,
        }
      );
      if (res.data.success) {
        navigate(`/groups/${res.data.group_id}`);
      } else {
        setError(res.data.message || 'Failed to create group.');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100"
          >
            <ArrowLeft size={18} /> Back to Groups
          </button>
          <h1 className="text-2xl font-black text-slate-800">Create New Group</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
              Group Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hot Wheels Collectors PH"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4B99D4]/20 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
            >
              <option value="">Select a category (optional)</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL (simple input; could be file upload later) */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/group-image.jpg"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">Optional cover image URL</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#4B99D4] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;