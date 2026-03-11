import React, { useEffect, useState } from "react";
import { getUsers, toggleUserStatus } from "../../viewmodel/api";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import {
  LogOut,
  ShieldAlert,
  Mail,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  RefreshCcw,
  Shield,
  ChevronUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-3xl font-black text-slate-900 leading-none mt-0.5">{value}</p>
      {sub && <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
      status === "blocked"
        ? "bg-rose-50 text-rose-600 border-rose-200"
        : "bg-emerald-50 text-emerald-600 border-emerald-200"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${status === "blocked" ? "bg-rose-500" : "bg-emerald-500"}`} />
    {status}
  </span>
);

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span
    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
      role === "admin"
        ? "bg-amber-50 text-amber-600 border-amber-200"
        : "bg-sky-50 text-sky-600 border-sky-200"
    }`}
  >
    {role}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Admin = () => {
  useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchAllUsers = async (force = false) => {
    try {
      if (!force) {
        const saved = JSON.parse(sessionStorage.getItem("users"));
        if (Array.isArray(saved) && saved.length > 0) {
          setUsers(saved);
          setLoading(false);
          return;
        }
      }
      const data = await getUsers();
      const nextUsers = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
          ? data.users
          : [];
      setUsers(nextUsers);
      sessionStorage.setItem("users", JSON.stringify(nextUsers));
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    sessionStorage.removeItem("users");
    await fetchAllUsers(true);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "unblocked" ? "blocked" : "unblocked";
    try {
      const res = await toggleUserStatus(user.user_id, newStatus);
      if (res.success) {
        const updated = users.map((u) =>
          u.user_id === user.user_id ? { ...u, status: newStatus } : u
        );
        setUsers(updated);
        sessionStorage.setItem("users", JSON.stringify(updated));
      } else {
        alert(res.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while updating status");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  // ── Derived Stats ────────────────────────────────────────────────────────────
  const totalUsers = users.filter((u) => u.role !== "admin").length;
  const blockedUsers = users.filter((u) => u.status === "blocked").length;
  const activeUsers = users.filter((u) => u.status === "unblocked" && u.role !== "admin").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  // ── Chart: registrations per month ──────────────────────────────────────────
  const monthlyData = (() => {
    const map = {};
    users.forEach((u) => {
      const d = new Date(u.created_at);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .slice(-6)
      .map(([month, count]) => ({ month, count }));
  })();

  // ── Pie: blocked vs active ───────────────────────────────────────────────────
  const pieData = [
    { name: "Active", value: activeUsers },
    { name: "Blocked", value: blockedUsers },
  ];
  const PIE_COLORS = ["#4B99D4", "#f43f5e"];

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 px-8 py-6 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#4B99D4] p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <ShieldAlert size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
                Admin Dashboard
              </h2>
              <p className="text-[10px] font-black text-[#D9E9EE] tracking-[0.3em] uppercase mt-1">
                Trade & Talk Systems
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5"
            >
              <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              to="/statusreview"
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5"
            >
              Status Review
            </Link>
            <Link to="/admin/reports" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5">
              Reports
            </Link>
            <Link to="/admin/transactions" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5">
              Transactions
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">

        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total Users"
              value={totalUsers}
              sub="Registered collectors"
              color="bg-[#4B99D4]"
            />
            <StatCard
              icon={UserCheck}
              label="Active"
              value={activeUsers}
              sub="Unblocked accounts"
              color="bg-emerald-500"
            />
            <StatCard
              icon={UserX}
              label="Blocked"
              value={blockedUsers}
              sub="Restricted accounts"
              color="bg-rose-500"
            />
            <StatCard
              icon={Shield}
              label="Admins"
              value={adminCount}
              sub="System administrators"
              color="bg-amber-500"
            />
          </div>
        )}

        {/* ── CHARTS ROW ───────────────────────────────────────────────────── */}
        {!loading && !error && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Area Chart */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growth</p>
                  <h4 className="text-base font-black text-slate-800 uppercase italic">User Registrations</h4>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-black">
                  <ChevronUp size={14} />
                  Last 6 months
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B99D4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4B99D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "none", borderRadius: 12, color: "#fff", fontSize: 11, fontWeight: 700 }}
                    cursor={{ stroke: "#4B99D4", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#4B99D4" strokeWidth={2.5} fill="url(#colorCount)" dot={{ r: 4, fill: "#4B99D4", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Breakdown</p>
                <h4 className="text-base font-black text-slate-800 uppercase italic">User Status</h4>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "none", borderRadius: 12, color: "#fff", fontSize: 11, fontWeight: 700 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-[10px] font-black text-slate-500 uppercase">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING / ERROR ───────────────────────────────────────────────── */}
        {loading && (
          <div className="py-20 text-center animate-pulse">
            <p className="text-xl font-black text-slate-400 uppercase tracking-widest italic">Loading users...</p>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}
        {!loading && !error && users.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 italic font-bold">No users found in the system.</p>
          </div>
        )}

        {/* ── USER TABLE ───────────────────────────────────────────────────── */}
        {!loading && !error && users.length > 0 && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            {/* Table Header */}
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Directory</p>
                <h3 className="text-base font-black text-slate-800 uppercase italic">Registered Collectors</h3>
              </div>
              <span className="bg-[#D9E9EE] text-[#4B99D4] px-4 py-1 rounded-full text-xs font-black border border-[#4B99D4]/10">
                {users.length} TOTAL
              </span>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-5 pb-2">#</th>
                    <th className="px-5 pb-2">Name & Info</th>
                    <th className="px-5 pb-2">Username</th>
                    <th className="px-5 pb-2">Role</th>
                    <th className="px-5 pb-2">Status</th>
                    <th className="px-5 pb-2">Joined</th>
                    <th className="px-5 pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.user_id}
                      className="group bg-slate-50 hover:bg-[#D9E9EE]/30 transition-all"
                    >
                      <td className="px-5 py-4 rounded-l-xl text-xs font-black text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Mail size={9} /> {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                          @{user.username}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 rounded-r-xl text-right">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white transition-all ${
                              user.status === "unblocked"
                                ? "bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-200"
                                : "bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200"
                            }`}
                          >
                            {user.status === "unblocked" ? "Block" : "Unblock"}
                          </button>
                        )}
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

export default Admin;
