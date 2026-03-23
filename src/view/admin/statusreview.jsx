import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";

import { BASE } from "../../viewmodel/constants";

const StatusReview = () => {
  useAdminAuth() // Custom hook to protect admin routes
  const [pendingListings, setPendingListings] = useState([]);
  const [approvedListings, setApprovedListings] = useState([]);
  const [rejectedListings, setRejectedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // // 🔐 ADMIN ROLE PROTECTION using sessionStorage
  // useEffect(() => {
  //   const storedUser = JSON.parse(sessionStorage.getItem("user"));
  //   if (!storedUser || storedUser.role !== "admin") {
  //     alert("Access denied. Please log in as admin.");
  //     navigate("/login");
  //   }
  // }, [navigate]);

  // Fetch all listings
  const fetchListings = async () => {
    try {
      const pendingRes = await axios.get(
        `${BASE}/get_pending_listings.php`
      );
      setPendingListings(pendingRes.data);

      const approvedRes = await axios.get(
        `${BASE}/get_approved_listings.php`
      );
      setApprovedListings(approvedRes.data);

      const rejectedRes = await axios.get(
        `${BASE}/get_rejected_listings.php`
      );
      setRejectedListings(rejectedRes.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Handle status change
  const handleStatusChange = async (listing_id, newStatus) => {
    let rejection_reason = "";

    if (newStatus === "rejected") {
      rejection_reason = window.prompt("Please provide a rejection reason:");
      if (!rejection_reason) {
        alert("Rejection reason is required.");
        return;
      }
    }

    if (newStatus === "approved" || newStatus === "pending") {
      rejection_reason = "";
    }

    try {
      const res = await axios.post(
        `${BASE}/update_listing_status.php`,
        { listing_id, status: newStatus, rejection_reason }
      );

      if (res.data.success) {
        setMessage(res.data.message);
        fetchListings();
      } else {
        setMessage(res.data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while updating status.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
      <div className="animate-spin text-[#4B99D4]"><Clock size={40} /></div>
    </div>
  );

  const renderTable = (listings, tableType) => {
   const config = {
    pending: { 
      color: "text-blue-500", 
      bg: "bg-blue-50", 
      border: "border-blue-100",
      icon: <AlertCircle size={16}/>, // Representing "Action Required"
      label: "Awaiting Review"
    },
    approved: { 
      color: "text-emerald-500", 
      bg: "bg-emerald-50", 
      border: "border-emerald-100",
      icon: <CheckCircle size={16}/>, 
      label: "Live Listings"
    },
    rejected: { 
      color: "text-rose-500", 
      bg: "bg-rose-50", 
      border: "border-rose-100",
      icon: <XCircle size={16}/>, 
      label: "Denied Access"
    }
  }; 
   

   return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-12">
      {/* Header with better labeling */}
      <div className={`px-8 py-5 border-b border-slate-100 flex items-center justify-between ${config[tableType].bg}`}>
        <div className="flex items-center gap-3">
          <span className={`${config[tableType].color} p-2 bg-white rounded-xl shadow-sm border ${config[tableType].border}`}>
            {config[tableType].icon}
          </span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 leading-none">
              {config[tableType].label}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
              {listings.length} items in this category
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <th className="px-6 py-4">Item Details</th>
              <th className="px-6 py-4">Collector</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Media</th>
              {tableType === "rejected" && <th className="px-6 py-4">Rejection Reason</th>}
              <th className="px-6 py-4 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {listings.map((listing) => (
              <tr key={listing.listing_id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-black text-slate-800 leading-none">{listing.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{listing.description}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-700">{listing.user_name}</p>
                  <p className="text-[10px] text-slate-400">{listing.user_email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-[#4B99D4]">₱{listing.price}</span>
                </td>
                <td className="px-6 py-4">
                  {listing.image_url ? (
                    <a
                      href={`${BASE}/${listing.image_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-600 hover:bg-blue-500 hover:text-white transition-all"
                    >
                      <ImageIcon size={12}/> View Image
                    </a>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300">No Media</span>
                  )}
                </td>
                {tableType === "rejected" && (
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 inline-block">
                      {listing.rejection_reason || "Violation of Terms"}
                    </p>
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    {/* Approve Button */}
                    {tableType !== "approved" && (
                      <button
                        onClick={() => handleStatusChange(listing.listing_id, "approved")}
                        className="p-2.5 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-emerald-200"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    
                    {/* Reset to Pending (Undo/Reset Icon) */}
                    {tableType !== "pending" && (
                      <button
                        onClick={() => handleStatusChange(listing.listing_id, "pending")}
                        className="p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all border border-transparent"
                        title="Reset to Pending"
                      >
                        <AlertCircle size={18} />
                      </button>
                    )}

                    {/* Reject Button */}
                    {tableType !== "rejected" && (
                      <button
                        onClick={() => handleStatusChange(listing.listing_id, "rejected")}
                        className="p-2.5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-rose-200"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* ADMIN HEADER */}
      <header className="bg-slate-900 text-white p-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/Admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-[#4B99D4]">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Status Review</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listing Verification Gate</p>
            </div>
          </div>
          {message && (
            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 animate-bounce ${
              message.includes("Success") ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
            }`}>
              <AlertCircle size={14} /> {message}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {pendingListings.length === 0 && approvedListings.length === 0 && rejectedListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-300 font-black italic uppercase tracking-widest">All clear! No listings found.</p>
          </div>
        ) : (
          <>
            {renderTable(pendingListings, "pending")}
            {renderTable(approvedListings, "approved")}
            {renderTable(rejectedListings, "rejected")}
          </>
        )}
      </main>
    </div>
  );
};

export default StatusReview;
