import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Filter,
  RefreshCw,
  Package,
  Repeat2,
  User,
  Search
} from "lucide-react";

import { BASE } from "../../viewmodel/constants";

const AdminTransactions = () => {
  useAdminAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    user_id: "",
    start_date: "",
    end_date: "",
  });
  const [users, setUsers] = useState([]); // for user filter dropdown

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const res = await axios.get(`${BASE}/get_transactions.php?${params}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE}/get_users.php`, {
        withCredentials: true,
      });
      const nextUsers = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.users)
          ? res.data.users
          : [];
      setUsers(nextUsers);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const resetFilters = () => {
    setFilters({ type: "", user_id: "", start_date: "", end_date: "" });
    setTimeout(() => fetchTransactions(), 0);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans">
      {/* Header */}
      <div className="bg-slate-900 px-8 py-6 shadow-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/Admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-[#4B99D4]">
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">
              Transaction History
            </h2>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mt-0.5">
              Trade & Talk Systems
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
        {/* Filters */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
            >
              <option value="">All</option>
              <option value="buy">Buy</option>
              <option value="trade">Trade</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">User</label>
            <select
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.first_name} {u.last_name} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">End Date</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#4B99D4] text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md flex items-center gap-2"
            >
              <Search size={16} /> Filter
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </form>

        {/* Transactions Table */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin text-[#4B99D4]"><Package size={32} /></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center">
            <Package size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black italic uppercase tracking-widest">No transactions found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Buyer</th>
                    <th className="px-6 py-4">Seller</th>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Offered (Trade)</th>
                    <th className="px-6 py-4">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.transaction_id} className="bg-slate-50 hover:bg-slate-100 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-black text-slate-400">#{tx.transaction_id}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">
                        {new Date(tx.completed_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          tx.transaction_type === 'buy' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-purple-50 text-purple-600 border border-purple-200'
                        }`}>
                          {tx.transaction_type === 'buy' ? <Package size={12} /> : <Repeat2 size={12} />}
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-800">{tx.buyer_first} {tx.buyer_last}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">@{tx.buyer_username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-800">{tx.seller_first} {tx.seller_last}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">@{tx.seller_username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img src={tx.listing_image} alt={tx.listing_title} className="w-8 h-8 rounded object-cover" />
                          <span className="text-xs font-bold text-slate-700">{tx.listing_title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.offered_title ? (
                          <div className="flex items-center gap-2">
                            <img src={tx.offered_image} alt={tx.offered_title} className="w-8 h-8 rounded object-cover" />
                            <span className="text-xs font-bold text-slate-700">{tx.offered_title}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-[#4B99D4]">
                        ₱{Number(tx.listing_price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;