import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { deleteListing } from "../../viewmodel/api";
import { 
  ArrowLeft, 
  PlusCircle, Trash2, Image as ImageIcon, Tag, FileText, CreditCard,
  ExternalLink, Loader2, MapPin, Layers, MessageSquare, Pencil
} from "lucide-react";
import EditStockModal from './EditStockModal';
import ConfirmModal from './ConfirmModal';
import { BASE } from "../../viewmodel/constants";


const Listings = () => {
  // --- NEW STATE FOR 3NF & COLLECTOR CONCEPT ---
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [purpose, setPurpose] = useState("sell"); // sell, or showcase
  const [stock, setStock] = useState("");

  // Existing state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate()

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // 1. Fetch Categories and Locations (Metadata)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await axios.get(`${BASE}/get_meta.php`);
        setCategories(res.data.categories);
        setLocations(res.data.locations);
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    fetchMeta();
  }, []);

  // Load logged-in user and check role
  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      alert("Please log in first.");
      navigate("/login");
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(userStr);
    } catch (err) {
      console.error("Invalid user session data", err);
      sessionStorage.removeItem("user");
      alert("Session error. Please log in again.");
      navigate("/login");
      return;
    }

    if (parsedUser.role !== "user") {
      alert("Access denied. Only regular users can access this page.");
      navigate("/login");
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  // Fetch user's listings
  const fetchUserListings = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `${BASE}/get_user_listings.php?user_id=${user.user_id}`
      );

    console.log("User listings API response:", res.data);  
    // Ensure it's an array
    const data = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.data)
        ? res.data.data
        : [];
    setUserListings(data);
    } catch (err) {
    console.error(err);
    setMessage("Failed to load listings");
    setUserListings([]); // fallback
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchUserListings();
  }, [user, fetchUserListings]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUserListings();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, fetchUserListings]);

  // Delete listing
  const handleDeleteListing = (listing_id) => {
  setPendingDeleteId(listing_id);
  setConfirmModalOpen(true);
  };
    const confirmDelete = async () => {
  if (!pendingDeleteId) return;
  try {
    const res = await deleteListing(pendingDeleteId);
    if (res.success) {
      setUserListings(userListings.filter((l) => l.listing_id !== pendingDeleteId));
      setMessage("Listing deleted successfully.");
    } else {
      setMessage(res.message || "Failed to delete listing.");
    }
  } catch (err) {
    console.error(err);
    setMessage("Server error while deleting listing.");
  } finally {
    setPendingDeleteId(null);
  }
};


  // Add new listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation: price and stock only required if purpose is 'sell'
    if (!title.trim() || !description.trim() || !image || !categoryId || !locationId) {
      setMessage("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (purpose === "sell") {

      if (!price || !stock) {
        setMessage("Price and stock are required.");
        setIsSubmitting(false);
        return;
      }

      const numericPrice = Number(price);
      const numericStock = Number(stock);

      if (isNaN(numericPrice) || isNaN(numericStock)) {
        setMessage("Price and stock must be numbers.");
        setIsSubmitting(false);
        return;
      }

      if (numericPrice < 100) {
        setMessage("Minimum price is ₱100.");
        setIsSubmitting(false);
        return;
      }

      if (numericPrice > 200000) {
        setMessage("Maximum price is ₱200,000.");
        setIsSubmitting(false);
        return;
      }

      if (numericStock < 1) {
        setMessage("Minimum stock is 1.");
        setIsSubmitting(false);
        return;
      }

      if (numericStock > 100) {
        setMessage("Maximum stock is 100.");
        setIsSubmitting(false);
        return;
      }
      
    }

    const formData = new FormData();
    formData.append("user_id", user.user_id);
    formData.append("category_id", categoryId);
    formData.append("location_id", locationId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("purpose", purpose);
    formData.append("price", purpose === 'sell' ? price : 0);
    formData.append("stock", purpose === 'sell' ? stock : 0);
    formData.append("image", image);

    try {
      const res = await axios.post(
        `${BASE}/add_listing.php`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(res.data.message);

      if (res.data.success) {
        // Reset form
        setTitle("");
        setDescription("");
        setPrice("");
        setStock("");
        setImage(null);
        setPreview(null);
        fetchUserListings(); // Refresh immediately
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
    finally { setIsSubmitting(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const handleEditClick = (listing) => {
  setEditingListing(listing);
  setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditingListing(null);
    fetchUserListings(); // refresh table
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={18} /> Back to Home
        </button>
        <h1 className="text-2xl font-black tracking-tight text-slate-800">Manage Listings</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
       <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit sticky top-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><PlusCircle size={24} className="text-[#4B99D4]"/> New Listing</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Dropdown */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 rounded-xl py-2 px-4 outline-none text-sm font-medium border-none" required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
              </select>
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Location</label>
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="w-full bg-slate-50 rounded-xl py-2 px-4 outline-none text-sm font-medium border-none" required>
                <option value="">Select Location</option>
                {locations.map(loc => <option key={loc.location_id} value={loc.location_id}>{loc.location_name}</option>)}
              </select>
            </div>

            {/* Purpose Toggles */}
           <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Purpose</label>
              <div className="grid grid-cols-2 gap-2">
                {['sell', 'showcase'].map((p) => (
                  <button key={p} type="button" onClick={() => setPurpose(p)} className={`py-2 text-[10px] font-bold rounded-xl border uppercase ${purpose === p ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full bg-slate-50 rounded-xl py-3 px-4 outline-none text-sm font-medium" required />

            {/* Price + Stock */}
            {purpose === 'sell' && (
              <>
               <input
                  type="number"
                  value={price}
                  placeholder="Price (₱)"
                  min="100"
                  max="200000"
                  step="1"
                  required
                  onChange={(e) => {
                    let value = e.target.value;

                    // Remove scientific notation
                    if (value.includes("e") || value.includes("E")) return;

                    // Prevent negative
                    if (Number(value) < 0) return;

                    // Limit to 6 digits (200000 max = 6 digits)
                    if (value.length > 6) return;

                    // Hard cap at 200000
                    if (Number(value) > 200000) return;

                    setPrice(value);
                  }}
                  onKeyDown={(e) => {
                    // Block minus and e
                    if (e.key === "-" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                  className="w-full bg-slate-50 rounded-xl py-3 px-4 outline-none text-sm font-medium"
                />
               <input
                type="number"
                value={stock}
                placeholder="Stock"
                min="1"
                max="100"
                step="1"
                required
                onChange={(e) => {
                  let value = e.target.value;

                  if (value.includes("e") || value.includes("E")) return;
                  if (Number(value) < 0) return;
                  if (Number(value) > 100) return;
                  setStock(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
                className="w-full bg-slate-50 rounded-xl py-3 px-4 outline-none text-sm font-medium mt-2"
              />
              </>
            )}

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full bg-slate-50 rounded-xl py-3 px-4 outline-none text-sm font-medium min-h-[80px]" required />

            <label className="cursor-pointer block">
              <div className="w-full border-2 border-dashed border-slate-100 rounded-2xl p-4 flex flex-col items-center bg-slate-50">
                {preview ? <img src={preview} className="w-full h-24 object-cover rounded-xl" /> : <><ImageIcon className="text-slate-300" /><span className="text-[10px] font-bold text-slate-400">Upload Image</span></>}
                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>
            </label>

            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#4B99D4] transition-all">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />} Add Listing
            </button>
            {message && <p className="text-[10px] font-bold text-center text-[#4B99D4]">{message}</p>}
          </form>
        </div>

        {/* Listings Table */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <h2 className="text-xl font-bold mb-6">My Collection <span className="bg-[#D9E9EE] text-[#4B99D4] text-xs px-2 py-1 rounded-lg ml-2">{userListings.length}</span></h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-4">Item</th>
                  <th className="px-4">Value</th>
                  <th className="px-4">Availability</th> {/* New column */}
                  <th className="px-4">Status</th>
                  <th className="px-4">Reject Reason</th>
                  <th className="px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                
                {Array.isArray(userListings) && userListings.map(listing => (
                  <tr key={listing.listing_id} className="bg-slate-50 hover:bg-slate-100 transition-colors">
                    {/* 1. ITEM COLUMN */}
                    <td className="px-4 py-4 rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <img 
                          src={listing.image_url?.startsWith("http") ? listing.image_url : `${BASE}/${listing.image_url}`} 
                          className="w-10 h-10 rounded-lg object-cover" 
                          alt={listing.title}
                        />
                        <div>
                          <p className="text-sm font-bold">{listing.title}</p>
                          <div className="flex gap-2 items-center">
                            <p className="text-[9px] text-[#4B99D4] uppercase font-black">{listing.category_name}</p>
                            <span className="text-[9px] text-slate-300">•</span>
                            <p className="text-[9px] text-slate-400 uppercase font-black">{listing.location_name}</p>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. VALUE COLUMN */}
                    <td className="px-4 py-4 text-sm font-black text-[#4B99D4]">
                      {`₱${Number(listing.price).toLocaleString()} (${listing.stock})`}
                    </td>

                   {/* 3. AVAILABILITY COLUMN */}
                    <td className="px-4 py-4">
                      {(() => {
                        // If listing is not approved, show "Not Available"
                        if (listing.status !== 'approved') {
                          return (
                            <span className="w-fit text-[9px] font-black uppercase px-2 py-1 rounded-md bg-slate-100 text-slate-500">
                              Not Available
                            </span>
                          );
                        }
                        // If purpose is showcase, display "Showcase"
                        if (listing.purpose === 'showcase') {
                          return (
                            <span className="w-fit text-[9px] font-black uppercase px-2 py-1 rounded-md bg-purple-100 text-purple-600">
                              Showcase
                            </span>
                          );
                        }
                        // Determine display based on stock and availability
                        const stock = Number(listing.stock) || 0;
                        if (stock > 0) {
                          return (
                            <span className="w-fit text-[9px] font-black uppercase px-2 py-1 rounded-md bg-green-100 text-green-600">
                              Available
                            </span>
                          );
                        } else {
                          // stock is 0, use the availability column to differentiate between sold/traded/
                          const availability = listing.availability || "sold";
                          let displayText = availability;
                          let colorClass = '';
                          if (availability === 'sold') {
                            displayText = 'Sold';
                            colorClass = 'bg-blue-100 text-blue-600';
                          } else if (availability === 'traded') {
                            displayText = 'Traded';
                            colorClass = 'bg-purple-100 text-purple-600'
                          }
                          return (
                            <span className={`w-fit text-[9px] font-black uppercase px-2 py-1 rounded-md ${colorClass}`}>
                              {displayText}
                            </span>
                          );
                        }
                      })()}
                    </td>

                    {/* 4. STATUS COLUMN */}
                    <td className="px-4 py-4">
                      <span className={`w-fit text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                        listing.status === 'approved' ? 'bg-green-100 text-green-600' : 
                        listing.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {listing.status}
                      </span>
                    </td>

                    {/* 5. REJECT REASON COLUMN */}
                    <td className="px-4 py-4">
                      {listing.status === 'rejected' && listing.rejection_reason ? (
                        <span className="text-[10px] text-red-400 font-bold italic border-l-2 border-red-200 pl-2">
                          {listing.rejection_reason}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>

                    {/* 6. ACTIONS COLUMN */}
                    <td className="px-4 py-4 rounded-r-2xl text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                        onClick={() => handleEditClick(listing)}
                        className="p-2 text-slate-300 hover:text-blue-500 transition-all"
                        title="Edit stock"
                      >
                        <Pencil size={18} />
                      </button>

                        <button 
                          onClick={() => handleDeleteListing(listing.listing_id)} 
                          className="p-2 text-slate-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
          <EditStockModal
      isOpen={editModalOpen}
      onClose={() => setEditModalOpen(false)}
      listing={editingListing}
      onSuccess={handleEditSuccess}
    />
    <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default Listings;