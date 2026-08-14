import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

import {
    Calendar,
    Hotel,
    ArrowLeft,
    MapPin,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck,
    Eye,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Menu,
    LayoutDashboard,
    LogOut,
    Lock,
    Star,
    MessageSquare
} from "lucide-react";

// 🖼️ Room Image Slider Component (Compact)
const RoomImageSlider = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden bg-gray-900 group shadow-2xs border border-gray-200">
            <img
                src={images[currentIndex]}
                className="w-full h-full object-cover transition-all duration-500"
                alt="Property Slide"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none"></div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow-sm transition opacity-80 group-hover:opacity-100 cursor-pointer"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow-sm transition opacity-80 group-hover:opacity-100 cursor-pointer"
                    >
                        <ChevronRight size={15} />
                    </button>
                </>
            )}

            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${idx === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const MyBookings = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(null);

    // Default Tab
    const [activeTab, setActiveTab] = useState("current");

    // Navbar States
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Modal State
    const [selectedBooking, setSelectedBooking] = useState(null);

    // ⭐ REVIEW SYSTEM STATES
    const [reviewModal, setReviewModal] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [ratings, setRatings] = useState({
        cleanliness: 0,
        staff: 0,
        location: 0,
        valueForMoney: 0
    });
    const [reviewText, setReviewText] = useState("");
    const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
    const [localReviews, setLocalReviews] = useState({});

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchBookings();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${signupApi}booking/myBookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data.bookings || []);
        } catch (error) {
            console.error("Fetch bookings error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            setCancelLoading(bookingId);
            await axios.put(`${signupApi}booking/cancel/${bookingId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Booking cancelled successfully.");
            fetchBookings();
        } catch (error) {
            console.error("Cancel Error:", error);
            toast.error(error.response?.data?.message || "Failed to cancel booking.");
        } finally {
            setCancelLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    const handleViewDetails = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${signupApi}booking/details/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedBooking(res.data.booking);
        } catch (error) {
            console.error("Error fetching booking details:", error);
            toast.error("Failed to load booking details.");
        }
    };

    // ⭐ HANDLE DETAILED REVIEW SUBMISSION
    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!ratings.cleanliness || !ratings.staff || !ratings.location || !ratings.valueForMoney) {
            toast.error("Please provide a star rating for all categories.");
            return;
        }

        try {
            setReviewSubmitLoading(true);

            const payload = {
                bookingId: reviewBooking._id,
                cleanliness: ratings.cleanliness,
                staff: ratings.staff,
                location: ratings.location,
                valueForMoney: ratings.valueForMoney,
                review: reviewText.trim()
            };

            await axios.post(`${signupApi}review/create`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Thank you! Your feedback helps us improve.");

            const averageRating = (ratings.cleanliness + ratings.staff + ratings.location + ratings.valueForMoney) / 4;
            const roundedRating = Math.round(averageRating * 10) / 10;

            setLocalReviews(prev => ({
                ...prev,
                [reviewBooking._id]: { overallRating: roundedRating, review: reviewText.trim() }
            }));

            closeReviewModal();
        } catch (error) {
            console.error("Review Submit Error:", error);
            toast.error(error.response?.data?.message || "Failed to submit review.");
        } finally {
            setReviewSubmitLoading(false);
        }
    };

    const closeReviewModal = () => {
        if (reviewSubmitLoading) return;
        setReviewModal(false);
        setReviewBooking(null);
        setRatings({ cleanliness: 0, staff: 0, location: 0, valueForMoney: 0 });
        setReviewText("");
    };

    // 🎯 COUNTS FOR TABS
    const currentCount = bookings.filter((b) => ["Pending", "Confirmed", "Checked In"].includes(b.bookingStatus)).length;
    const completedCount = bookings.filter((b) => b.bookingStatus === "Completed").length;
    const cancelledCount = bookings.filter((b) => b.bookingStatus === "Cancelled").length;

    // 🎯 FILTER LOGIC: 3 TABS
    const filteredBookings = bookings.filter((b) => {
        if (activeTab === "current") {
            return ["Pending", "Confirmed", "Checked In"].includes(b.bookingStatus);
        }
        if (activeTab === "completed") {
            return b.bookingStatus === "Completed";
        }
        if (activeTab === "cancelled") {
            return b.bookingStatus === "Cancelled";
        }
        return true;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case "Confirmed":
                return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs"><CheckCircle2 size={12} /> Confirmed</span>;
            case "Pending":
                return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs"><Clock size={12} /> Pending</span>;
            case "Cancelled":
                return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs"><XCircle size={12} /> Cancelled</span>;
            case "Checked In":
                return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs"><Clock size={12} /> Checked In</span>;
            case "Completed":
                return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs"><ShieldCheck size={12} /> Completed</span>;
            default:
                return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-2xs">{status}</span>;
        }
    };

    const ratingCategories = [
        { key: "cleanliness", label: "Room Cleanliness" },
        { key: "staff", label: "Staff Behaviour" },
        { key: "location", label: "Location" },
        { key: "valueForMoney", label: "Value for Money" }
    ];

    if (loading) {
        return (
            <div className="h-screen flex flex-col justify-center items-center bg-gray-50 space-y-3">
                <Loader2 className="animate-spin text-blue-600" size={28} />
                <p className="text-gray-400 text-[11px] font-['IBM_Plex_Mono',monospace] uppercase tracking-widest font-semibold">Loading Itinerary...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 text-gray-800 font-['Inter',sans-serif] flex flex-col justify-between">
            <Toaster position="top-right" richColors />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div>
                {/* 🌐 NAVBAR */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-2xs py-4 border-b border-gray-200">
                    <div className="max-w-[1600px] mx-auto px-6 sm:px-8 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-2xs">
                                <Hotel size={18} />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-gray-900 font-['Space_Grotesk']">
                                AuraStays
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {!token ? (
                                <>
                                    <button onClick={() => navigate("/login")} className="px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition cursor-pointer">
                                        Sign In
                                    </button>
                                    <button onClick={() => navigate("/signup")} className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer">
                                        Get Started
                                    </button>
                                </>
                            ) : (
                                <div className="relative ml-2 pl-4 border-l border-gray-200" ref={dropdownRef}>
                                    <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white cursor-pointer shadow-2xs">
                                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <span className="font-bold text-xs">{user?.name}</span>
                                    </button>

                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2.5 border-b border-gray-100">
                                                <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono',monospace] uppercase font-bold">Signed in as</p>
                                                <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{user?.email}</p>
                                            </div>
                                            <button onClick={() => { setProfileDropdownOpen(false); navigate("/myBookings"); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50/60 hover:text-blue-600 flex items-center gap-2.5 font-semibold transition cursor-pointer">
                                                <Calendar size={14} className="text-blue-600" /> My Reservations
                                            </button>
                                            {(user?.role === "admin" || user?.role === "hotel") && (
                                                <button onClick={() => { setProfileDropdownOpen(false); navigate("/dashboard"); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50/60 hover:text-blue-600 flex items-center gap-2.5 font-semibold transition cursor-pointer">
                                                    <LayoutDashboard size={14} className="text-blue-600" /> Management Console
                                                </button>
                                            )}
                                            <button onClick={() => { setProfileDropdownOpen(false); navigate("/reset-password"); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50/60 hover:text-blue-600 flex items-center gap-2.5 font-semibold transition cursor-pointer">
                                                <Lock size={14} className="text-blue-600" /> Reset Password
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button onClick={() => { setProfileDropdownOpen(false); handleLogout(); }} className="w-full text-left bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 mt-1">
                                                <LogOut size={14} /> Secure Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-800 bg-white">
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed top-20 left-4 right-4 z-50 bg-white shadow-2xl rounded-2xl p-4 flex flex-col gap-2 border border-gray-200 animate-in fade-in duration-150">
                        {!token ? (
                            <>
                                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">
                                    Sign In
                                </button>
                                <button onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }} className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center shadow-2xs">
                                    Get Started
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                                    <p className="font-bold text-gray-900 text-xs">{user?.name}</p>
                                    <p className="text-[11px] text-gray-400">{user?.email}</p>
                                </div>
                                <button onClick={() => { navigate("/myBookings"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 text-gray-700">
                                    <Calendar size={15} className="text-blue-600" /> My Reservations
                                </button>
                                {(user?.role === "admin" || user?.role === "hotel") && (
                                    <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 text-gray-700">
                                        <LayoutDashboard size={15} className="text-blue-600" /> Management Console
                                    </button>
                                )}
                                <button onClick={() => { navigate("/reset-password"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 text-gray-700">
                                    <Lock size={15} className="text-blue-600" /> Reset Password
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 mt-1">
                                    <LogOut size={15} /> Secure Logout
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* COMPACT HEADER */}
                <div className="bg-white border-b border-gray-200 pt-28 pb-8 px-6 sm:px-8 relative overflow-hidden shadow-2xs">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none"></div>
                    <div className="max-w-4xl mx-auto relative z-10">
                        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 hover:underline font-['IBM_Plex_Mono'] cursor-pointer">
                            <ArrowLeft size={14} /> Back to Home
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] tracking-tight text-gray-900">My Reservations</h1>
                        <p className="text-gray-500 mt-1 text-xs max-w-md leading-relaxed font-medium">Manage your upcoming stays, completed trips and booking history.</p>
                    </div>
                </div>

                {/* COMPACT BOOKINGS LIST */}
                <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">

                    {/* 3 TABS LAYOUT WITH DYNAMIC COUNTS */}
                    <div className="bg-white rounded-2xl p-1.5 shadow-2xs border border-gray-200 flex overflow-x-auto scrollbar-hide mb-6 sticky top-24 z-40">
                        {[
                            { key: "current", label: "Upcoming", count: currentCount },
                            { key: "completed", label: "Completed", count: completedCount },
                            { key: "cancelled", label: "Cancelled", count: cancelledCount }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 min-w-[110px] text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${activeTab === tab.key
                                    ? "bg-blue-600 text-white shadow-2xs font-semibold"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-2xs p-12 text-center max-w-md mx-auto mt-4">
                            <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-4 shadow-2xs">
                                <Calendar size={24} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-base font-bold font-['Space_Grotesk'] text-gray-900 mb-1">
                                {activeTab === "current" && "No upcoming stays"}
                                {activeTab === "completed" && "No completed trips"}
                                {activeTab === "cancelled" && "No cancelled bookings"}
                            </h2>
                            <p className="text-gray-500 text-xs mb-6 leading-relaxed">
                                {activeTab === "current" && "You haven't booked your next getaway yet."}
                                {activeTab === "completed" && "Your past completed trips will appear here."}
                                {activeTab === "cancelled" && "Your cancelled reservations will appear here."}
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-2xs cursor-pointer"
                            >
                                Explore Hotels
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[11px] font-bold text-gray-400 font-['IBM_Plex_Mono',monospace] uppercase tracking-widest">
                                    Total Reservations ({filteredBookings.length})
                                </p>
                            </div>

                            {filteredBookings.map((b) => {
                                const isReviewed = b.isReviewed || b.review || localReviews[b._id];
                                const reviewData = localReviews[b._id] || b.review;

                                let displayRating = reviewData?.overallRating || reviewData?.rating;
                                if (!displayRating && reviewData && reviewData.cleanliness) {
                                    displayRating = (reviewData.cleanliness + reviewData.staff + reviewData.location + reviewData.valueForMoney) / 4;
                                }

                                return (
                                    <div key={b._id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row gap-5 shadow-2xs hover:shadow-md transition-all duration-300">

                                        {/* Thumbnail Image */}
                                        <div className="w-full md:w-44 h-32 relative rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                                            <img src={b.hotelId?.hotelImages?.[0] || b.roomId?.roomImages?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"} alt="Room" className="w-full h-full object-cover" />
                                            <div className="absolute top-2 left-2">
                                                {getStatusBadge(b.bookingStatus)}
                                            </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start flex-wrap gap-2">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-['IBM_Plex_Mono'] mb-0.5">ID: {b.bookingId}</p>
                                                        <h3 className="text-lg font-bold text-gray-900 font-['Space_Grotesk'] leading-tight">{b.hotelId?.hotelName || "Hotel Details"}</h3>
                                                        <p className="text-gray-500 text-xs mt-0.5 font-medium">{b.roomId?.roomType || "Standard Room"}</p>

                                                        {b.bookingStatus === "Cancelled" && (
                                                            <div className="mt-2">
                                                                <p className="text-[11px] text-rose-600 font-medium bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-2xs">
                                                                    <XCircle size={13} className="text-rose-500" />
                                                                    <span className="font-bold">Reason:</span> {b.cancelReason || "Cancelled by System / User"}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">₹{Number(b.totalAmount).toLocaleString("en-IN")}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase font-['IBM_Plex_Mono']">Paid via {b.paymentMethod || "Card"}</p>
                                                    </div>
                                                </div>

                                                {/* Compact Info Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Check-In</p>
                                                        <p className="font-bold text-gray-900 mt-0.5">{new Date(b.checkIn).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Check-Out</p>
                                                        <p className="font-bold text-gray-900 mt-0.5">{new Date(b.checkOut).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Guests</p>
                                                        <p className="font-bold text-gray-900 mt-0.5">{b.totalGuests}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Location</p>
                                                        <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-1"><MapPin size={11} className="text-blue-600" /> {b.hotelId?.city?.cityName || "City"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons & Review Badges */}
                                            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3">

                                                <div className="w-full md:w-auto">
                                                    {b.bookingStatus === "Completed" && !isReviewed && (
                                                        <button
                                                            onClick={() => {
                                                                setReviewBooking(b);
                                                                setReviewModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer border border-amber-200 shadow-2xs"
                                                        >
                                                            <Star size={13} className="text-amber-500 fill-amber-500" /> Write a Review
                                                        </button>
                                                    )}

                                                    {isReviewed && reviewData && (
                                                        <div className="flex flex-col gap-1 mt-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                                                            <div className="flex items-center gap-1">
                                                                {displayRating ? (
                                                                    [...Array(5)].map((_, i) => (
                                                                        <Star key={i} size={14} className={i < Math.round(displayRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                                                    ))
                                                                ) : (
                                                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                                )}
                                                                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider ml-1.5 flex items-center gap-1 border border-emerald-200">
                                                                    <CheckCircle2 size={10} /> Reviewed {displayRating ? `(${displayRating}/5)` : ""}
                                                                </span>
                                                            </div>
                                                            {reviewData.review && (
                                                                <p className="text-xs text-gray-500 italic max-w-sm line-clamp-1 font-medium">
                                                                    "{reviewData.review}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2.5 w-full md:w-auto">
                                                    <button
                                                        onClick={() => handleViewDetails(b._id)}
                                                        className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                                                    >
                                                        <Eye size={14} /> View Details
                                                    </button>

                                                    {["Pending", "Confirmed"].includes(b.bookingStatus) && (
                                                        <button
                                                            onClick={() => handleCancel(b._id)}
                                                            disabled={cancelLoading === b._id}
                                                            className="w-full md:w-auto px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                                        >
                                                            {cancelLoading === b._id && <Loader2 size={13} className="animate-spin" />}
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* ⭐ WRITE DETAILED REVIEW MODAL */}
            {/* ========================================== */}
            {reviewModal && reviewBooking && (
                <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={closeReviewModal}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-[500px] w-full shadow-2xl border border-gray-200 p-6 sm:p-8 relative">

                        <button
                            onClick={closeReviewModal}
                            disabled={reviewSubmitLoading}
                            className="absolute top-5 right-5 z-20 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <div className="mb-6 border-b border-gray-100 pb-4">
                            <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
                                Share Your Experience
                            </span>
                            <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900 pr-6">
                                {reviewBooking.hotelId?.hotelName}
                            </h2>
                            <p className="text-gray-500 text-xs mt-0.5 font-medium">Stay completed on: {new Date(reviewBooking.checkOut).toDateString()}</p>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-5 text-xs">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                                {ratingCategories.map((category) => (
                                    <div key={category.key} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 font-['IBM_Plex_Mono']">
                                            {category.label}
                                        </label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={18}
                                                    onClick={() => setRatings(prev => ({ ...prev, [category.key]: star }))}
                                                    className={`cursor-pointer transition-colors duration-200 ${ratings[category.key] >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-gray-400"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 font-['IBM_Plex_Mono']">
                                    Additional Comments (Optional)
                                </label>
                                <div className="relative">
                                    <MessageSquare size={15} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                                    <textarea
                                        rows={3}
                                        maxLength={500}
                                        placeholder="Tell us what you loved (or what could be better)..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        className="w-full border border-gray-200 bg-gray-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 text-xs resize-none transition shadow-2xs"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={reviewSubmitLoading || !ratings.cleanliness || !ratings.staff || !ratings.location || !ratings.valueForMoney}
                                className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {reviewSubmitLoading && <Loader2 size={15} className="animate-spin" />}
                                {reviewSubmitLoading ? "Submitting..." : "Submit Verified Review"}
                            </button>

                        </form>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* 🔍 COMPACT DETAILS MODAL */}
            {/* ========================================== */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-[550px] w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 sm:p-8 relative">

                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-5 right-5 z-20 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
                            Reservation Summary
                        </span>
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 mb-4 pr-6">
                            {selectedBooking.hotelId?.hotelName || "Hotel Booking"}
                        </h2>

                        <div className="mb-5">
                            <RoomImageSlider
                                images={
                                    selectedBooking.hotelId?.hotelImages?.length > 0
                                        ? selectedBooking.hotelId.hotelImages
                                        : selectedBooking.roomId?.roomImages?.length > 0
                                            ? selectedBooking.roomId.roomImages
                                            : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800"]
                                }
                            />
                        </div>

                        <div className="space-y-4 text-xs">

                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Booking ID</p>
                                    <p className="font-['IBM_Plex_Mono'] font-bold text-gray-900 mt-0.5">{selectedBooking.bookingId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Status</p>
                                    <p className="font-bold text-blue-600 mt-0.5">{selectedBooking.bookingStatus}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Room Assignment</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{selectedBooking.roomId?.roomType} <span className="text-blue-600">(#{selectedBooking.roomId?.roomNumber})</span></p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Guests & Nights</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{selectedBooking.totalGuests} Guests / {selectedBooking.totalNights} Nights</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t border-b border-gray-200 py-3.5">
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Check-In Date</p>
                                    <p className="font-bold text-gray-900 mt-1 text-xs">{new Date(selectedBooking.checkIn).toDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Check-Out Date</p>
                                    <p className="font-bold text-gray-900 mt-1 text-xs">{new Date(selectedBooking.checkOut).toDateString()}</p>
                                </div>
                            </div>

                            {selectedBooking.specialRequest && (
                                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl shadow-2xs">
                                    <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-amber-800 uppercase tracking-widest mb-1">Special Requests</p>
                                    <p className="text-xs text-amber-900 font-medium italic">"{selectedBooking.specialRequest}"</p>
                                </div>
                            )}

                            {selectedBooking.bookingStatus === "Cancelled" && (
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-2xs">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <XCircle size={14} className="text-rose-600" />
                                        <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-rose-800 uppercase tracking-widest">Cancellation Details</p>
                                    </div>
                                    <p className="text-xs text-rose-900 font-medium">
                                        <span className="font-bold mr-1">Reason:</span>
                                        "{selectedBooking.cancelReason || "Cancelled by System / User"}"
                                    </p>
                                </div>
                            )}

                            <div className="bg-gray-900 text-white p-5 rounded-2xl flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest mb-0.5">Payment Status</p>
                                    <p className="text-xs font-bold text-emerald-400">{selectedBooking.paymentStatus}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest mb-0.5">Final Amount</p>
                                    <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-emerald-400 leading-none">₹{selectedBooking.finalAmount?.toLocaleString()}</h3>
                                </div>
                            </div>

                            {(() => {
                                const selectedIsReviewed = selectedBooking.isReviewed || selectedBooking.review || localReviews[selectedBooking._id];
                                const selectedReviewData = localReviews[selectedBooking._id] || selectedBooking.review;

                                let selectedRating = selectedReviewData?.overallRating || selectedReviewData?.rating;
                                if (!selectedRating && selectedReviewData && selectedReviewData.cleanliness) {
                                    selectedRating = (selectedReviewData.cleanliness + selectedReviewData.staff + selectedReviewData.location + selectedReviewData.valueForMoney) / 4;
                                }

                                if (selectedIsReviewed && selectedReviewData) {
                                    return (
                                        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl mt-4">
                                            <p className="text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-emerald-800 uppercase tracking-widest mb-2">Your Feedback</p>
                                            <div className="flex items-center gap-1 mb-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={15} className={i < Math.round(selectedRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                                ))}
                                                <span className="font-bold text-xs text-gray-900 ml-1.5">{selectedRating}/5</span>
                                            </div>
                                            {selectedReviewData.review && (
                                                <p className="text-xs text-gray-600 italic leading-relaxed">"{selectedReviewData.review}"</p>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                        </div>

                        <div className="mt-6 flex justify-end pt-4 border-t border-gray-100">
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

export default MyBookings;