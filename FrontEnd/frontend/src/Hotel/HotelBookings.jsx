import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster, toast } from "sonner";
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
  Filter
} from "lucide-react";

const HotelBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("current"); // "current", "completed", "cancelled", "all"

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHotelBookings();
  }, []);

  const fetchHotelBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${signupApi}booking/hotelBookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error("Fetch hotel bookings error:", error);
      toast.error("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Booking Status Actions (Confirm, Check-In, Complete)
  const handleBookingAction = async (bookingId, actionType) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      let endpoint = "";

      if (actionType === "confirm") endpoint = `booking/confirm/${bookingId}`;
      if (actionType === "checkin") endpoint = `booking/checkin/${bookingId}`;
      if (actionType === "complete") endpoint = `booking/complete/${bookingId}`;

      const res = await axios.patch(`${signupApi}${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message || "Status updated successfully.");

      fetchHotelBookings();
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking(res.data.booking);
      }
    } catch (error) {
      console.error("Action Error:", error);
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const status = b.bookingStatus;
      if (activeTab === "current") {
        return ["Pending", "Confirmed", "Checked In"].includes(status);
      }
      if (activeTab === "completed") {
        return status === "Completed";
      }
      if (activeTab === "cancelled") {
        return status === "Cancelled";
      }
      return true; // "all"
    });
  }, [bookings, activeTab]);

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

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-50 space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-xs font-['IBM_Plex_Mono',monospace] uppercase tracking-widest font-semibold">Loading Property Reservations...</p>
      </div>
    );
  }

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
          <button
            onClick={() => navigate("/hotel/hotelDashboard")}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4.5 py-2.5 rounded-xl transition text-xs font-semibold shadow-sm"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-8">

        {/* 🗂️ TABS FILTER */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {[
            { key: "current", label: "Current Bookings", count: bookings.filter(b => ["Pending", "Confirmed", "Checked In"].includes(b.bookingStatus)).length },
            { key: "completed", label: "Completed Stays", count: bookings.filter(b => b.bookingStatus === "Completed").length },
            { key: "cancelled", label: "Cancelled", count: bookings.filter(b => b.bookingStatus === "Cancelled").length },
            { key: "all", label: "All Bookings", count: bookings.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === tab.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.key ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm p-16 text-center max-w-lg mx-auto mt-8">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-5 shadow-2xs">
              <Users size={30} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900 mb-1">No Bookings Found</h2>
            <p className="text-gray-500 text-xs mb-6">There are no bookings under this category right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const badgeInfo = bookingBadge(booking.bookingStatus);
              const roomImage = booking.roomId?.roomImages?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600";

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center gap-5 group"
                >
                  {/* Room Thumbnail */}
                  <div className="w-full md:w-40 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200">
                    <img
                      src={roomImage}
                      alt="Room"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  {/* Summary Info */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900 leading-tight">
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

                    <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2.5 text-xs border-t border-gray-100">
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

                  {/* Action Button */}
                  <div className="w-full md:w-auto flex justify-end shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-5">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs"
                    >
                      <Eye size={15} /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 🔍 COMPLETE DETAILS MODAL WITH IMAGE GALLERY */}
      {/* ========================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-[650px] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col relative">

            {/* Modal Header */}
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
                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto flex-1 bg-white">

              {/* 🔥 HORIZONTAL SCROLLING IMAGE GALLERY 🔥 */}
              <div className="relative border-b border-gray-100 bg-gray-900">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide p-3 gap-3 h-56 sm:h-64">
                  {getModalImages(selectedBooking).map((img, index) => (
                    <div key={index} className="w-full sm:w-[90%] h-full flex-shrink-0 snap-center relative">
                      <img
                        src={img}
                        alt={`Room View ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl shadow-xs border border-white/10"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest shadow-sm">
                        {index + 1} / {getModalImages(selectedBooking).length}
                      </div>
                    </div>
                  ))}
                </div>
                {getModalImages(selectedBooking).length > 1 && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-900 shadow-sm flex items-center gap-1">
                    Swipe <ArrowRight size={11} />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-5 text-xs">

                {/* Guest Information */}
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

                {/* Room & Schedule */}
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

                {/* Revenue Card */}
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

                {/* 🛠️ BOOKING MANAGEMENT ACTIONS */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-3 justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Update Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.bookingStatus === "Pending" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "confirm")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs"
                      >
                        Confirm Booking
                      </button>
                    )}
                    {selectedBooking.bookingStatus === "Confirmed" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "checkin")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs"
                      >
                        Check-In Guest
                      </button>
                    )}
                    {selectedBooking.bookingStatus === "Checked In" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "complete")}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs"
                      >
                        Complete Stay
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-2xs"
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