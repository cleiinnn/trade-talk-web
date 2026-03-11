import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

import { BASE } from "../../viewmodel/constants";

const EditStockModal = ({ isOpen, onClose, listing, onSuccess }) => {
  const [stock, setStock] = useState(listing?.stock ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && listing) {
      const initialStock = Number(listing.stock);
      setStock(Number.isFinite(initialStock) ? initialStock : 0);
      setError('');
    }
  }, [isOpen, listing]);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const nextStock = Number(stock);
      if (!Number.isInteger(nextStock) || nextStock < 0 || nextStock > 100) {
        setError('Stock must be a whole number from 0 to 100.');
        return;
      }

      const user = JSON.parse(sessionStorage.getItem('user') || 'null');
      const jsonPayload = {
        listing_id: listing.listing_id,
        stock: nextStock,
        ...(user?.user_id ? { user_id: user.user_id } : {}),
      };

      let res;
      try {
        res = await axios.post(`${BASE}/update_listing_stock.php`, jsonPayload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        const formPayload = new URLSearchParams();
        formPayload.append('listing_id', String(listing.listing_id));
        formPayload.append('stock', String(nextStock));
        if (user?.user_id) formPayload.append('user_id', String(user.user_id));

        res = await axios.post(`${BASE}/update_listing_stock.php`, formPayload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      }

      if (res.data.success) {
        onSuccess();
      } else {
        setError(res.data.message || 'Update failed.');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800">Edit Stock</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Readâ€‘only item title */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Item</label>
            <p className="text-sm font-medium text-slate-700 bg-slate-50 rounded-xl py-3 px-4">{listing.title}</p>
          </div>

          {/* Stock input */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Stock (0-100)</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isFinite(value)) return;
                if (value < 0 || value > 100) return;
                setStock(value);
              }}
              min="0"
              max="100"
              step="1"
              required
              className="w-full bg-slate-50 rounded-xl py-3 px-4 outline-none text-sm font-medium focus:ring-2 focus:ring-[#4B99D4]/20"
            />
          </div>

          {error && <p className="text-xs font-bold text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#4B99D4] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStockModal;