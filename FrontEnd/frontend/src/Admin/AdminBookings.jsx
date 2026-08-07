import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import Swal from "sweetalert2";
import {
  Calendar,
  BedDouble,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Eye,
  X,
  User,
  Search,
  CheckSquare,
  Building2,
  Mail,
  Printer,
  Copy,
  Check,
  Ban,
  Loader2,
  RefreshCw
} from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search, Filters, Limit & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [hotelFilter, setHotelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ==========================================================
  // FETCH BOOKINGS WITH SEARCH & FILTERS
  // ==========================================================
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        hotel: hotelFilter,
        status: statusFilter,
        page,
        limit
      });

      const res = await axios.get(`${signupApi}booking/hotelBookings?${params.toString()}`, { headers });

      if (res.data.success) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalBookings || res.data.total || 0);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Unable to fetch bookings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBookings();
  }, [searchQuery, hotelFilter, statusFilter, page, limit]);

  // ==========================================================
  // ACTION HANDLERS (Confirm, Check-In, Complete, Cancel)
  // ==========================================================
  const handleBookingAction = async (id, actionType) => {
    if (actionType === "cancel") {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to cancel this reservation?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, Cancel It",
      });
      if (!confirmResult.isConfirmed) return;
    }

    try {
      setActionLoading(true);
      let endpoint = "";
      if (actionType === "confirm") endpoint = `booking/confirm/${id}`;
      if (actionType === "checkin") endpoint = `booking/checkin/${id}`;
      if (actionType === "complete") endpoint = `booking/complete/${id}`;
      if (actionType === "cancel") endpoint = `booking/cancel/${id}`;

      const res = await axios.patch(`${signupApi}${endpoint}`, {}, { headers });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: res.data.message || `Booking successfully ${actionType}ed.`,
        timer: 1500,
        showConfirmButton: false
      });

      fetchBookings();
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(res.data.booking);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyBookingId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrintFolio = () => {
    window.print();
  };

  // Hotel list for dropdown filter derived from current bookings
  const hotels = useMemo(() => {
    return [...new Set(bookings.map((item) => item.hotelId?.hotelName).filter(Boolean))];
  }, [bookings]);

  // Status Badge Mapper
  const bookingBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} className="text-emerald-600" /> };
      case "Checked In":
        return { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <CheckSquare size={14} className="text-indigo-600" /> };
      case "Completed":
        return { bg: "bg-sky-50 text-sky-700 border-sky-200", icon: <ShieldCheck size={14} className="text-sky-600" /> };
      case "Cancelled":
        return { bg: "bg-rose-50 text-rose-700 border-rose-200", icon: <XCircle size={14} className="text-rose-600" /> };
      default:
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={14} className="text-amber-600" /> };
    }
  };

  const getModalImages = (booking) => {
    if (!booking) return [];
    if (booking.roomId?.roomImages?.length > 0) return booking.roomId.roomImages;
    if (booking.hotelId?.hotelImages?.length > 0) return booking.hotelId.hotelImages;
    return ["https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"];
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-['Inter',sans-serif] pb-24 relative max-w-[1600px] mx-auto">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header & Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.2em] text-blue-600 font-bold uppercase block mb-1">
              Management Portal
            </span>
            <h1 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-gray-900 m-0 tracking-tight">
              Property Reservations
            </h1>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchBookings}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition shadow-2xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>

            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search guest name or ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full bg-white border border-gray-200 pl-10 pr-4 h-11 rounded-xl text-xs font-medium outline-none focus:border-blue-500 shadow-2xs transition text-gray-900"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={14} />
                </button>
              )}
            </div>

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
              value={hotelFilter}
              onChange={(e) => { setHotelFilter(e.target.value); setPage(1); }}
              className="bg-white border border-gray-200 px-4 h-11 rounded-xl text-xs outline-none focus:border-blue-500 shadow-2xs transition font-semibold text-gray-700 cursor-pointer"
            >
              <option value="">All Hotels</option>
              {hotels.map((hotel, index) => (
                <option key={index} value={hotel}>{hotel}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-white border border-gray-200 px-4 h-11 rounded-xl text-xs outline-none focus:border-blue-500 shadow-2xs transition font-semibold text-gray-700 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Card List with Overlay Loader */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 pt-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden relative min-h-[300px] p-6">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all duration-200">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-5 shadow-2xs">
                <Users size={30} strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900 mb-1">No Bookings Found</h2>
              <p className="text-gray-500 text-xs font-medium">There are no bookings matching your search or filter.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold text-gray-400 font-['IBM_Plex_Mono',monospace] uppercase tracking-widest">
                  Total Reservations ({totalCount})
                </p>
              </div>

              {bookings.map((booking) => {
                const badgeInfo = bookingBadge(booking.bookingStatus);
                const hotelImage = booking.hotelId?.hotelImages?.[0] || booking.roomId?.roomImages?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600";

                return (
                  <div
                    key={booking._id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center gap-6 group"
                  >
                    <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200">
                      <img
                        src={hotelImage}
                        alt="Property"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                        <p className="text-white text-xs font-bold truncate flex items-center gap-1.5 font-['Space_Grotesk'] tracking-wide">
                          <Building2 size={13} className="text-blue-400" /> {booking.hotelId?.hotelName || "Luxury Property"}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900 leading-tight">
                            {booking.userId?.name || "Valued Guest"}
                          </h2>
                          <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1 font-medium">
                            <User size={13} className="text-blue-600" /> {booking.userId?.email || "No email provided"}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${badgeInfo.bg}`}>
                          {badgeInfo.icon} {booking.bookingStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-8 gap-y-3 pt-3 text-xs border-t border-gray-100">
                        <div>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Hotel Property</span>
                          <strong className="text-gray-900 font-semibold">{booking.hotelId?.hotelName || "N/A"}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Room</span>
                          <strong className="text-gray-900 font-semibold">{booking.roomId?.roomType} <span className="text-blue-600">(#{booking.roomId?.roomNumber || "N/A"})</span></strong>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Dates</span>
                          <strong className="text-gray-900 font-semibold">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Revenue</span>
                          <strong className="text-gray-900 font-semibold">₹{booking.finalAmount?.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-wrap md:flex-col justify-end gap-2.5 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleBookingAction(booking._id, "confirm")}
                          disabled={booking.bookingStatus !== "Pending" || actionLoading}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking._id, "checkin")}
                          disabled={booking.bookingStatus !== "Confirmed" || actionLoading}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          Check-In
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking._id, "complete")}
                          disabled={booking.bookingStatus !== "Checked In" || actionLoading}
                          className="px-3 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking._id, "cancel")}
                          disabled={booking.bookingStatus === "Cancelled" || booking.bookingStatus === "Completed" || actionLoading}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Ban size={12} /> Cancel
                        </button>
                      </div>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer mt-1"
                      >
                        <Eye size={14} className="text-blue-600" /> View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Numeric Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-6 border-t border-gray-100 mt-6 text-xs gap-3">
            <p className="text-gray-500 font-medium">
              Showing page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages || 1}</strong>
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isSelected = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition shadow-2xs cursor-pointer flex items-center justify-center ${
                      isSelected
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
      {/* 🔍 VIEW DETAILS MODAL WITH IMAGE GALLERY */}
      {/* ========================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-[750px] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col relative">

            <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-white shrink-0 z-10">
              <div>
                <h2 className="font-['Space_Grotesk',sans-serif] text-base font-bold text-gray-900">Reservation Folio</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-blue-600 tracking-wider font-bold uppercase">
                    ID: {selectedBooking.bookingId}
                  </p>
                  <button
                    onClick={(e) => handleCopyBookingId(selectedBooking.bookingId, e)}
                    className="p-1 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-md border border-gray-200 shadow-2xs cursor-pointer"
                    title="Copy ID"
                  >
                    {copiedId === selectedBooking.bookingId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintFolio}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Print Folio"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 bg-white">
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border-b border-gray-100 bg-gray-900 p-3 gap-3">
                {getModalImages(selectedBooking).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Room View ${index + 1}`}
                    className="w-full sm:w-[85%] h-52 sm:h-64 object-cover rounded-xl flex-shrink-0 snap-center shadow-2xs border border-white/10"
                  />
                ))}
              </div>

              <div className="p-6 space-y-5 text-xs">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-blue-600 mb-2.5">
                    <Building2 size={15} />
                    <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest text-gray-500">Property Information</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Property Name</span>
                      <strong className="text-gray-900 text-sm font-bold">{selectedBooking.hotelId?.hotelName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Contact Email</span>
                      <strong className="text-gray-900 flex items-center gap-1.5 font-medium">
                        <Mail size={13} className="text-blue-600" /> {selectedBooking.hotelId?.hotelEmail}
                      </strong>
                    </div>
                    <div className="col-span-full">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Address Location</span>
                      <strong className="text-gray-900 flex items-start gap-1.5 font-medium">
                        <MapPin size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{selectedBooking.hotelId?.address || "Verified Location"}</span>
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-blue-600 mb-2.5">
                    <User size={15} />
                    <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest text-gray-500">Guest Information</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Name</span>
                      <strong className="text-gray-900 font-bold">{selectedBooking.userId?.name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Email</span>
                      <strong className="text-gray-900 truncate block font-medium">{selectedBooking.userId?.email}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Mobile</span>
                      <strong className="text-gray-900 font-medium">{selectedBooking.userId?.mobile || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Guests</span>
                      <strong className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block font-bold">{selectedBooking.totalGuests} Persons</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-blue-600 mb-2.5">
                    <Calendar size={15} />
                    <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest text-gray-500">Room & Schedule</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Room Info</span>
                      <strong className="text-gray-900 font-bold">{selectedBooking.roomId?.roomType} <span className="text-blue-600">(#{selectedBooking.roomId?.roomNumber})</span></strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Rate / Night</span>
                      <strong className="text-gray-900 font-bold">₹{selectedBooking.roomPrice?.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Check-In</span>
                      <strong className="text-gray-900 font-['IBM_Plex_Mono'] text-xs font-bold">{new Date(selectedBooking.checkIn).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-['IBM_Plex_Mono']">Check-Out</span>
                      <strong className="text-gray-900 font-['IBM_Plex_Mono'] text-xs font-bold">{new Date(selectedBooking.checkOut).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>

                {selectedBooking.specialRequest && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-2xs">
                    <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-amber-800 uppercase tracking-widest mb-1">Guest Special Request</p>
                    <p className="text-xs text-amber-900 font-medium italic">"{selectedBooking.specialRequest}"</p>
                  </div>
                )}

                <div className="bg-gray-900 text-white p-5 rounded-xl flex justify-between items-center shadow-md">
                  <div>
                    <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest mb-1">Duration: {selectedBooking.totalNights} Nights</p>
                    <p className="text-xs font-medium flex items-center gap-2">
                      Status:
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-gray-900 ${bookingBadge(selectedBooking.bookingStatus).bg}`}>
                        {selectedBooking.bookingStatus}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest mb-1">Final Amount</p>
                    <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-blue-400 leading-none">
                      ₹{selectedBooking.finalAmount?.toLocaleString()}
                    </h3>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between items-center">
              <div>
                {selectedBooking.bookingStatus !== "Cancelled" && selectedBooking.bookingStatus !== "Completed" && (
                  <button
                    onClick={() => {
                      handleBookingAction(selectedBooking._id, "cancel");
                      setSelectedBooking(null);
                    }}
                    className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Ban size={14} /> Cancel Booking
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-2xs cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;