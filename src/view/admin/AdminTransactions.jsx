import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import axios from "axios";
import {
  ArrowLeft,
  RefreshCw,
  Package,
  Repeat2,
  User,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  Ban,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import { BASE } from "../../viewmodel/constants";

// ─── Status config ────────────────────────────────────────────────────────────

const REQUEST_STATUS = {
  pending:   { label: "Pending",   color: "bg-yellow-50 text-yellow-700 border-yellow-200",  Icon: Clock        },
  accepted:  { label: "Accepted",  color: "bg-blue-50 text-blue-700 border-blue-200",        Icon: CheckCircle  },
  declined:  { label: "Declined",  color: "bg-red-50 text-red-700 border-red-200",           Icon: XCircle      },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500 border-slate-200",    Icon: Ban          },
  completed: { label: "Completed", color: "bg-green-50 text-green-700 border-green-200",     Icon: CheckCircle  },
};

const ORDER_STATUS = {
  placed:    { label: "Placed",    color: "bg-sky-50 text-sky-700 border-sky-200",           Icon: ShoppingCart },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200",        Icon: CheckCircle  },
  shipped:   { label: "Shipped",   color: "bg-indigo-50 text-indigo-700 border-indigo-200",  Icon: Truck        },
  completed: { label: "Completed", color: "bg-green-50 text-green-700 border-green-200",     Icon: CheckCircle  },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200",           Icon: Ban          },
  no_show:   { label: "No Show",   color: "bg-orange-50 text-orange-700 border-orange-200",  Icon: AlertCircle  },
  returned:  { label: "Returned",  color: "bg-purple-50 text-purple-700 border-purple-200",  Icon: RefreshCw    },
};

// ─── Small reusable components ────────────────────────────────────────────────

const StatusBadge = ({ status, map }) => {
  const cfg = map[status] || { label: status, color: "bg-slate-100 text-slate-500 border-slate-200", Icon: AlertCircle };
  const { label, color, Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${color}`}>
      <Icon size={11} />
      {label}
    </span>
  );
};

const UserCell = ({ first, last, username }) => (
  <div>
    <div className="flex items-center gap-1.5">
      <User size={13} className="text-slate-400 flex-shrink-0" />
      <span className="text-sm font-bold text-slate-800 whitespace-nowrap">{first} {last}</span>
    </div>
    <span className="text-[10px] text-slate-400 pl-[19px]">@{username}</span>
  </div>
);

const ItemCell = ({ image, title, price, note }) => (
  <div className="flex items-center gap-2 min-w-[140px]">
    {image ? (
      <img src={image} alt={title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
    ) : (
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Package size={14} className="text-slate-300" />
      </div>
    )}
    <div>
      <p className="text-xs font-bold text-slate-700 leading-tight">{title}</p>
      {price !== undefined && price !== null && (
        <p className="text-[10px] text-slate-400 font-semibold">₱{Number(price).toLocaleString()}</p>
      )}
      {note && <p className="text-[10px] text-slate-400 italic">"{note}"</p>}
    </div>
  </div>
);

const StatCard = ({ label, value, color, Icon }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-800">{value ?? "—"}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  </div>
);

// ─── Expandable row detail panel ──────────────────────────────────────────────

const DetailPanel = ({ row }) => (
  <tr>
    <td colSpan={9} className="px-6 pb-4 pt-0">
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Request</p>
          <p className="font-bold text-slate-700">#{row.request_id} — {row.request_type}</p>
          <p className="text-slate-500">{new Date(row.request_date).toLocaleString()}</p>
          {row.message && <p className="italic text-slate-500 mt-1">"{row.message}"</p>}
          {row.quantity > 1 && <p className="text-slate-500">Qty: {row.quantity}</p>}
        </div>

        {row.order_id && (
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Order #{row.order_id}</p>
            <p className="font-bold text-slate-700">{row.payment_method?.toUpperCase()}</p>
            <p className="text-slate-500">Shipping: ₱{Number(row.shipping_fee).toLocaleString()}</p>
            <p className="font-bold text-slate-700">Total: ₱{Number(row.total_amount).toLocaleString()}</p>
            {row.shipped_at && <p className="text-slate-500">Shipped: {new Date(row.shipped_at).toLocaleString()}</p>}
            {row.order_note && <p className="italic text-slate-500 mt-1">"{row.order_note}"</p>}
          </div>
        )}

        {row.transaction_id && (
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Transaction #{row.transaction_id}</p>
            <p className="font-bold text-green-600">Completed</p>
            <p className="text-slate-500">{new Date(row.completed_at).toLocaleString()}</p>
          </div>
        )}

        {row.offered_title && (
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Offered Item</p>
            <ItemCell image={row.offered_image} title={row.offered_title} price={row.offered_price} />
          </div>
        )}
      </div>
    </td>
  </tr>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AdminTransactions = () => {
  useAdminAuth();

  const [activities, setActivities]   = useState([]);
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortField, setSortField]     = useState("request_date");
  const [sortDir, setSortDir]         = useState("desc");

  const [filters, setFilters] = useState({
    type: "", status: "", user_id: "", start_date: "", end_date: "",
  });
  const [users, setUsers] = useState([]);

  // ── Active tab drives a quick status pre-filter ──
  const [activeTab, setActiveTab] = useState("all");
  const TABS = [
    { key: "all",       label: "All Activity" },
    { key: "pending",   label: "Pending" },
    { key: "accepted",  label: "Accepted" },
    { key: "shipped",   label: "Shipped" },
    { key: "declined",  label: "Declined" },
    { key: "cancelled", label: "Cancelled" },
    { key: "completed", label: "Completed" },
  ];

  const fetchActivities = useCallback(async (overrideFilters) => {
    setLoading(true);
    try {
      const f = overrideFilters ?? filters;
      const params = new URLSearchParams();
      if (f.type)       params.append("type",       f.type);
      if (f.status)     params.append("status",     f.status);
      if (f.user_id)    params.append("user_id",    f.user_id);
      if (f.start_date) params.append("start_date", f.start_date);
      if (f.end_date)   params.append("end_date",   f.end_date);

      const res = await axios.get(`${BASE}/get_all_activity.php?${params}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setActivities(res.data.activities);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch activities", err);
      console.error("API URL:", `${BASE}/get_all_activity.php`);
      console.error("Error details:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE}/get_users.php`, { withCredentials: true });
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.users) ? res.data.users : [];
      setUsers(list);
    } catch (err) {
      setUsers([]);
    }
  };

  useEffect(() => { fetchActivities(); fetchUsers(); }, []);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => { e.preventDefault(); fetchActivities(); };

  const resetFilters = () => {
    const clean = { type: "", status: "", user_id: "", start_date: "", end_date: "" };
    setFilters(clean);
    setActiveTab("all");
    fetchActivities(clean);
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    const statusFilter = tabKey === "all" ? "" : tabKey;
    const next = { ...filters, status: statusFilter };
    setFilters(next);
    fetchActivities(next);
  };

  // ── Client-side sort ──
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...activities].sort((a, b) => {
    const av = a[sortField] ?? "";
    const bv = b[sortField] ?? "";
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortTh = ({ field, label }) => (
    <th
      className="px-5 py-4 cursor-pointer select-none whitespace-nowrap hover:text-slate-600 transition-colors"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={11} className={sortField === field ? "text-[#4B99D4]" : "text-slate-300"} />
      </span>
    </th>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans">

      {/* ── Header ── */}
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
              Transaction Activity
            </h2>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mt-0.5">
              Trade & Talk Systems — All Requests, Orders & Transactions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">

        {/* ── Summary Cards ── */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total"     value={summary.total}      color="bg-slate-700"     Icon={Package}      />
            <StatCard label="Pending"   value={summary.pending}    color="bg-yellow-500"    Icon={Clock}        />
            <StatCard label="Accepted"  value={summary.accepted}   color="bg-blue-500"      Icon={CheckCircle}  />
            <StatCard label="Shipped"   value={summary.shipped}    color="bg-indigo-500"    Icon={Truck}        />
            <StatCard label="Completed" value={summary.completed}  color="bg-green-500"     Icon={CheckCircle}  />
            <StatCard label="Declined / Cancelled"
              value={Number(summary.declined ?? 0) + Number(summary.cancelled ?? 0) + Number(summary.order_cancelled ?? 0)}
              color="bg-red-500" Icon={XCircle} />
          </div>
        )}

        {/* ── Filters ── */}
        <form onSubmit={handleSearch}
          className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-wrap gap-4 items-end">

          <div className="flex-1 min-w-[130px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20">
              <option value="">All Types</option>
              <option value="buy">Buy</option>
              <option value="trade">Trade</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20">
              <option value="">All Statuses</option>
              <optgroup label="Request">
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </optgroup>
              <optgroup label="Order">
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="no_show">No Show</option>
                <option value="returned">Returned</option>
              </optgroup>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">User</label>
            <select name="user_id" value={filters.user_id} onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20">
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.first_name} {u.last_name} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Start Date</label>
            <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20" />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">End Date</label>
            <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20" />
          </div>

          <div className="flex gap-2">
            <button type="submit"
              className="px-5 py-2.5 bg-[#4B99D4] text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md flex items-center gap-2">
              <Search size={14} /> Filter
            </button>
            <button type="button" onClick={resetFilters}
              className="px-5 py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </form>

        {/* ── Quick Tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => handleTabClick(tab.key)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all
                ${activeTab === tab.key
                  ? "bg-slate-900 text-white border-slate-900 shadow"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="animate-spin text-[#4B99D4]"><Package size={32} /></div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading activity…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center">
            <Package size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black italic uppercase tracking-widest">No activity found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-4 w-6"></th>{/* expand toggle */}
                    <SortTh field="request_id"     label="Req #"   />
                    <SortTh field="request_date"   label="Date"    />
                    <SortTh field="request_type"   label="Type"    />
                    <SortTh field="request_status" label="Status"  />
                    <th className="px-5 py-4">Buyer</th>
                    <th className="px-5 py-4">Seller</th>
                    <th className="px-5 py-4">Item</th>
                    <th className="px-5 py-4">Order Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => {
                    const isExpanded = expandedRow === row.request_id;
                    return (
                      <React.Fragment key={row.request_id}>
                        <tr
                          className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : row.request_id)}
                        >
                          {/* Expand toggle */}
                          <td className="px-5 py-3.5 text-slate-400">
                            {isExpanded
                              ? <ChevronUp size={14} />
                              : <ChevronDown size={14} />}
                          </td>

                          {/* Request ID */}
                          <td className="px-5 py-3.5 font-mono font-black text-slate-500">
                            #{row.request_id}
                            {row.transaction_id && (
                              <span className="block text-[9px] text-green-500">
                                TX#{row.transaction_id}
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-3.5 font-bold text-slate-600 normal-case tracking-normal text-xs whitespace-nowrap">
                            {new Date(row.request_date).toLocaleDateString("en-PH", {
                              month: "short", day: "numeric", year: "numeric"
                            })}
                            <span className="block text-[10px] text-slate-400">
                              {new Date(row.request_date).toLocaleTimeString("en-PH", {
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </td>

                          {/* Type badge */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border
                              ${row.request_type === "buy"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                              {row.request_type === "buy"
                                ? <ShoppingCart size={11} />
                                : <Repeat2 size={11} />}
                              {row.request_type}
                            </span>
                          </td>

                          {/* Request status */}
                          <td className="px-5 py-3.5">
                            <StatusBadge status={row.request_status} map={REQUEST_STATUS} />
                          </td>

                          {/* Buyer */}
                          <td className="px-5 py-3.5">
                            <UserCell first={row.buyer_first} last={row.buyer_last} username={row.buyer_username} />
                          </td>

                          {/* Seller */}
                          <td className="px-5 py-3.5">
                            <UserCell first={row.seller_first} last={row.seller_last} username={row.seller_username} />
                          </td>

                          {/* Item */}
                          <td className="px-5 py-3.5">
                            <ItemCell
                              image={row.listing_image}
                              title={row.listing_title}
                              price={row.listing_price}
                            />
                          </td>

                          {/* Order status */}
                          <td className="px-5 py-3.5">
                            {row.order_status
                              ? <StatusBadge status={row.order_status} map={ORDER_STATUS} />
                              : <span className="text-slate-300 italic text-xs normal-case">—</span>
                            }
                          </td>
                        </tr>

                        {/* Expandable detail row */}
                        {isExpanded && <DetailPanel row={row} />}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {sorted.length} record{sorted.length !== 1 ? "s" : ""} shown
              </p>
              <p className="text-[10px] text-slate-300">Click any row to expand details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;