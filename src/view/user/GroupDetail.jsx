import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Users, Calendar, User, Send,
  Trash2, Loader2, MessageCircle, Shield, UserPlus, UserMinus
} from 'lucide-react';

import { BASE } from "../../viewmodel/constants";

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const bottomRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/get_group.php?group_id=${groupId}&user_id=${user.user_id}`);
      if (res.data.success) {
        setGroup(res.data.group);
      } else {
        setToast({ msg: res.data.message, success: false });
      }
    } catch {
      setToast({ msg: 'Failed to load group', success: false });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  const handleJoin = async () => {
    try {
      const res = await axios.post(
        `${BASE}/join_group.php`,
        { group_id: groupId, user_id: user.user_id }
      );
      if (res.data.success) {
        showToast('Joined group!');
        fetchGroup();
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast('Server error', false);
    }
  };

  const handleLeave = async () => {
    try {
      const res = await axios.post(
        `${BASE}/leave_group.php`,
        { group_id: groupId, user_id: user.user_id }
      );
      if (res.data.success) {
        showToast('Left group');
        fetchGroup();
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast('Server error', false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE}/create_post.php`,
        { group_id: groupId, content: postContent.trim(), user_id: user.user_id }
      );
      if (res.data.success) {
        setPostContent('');
        fetchGroup(); // refresh posts
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast('Server error', false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await axios.post(
        `${BASE}/delete_post.php`,
        { post_id: postId, user_id: user.user_id }
      );
      if (res.data.success) {
        showToast('Post deleted');
        fetchGroup();
      } else {
        showToast(res.data.message, false);
      }
    } catch {
      showToast('Server error', false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#4B99D4]" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 font-bold">Group not found</p>
        <button onClick={() => navigate('/groups')} className="px-6 py-3 bg-slate-900 text-white rounded-xl">
          Back to Groups
        </button>
      </div>
    );
  }

  const isMember = !!group.user_role;
  const isAdmin = group.user_role === 'admin';

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
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100"
          >
            <ArrowLeft size={18} /> All Groups
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-800">{group.name}</h1>
            <p className="text-[10px] font-black uppercase text-slate-400">{group.category_name || 'Uncategorized'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Group info + Members */}
          <div className="lg:col-span-1 space-y-6">
            {/* Group Info Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#D9E9EE] rounded-xl">
                  <Users size={24} className="text-[#4B99D4]" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Members</p>
                  <p className="text-2xl font-black text-slate-800">{group.member_count}</p>
                </div>
              </div>
              {group.description && (
                <p className="text-sm text-slate-600 border-t border-slate-100 pt-4 mt-2">{group.description}</p>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={12} /> Created {new Date(group.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Join/Leave button */}
              {isMember ? (
                <button
                  onClick={handleLeave}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100"
                >
                  <UserMinus size={16} /> Leave Group
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-[#4B99D4] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600"
                >
                  <UserPlus size={16} /> Join Group
                </button>
              )}
            </div>

            {/* Members List Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Users size={16} /> Members ({group.member_count})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {group.members && group.members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#4B99D4] flex items-center justify-center text-white font-bold text-xs">
                        {member.first_name?.[0] || member.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-[10px] text-slate-400">@{member.username}</p>
                      </div>
                    </div>
                    {member.role === 'admin' && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <MessageCircle size={16} /> Discussions
              </h2>

              {/* Post form (only for members) */}
              {isMember ? (
                <form onSubmit={handleCreatePost} className="mb-8">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#4B99D4]/20 resize-none"
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#4B99D4] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Post
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center mb-6">
                  <p className="text-xs font-bold text-amber-600">You must join the group to post.</p>
                </div>
              )}

              {/* Posts List */}
              <div className="space-y-4">
                {group.posts && group.posts.length > 0 ? (
                  group.posts.map((post) => (
                    <div key={post.post_id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#4B99D4] flex items-center justify-center text-white font-bold text-xs">
                            {post.first_name?.[0] || post.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {post.first_name} {post.last_name} <span className="text-xs font-normal text-slate-400">@{post.username}</span>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(post.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {(post.user_id === user.user_id || isAdmin) && (
                          <button
                            onClick={() => handleDeletePost(post.post_id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-slate-400 italic">No posts yet. Be the first to post!</p>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;