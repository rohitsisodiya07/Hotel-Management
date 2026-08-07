import React, { useState, useEffect } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import useSearch from "../Hooks/useSearch";
import {
  Calendar,
  BedDouble,
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Eye,
  X,
  User,
  CheckSquare,
  ArrowRight,
  RefreshCw,
  Loader2,
  Search
} from "lucide-react";

const HotelBookings = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("current"); // "current", "completed", "cancelled", "all"
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Search, Limit & Pagination States
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // 🌟 Backend-driven useSearch hook integration
  const bookingSearch = useSearch(`${signupApi}booking/hotelBookings`, search, {
    page,
    limit,
    sort: sortOrder,
    status: activeTab
  }, headers);

  const loading = bookingSearch.loading;
  const resData = bookingSearch.data || {};
  const bookings = resData.bookings || [];
  const totalPages = resData.totalPages || 1;
  const totalCount = resData.totalBookings || resData.total || 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const refreshData = () => {
    bookingSearch.fetchData();
  };

  // Handle Booking Status Actions (Confirm, Check-In, Complete)
  const handleBookingAction = async (bookingId, actionType) => {
    try {
      setActionLoading(true);
      let endpoint = "";

      if (actionType === "confirm") endpoint = `booking/confirm/${bookingId}`;
      if (actionType === "checkin") endpoint = `booking/checkin/${bookingId}`;
      if (actionType === "complete") endpoint = `booking/complete/${bookingId}`;

      const res = await axios.patch(`${signupApi}${endpoint}`, {}, { headers });

      toast.success(res.data.message || "Status updated successfully.");
      refreshData();

      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking(res.data.booking || res.data.result);
      }
    } catch (error) {
      console.error("Action Error:", error);
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const bookingBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={13} className="text-emerald-600" /> };
      case "Checked In":
        return { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: <CheckSquare size={13} className="text-blue-600" /> };
      case "Completed":
        return { bg: "bg-sky-50 text-sky-700 border-sky-200", icon: <ShieldCheck size={13} className="text-sky-600" /> };
      case "Cancelled":
        return { bg: "bg-rose-50 text-rose-700 border-rose-200", icon: <XCircle size={13} className="text-rose-600" /> };
      default:
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={13} className="text-amber-600" /> };
    }
  };

  const getModalImages = (booking) => {
    if (!booking) return [];
    if (booking.roomId?.roomImages?.length > 0) return booking.roomId.roomImages;
    if (booking.hotelId?.hotelImages?.length > 0) return booking.hotelId.hotelImages;
    return ["https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"];
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 font-['Inter',sans-serif] pb-24 relative max-w-[1600px] mx-auto">
      <Toaster position="top-right" richColors />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
              Hotel Management Panel
            </span>
            <h1 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-gray-900 m-0 tracking-tight">
              Property Reservations
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition shadow-2xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => navigate("/hotel/hotelDashboard")}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4.5 py-2.5 rounded-xl transition text-xs font-semibold shadow-sm cursor-pointer"
            >
              <ArrowLeft size={16} /> Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-8 space-y-6">

        {/* 🗂️ TABS FILTER */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {[
            { key: "current", label: "Current Bookings" },
            { key: "completed", label: "Completed Stays" },
            { key: "cancelled", label: "Cancelled" },
            { key: "all", label: "All Bookings" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Controls Bar: Search, Limit & Sort */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by reservation ID or guest..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white border border-gray-200 pl-10 pr-4 h-11 rounded-xl text-xs font-medium outline-none focus:border-blue-500 transition shadow-2xs text-gray-900"
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 h-11 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="bg-transparent outline-none cursor-pointer font-bold text-blue-600"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
              className="w-full sm:w-44 bg-white border border-gray-200 px-3.5 h-11 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 transition text-gray-700 cursor-pointer shadow-2xs"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount">Amount (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Bookings List Card with Smooth Loader */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all duration-200">
              <Loader2 className="animate-spin text-blue-600" size={28} />
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-5 shadow-2xs">
                <Users size={30} strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900 mb-1">No Bookings Found</h2>
              <p className="text-gray-500 text-xs">There are no bookings matching your search or filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const badgeInfo = bookingBadge(booking.bookingStatus);
                const roomImage = booking.roomId?.roomImages?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600";

                return (
                  <div key={booking._id} className="p-5 hover:bg-gray-50/60 transition-colors flex flex-col md:flex-row items-center gap-5 group">
                    <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200">
                      <img src={roomImage} alt="Room" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h2 className="text-base font-bold font-['Space_Grotesk'] text-gray-900 leading-tight">
                            {booking.userId?.name || "Valued Guest"}
                          </h2>
                          <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                            <User size={12} className="text-blue-600" /> {booking.userId?.email || "No email provided"}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${badgeInfo.bg}`}>
                          {badgeInfo.icon} {booking.bookingStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-xs border-t border-gray-100">
                        <div>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Room Type</span>
                          <strong className="text-gray-900">{booking.roomId?.roomType || "Suite"}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Stay Dates</span>
                          <strong className="text-gray-900">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Amount</span>
                          <strong className="text-gray-900">₹{booking.finalAmount?.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-end shrink-0">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Numeric Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-xs gap-3">
            <p className="text-gray-500 font-medium">
              Showing page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages || 1}</strong> (Total: {totalCount})
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isSelected = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition shadow-2xs cursor-pointer flex items-center justify-center ${isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🔍 COMPLETE DETAILS MODAL WITH IMAGE GALLERY */}
      {/* ========================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-[650px] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col relative">

            <div className="flex justify-between items-center border-b border-gray-100 p-5 bg-white shrink-0 z-10">
              <div>
                <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900 leading-none">
                  Reservation #{selectedBooking.bookingId}
                </h2>
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mt-1">
                  Guest Folio & Management
                </span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 bg-white">
              <div className="relative border-b border-gray-100 bg-gray-900">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide p-3 gap-3 h-56 sm:h-64">
                  {getModalImages(selectedBooking).map((img, index) => (
                    <div key={index} className="w-full sm:w-[90%] h-full flex-shrink-0 snap-center relative">
                      <img src={img} alt={`Room View ${index + 1}`} className="w-full h-full object-cover rounded-xl shadow-xs border border-white/10" />
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest shadow-sm">
                        {index + 1} / {getModalImages(selectedBooking).length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-5 text-xs">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest text-blue-600 mb-2.5">Guest Information</p>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Full Name</span>
                      <strong className="text-gray-900 text-sm">{selectedBooking.userId?.name || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Contact Email</span>
                      <strong className="text-gray-900 font-medium">{selectedBooking.userId?.email || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Mobile Number</span>
                      <strong className="text-gray-900 font-medium">{selectedBooking.userId?.mobile || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Total Guests</span>
                      <strong className="text-gray-900 font-medium">{selectedBooking.totalGuests} Persons</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest text-blue-600 mb-2.5">Room & Schedule</p>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Room Assigned</span>
                      <strong className="text-gray-900">{selectedBooking.roomId?.roomType} <span className="text-blue-600">(#{selectedBooking.roomId?.roomNumber})</span></strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Booking Status</span>
                      <strong className="text-emerald-700">{selectedBooking.bookingStatus}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Check-In</span>
                      <strong className="text-gray-900 font-['IBM_Plex_Mono']">{new Date(selectedBooking.checkIn).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Check-Out</span>
                      <strong className="text-gray-900 font-['IBM_Plex_Mono']">{new Date(selectedBooking.checkOut).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>

                {selectedBooking.specialRequest && (
                  <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl shadow-2xs">
                    <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-amber-800 uppercase tracking-widest mb-1">Guest Special Request</p>
                    <p className="text-xs text-amber-900 font-medium italic">"{selectedBooking.specialRequest}"</p>
                  </div>
                )}

                <div className="bg-gray-900 text-white p-5 rounded-xl flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono',monospace] font-semibold uppercase tracking-widest mb-0.5">Payment: {selectedBooking.paymentStatus}</p>
                    <p className="text-xs font-medium">Duration: <span className="font-bold">{selectedBooking.totalNights} Nights</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono',monospace] font-semibold uppercase tracking-widest mb-0.5">Total Revenue</p>
                    <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-emerald-400 leading-none">₹{selectedBooking.finalAmount?.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-3 justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Update Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.bookingStatus === "Pending" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "confirm")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                      >
                        Confirm Booking
                      </button>
                    )}
                    {selectedBooking.bookingStatus === "Confirmed" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "checkin")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                      >
                        Check-In Guest
                      </button>
                    )}
                    {selectedBooking.bookingStatus === "Checked In" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "complete")}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                      >
                        Complete Stay
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-2xs cursor-pointer"
              >
                Close Folio
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBookings;