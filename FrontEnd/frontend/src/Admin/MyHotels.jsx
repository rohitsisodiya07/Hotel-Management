import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { signupApi } from "../api";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  BedDouble,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Tag,
  ArrowUpDown,
  Sparkles,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

const MyHotels = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchHotels = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await axios.get(`${signupApi}hotel/myHotels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        if (err.response?.status === 400 || err.response?.status === 404) {
          res = await axios.get(`${signupApi}hotel/my-hotels`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw err;
        }
      }
      setHotels(res.data.hotels || []);
    } catch (error) {
      console.error("Fetch Hotels Error:", error);
      toast.error(error.response?.data?.message || "Failed to load your hotels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async (hotelId, hotelName) => {
    const result = await Swal.fire({
      title: "Delete Property?",
      text: `Are you sure you want to permanently delete "${hotelName}"? All associated rooms will also be deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#4B5563",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${signupApi}hotel/delete/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`"${hotelName}" deleted successfully.`);
      setHotels((prev) => prev.filter((h) => h._id !== hotelId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete hotel.");
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = hotels.length;
    const approved = hotels.filter((h) => h.status === "Approved").length;
    const pending = hotels.filter((h) => h.status === "Pending").length;
    const rejected = hotels.filter((h) => h.status === "Rejected").length;
    return { total, approved, pending, rejected };
  }, [hotels]);

  // Filtered hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesSearch =
        hotel.hotelName.toLowerCase().includes(search.toLowerCase()) ||
        hotel.address.toLowerCase().includes(search.toLowerCase()) ||
        (hotel.city?.cityName &&
          hotel.city.cityName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || hotel.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === "all" || hotel.hotelType?.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [hotels, search, statusFilter, typeFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Active & Approved
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} /> Under Verification
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} /> Action Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8E1] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#173D31] tracking-tight">
            My Managed Properties
          </h1>
          <p className="text-xs sm:text-sm text-[#6C7B70] mt-1">
            Monitor, update, and manage your luxury portfolio registered with AuraStay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHotels}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#D5DFD3] text-[#315C48] hover:bg-white hover:shadow-xs transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>

          <Link
            to="/admin/addHotel"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173D31] text-white text-xs sm:text-sm font-semibold hover:bg-[#204A3C] shadow-sm hover:shadow transition transform active:scale-95"
          >
            <Plus size={16} /> Register New Hotel
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EBE3] shadow-xs">
          <div className="flex items-center justify-between text-[#718575] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Properties</span>
            <Building2 size={18} className="text-[#315C48]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#173D31]">{stats.total}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EBE3] shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Live & Approved</span>
            <CheckCircle2 size={18} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-700">{stats.approved}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EBE3] shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Under Review</span>
            <Clock size={18} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-700">{stats.pending}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EBE3] shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Needs Attention</span>
            <XCircle size={18} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EBE3] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#829285]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hotel name, address, or city..."
            className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm rounded-xl border border-[#DCE4DA] bg-[#F9FBF8] focus:bg-white focus:border-[#315C48] focus:ring-3 focus:ring-[#315C48]/10 outline-none transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["all", "approved", "pending", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? "bg-[#173D31] text-white shadow-xs"
                  : "bg-[#F3F6F2] text-[#4A5D50] hover:bg-[#E5ECE3]"
              }`}
            >
              {st === "all" ? "All Properties" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Hotels Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E5EBE3] p-4 space-y-4 animate-pulse"
            >
              <div className="h-48 bg-[#EAEFE8] rounded-xl w-full" />
              <div className="h-5 bg-[#EAEFE8] rounded-md w-3/4" />
              <div className="h-4 bg-[#EAEFE8] rounded-md w-1/2" />
              <div className="h-8 bg-[#EAEFE8] rounded-md w-full" />
            </div>
          ))}
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE3] p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#EDF2EB] text-[#315C48] flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#173D31]">No properties found</h3>
          <p className="text-xs sm:text-sm text-[#6C7B70] mt-1.5 leading-relaxed">
            {search || statusFilter !== "all"
              ? "No hotels match your current search or filter criteria. Try clearing filters."
              : "You haven't registered any hotels yet. Submit your first luxury property application now!"}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {search || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 rounded-xl border border-[#D5DFD3] text-xs font-semibold text-[#173D31] hover:bg-[#F3F6F2] cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <Link
                to="/admin/addHotel"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173D31] text-white text-xs font-semibold hover:bg-[#204A3C]"
              >
                <Plus size={15} /> Add First Hotel
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => {
            const cityName = hotel.city?.cityName || "City";
            const stateName = hotel.city?.districtId?.stateId?.stateName || "";
            const coverImage =
              hotel.hotelImages && hotel.hotelImages.length > 0
                ? hotel.hotelImages[0]
                : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={hotel._id}
                className="bg-white rounded-2xl border border-[#E2E8E0] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Image Cover */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                  <img
                    src={coverImage}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#173D31] shadow-xs">
                      {hotel.hotelType || "Hotel"}
                    </span>
                    {getStatusBadge(hotel.status)}
                  </div>

                  {/* Bottom tracking ID badge */}
                  {hotel.trackingId && (
                    <div className="absolute bottom-3 left-3 text-white text-[11px] font-mono bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
                      TRK: {hotel.trackingId.slice(0, 8)}...
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#173D31] line-clamp-1">
                      {hotel.hotelName}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-[#6C7B70] mt-1 line-clamp-1">
                      <MapPin size={13} className="text-[#315C48] shrink-0" />
                      {hotel.address}, {cityName} {stateName ? `(${stateName})` : ""}
                    </p>

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F0F4EF] text-xs text-[#526356]">
                      <span className="flex items-center gap-1 font-medium">
                        <BedDouble size={14} className="text-[#315C48]" />
                        {hotel.totalRooms} Rooms
                      </span>
                      {hotel.rating > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-amber-600">
                          ★ {hotel.rating} ({hotel.totalReviews || 0})
                        </span>
                      )}
                    </div>

                    {/* Remarks if Rejected or Pending */}
                    {hotel.status === "Rejected" && hotel.remark && (
                      <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <p className="font-semibold flex items-center gap-1 text-[11px]">
                          <AlertCircle size={13} /> Rejection Reason:
                        </p>
                        <p className="mt-0.5 text-rose-700 leading-relaxed">{hotel.remark}</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 pt-3 border-t border-[#F0F4EF] flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/admin/addHotel?id=${hotel._id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#F4F7F3] hover:bg-[#EAEFE8] text-[#173D31] text-xs font-semibold transition cursor-pointer"
                    >
                      <Edit size={14} /> Edit Info
                    </button>

                    <button
                      onClick={() => handleDelete(hotel._id, hotel.hotelName)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                      title="Delete Hotel"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyHotels;
