import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
    MapPin,
    Users,
    BedDouble,
    Check,
    Star,
    Wifi,
    Waves,
    Sparkles,
    Dumbbell,
    Utensils,
    Car,
    Clock,
    ShieldCheck,
    ChevronRight,
    ChevronLeft,
    Share,
    Heart,
    X,
    Eye,
    Loader2,
    Hotel,
    Menu,
    Calendar,
    LayoutDashboard,
    LogOut,
    Lock
} from "lucide-react";

const amenityIcons = {
    "Free WiFi": <Wifi size={18} />,
    "Free Wi-Fi": <Wifi size={18} />,
    Parking: <Car size={18} />,
    "Swimming Pool": <Waves size={18} />,
    Gym: <Dumbbell size={18} />,
    "Gym / Fitness Center": <Dumbbell size={18} />,
    Spa: <Sparkles size={18} />,
    "Spa & Wellness": <Sparkles size={18} />,
    Restaurant: <Utensils size={18} />,
};

// 🖼️ Room Image Slider Component (Scrollable / Swipeable)
const RoomImageSlider = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
            setCurrentIndex(index);
        }
    };

    const scrollToImage = (idx) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: idx * scrollRef.current.clientWidth,
                behavior: "smooth",
            });
            setCurrentIndex(idx);
        }
    };

    return (
        <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden bg-gray-900 shadow-inner border border-gray-200">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
            >
                {images.map((img, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                        <img
                            src={img}
                            className="w-full h-full object-cover"
                            alt={`Room Slide ${idx + 1}`}
                        />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none"></div>

            {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full z-10 pointer-events-auto">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                scrollToImage(idx);
                            }}
                            className={`h-2 rounded-full transition-all cursor-pointer ${idx === currentIndex ? "bg-white w-5" : "bg-white/50 w-2"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [roomSearch, setRoomSearch] = useState("");
    const [roomSort, setRoomSort] = useState("lowToHigh");

    const [isSaved, setIsSaved] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    // Navbar States
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Booking Modal States
    const [bookingModal, setBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    // 🔒 Hold System States
    const [holdDetails, setHoldDetails] = useState(null);
    const [holdLoading, setHoldLoading] = useState(false);

    // ⏳ SMART UI TIMER STATES
    const [expireTime, setExpireTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // 🏷️ Coupon States
    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);

    // 🔍 Room Details Modal State
    const [viewRoomModal, setViewRoomModal] = useState(null);

    const [bookedDates, setBookedDates] = useState([]);
    const [bookingForm, setBookingForm] = useState({
        checkIn: null,
        checkOut: null,
        totalGuests: 1,
        specialRequest: "",
    });

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchDetails = async () => {
            try {
                const hotelRes = await axios.get(`${signupApi}hotel/public/${id}`);
                const roomsRes = await axios.get(`${signupApi}room/public/hotel/${id}`);

                setHotel(hotelRes.data.hotel);
                setRooms(roomsRes.data.rooms || []);
            } catch (error) {
                console.error("Error fetching hotel details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 1. Timer Setup based on Hold Data
    useEffect(() => {
        if (holdDetails?.expiresAt) {
            setExpireTime(new Date(holdDetails.expiresAt).getTime());
        } else {
            setExpireTime(null);
            setTimeLeft(null);
        }
    }, [holdDetails]);

    // 2. Live Countdown Logic
    useEffect(() => {
        if (!expireTime) {
            setTimeLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = expireTime - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft("00:00");
            } else {
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expireTime]);

    // 3. Reusable Cancel Hold Function
    const cancelCurrentHold = async (holdId) => {
        if (!holdId) return;
        try {
            await axios.delete(`${signupApi}temporary/cancel/${holdId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to cancel hold", error);
        }
    };

    // 4. Auto-cancel when timer reaches 00:00
    useEffect(() => {
        if (timeLeft === "00:00" && holdDetails) {
            cancelCurrentHold(holdDetails._id);
        }
    }, [timeLeft, holdDetails, token]);

    // 🔙 5. BACK BUTTON LOGIC (Change Dates)
    const handleBackToDates = () => {
        if (holdDetails) {
            cancelCurrentHold(holdDetails._id);
        }

        setHoldDetails(null);
        setTimeLeft(null);
        setExpireTime(null);
    };

    const processedRooms = useMemo(() => {
        let data = [...rooms];
        if (roomSearch) {
            data = data.filter((room) =>
                room.roomType?.toLowerCase().includes(roomSearch.toLowerCase())
            );
        }
        if (roomSort === "lowToHigh") {
            data.sort((a, b) => Number(a.pricePerNight) - Number(b.pricePerNight));
        }
        if (roomSort === "highToLow") {
            data.sort((a, b) => Number(b.pricePerNight) - Number(a.pricePerNight));
        }
        return data;
    }, [rooms, roomSearch, roomSort]);

    const displayCity = hotel?.city?.cityName || hotel?.city || "City";
    const displayState = hotel?.city?.districtId?.stateId?.stateName || "State";
    const minPrice = rooms.length > 0 ? Math.min(...rooms.map((room) => Number(room.pricePerNight) || 0)) : 0;
    const hotelImages = hotel?.hotelImages?.length > 0 ? hotel.hotelImages : Array(5).fill("https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200");

    const handleReserve = async (room) => {
        if (!token) {
            alert("Please login first to reserve this room.");
            navigate("/login");
            return;
        }

        try {
            const res = await axios.get(`${signupApi}booking/bookedDates/${room._id}`);
            const normalizedBookedDates = (res.data.bookedDates || []).map((date) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d;
            });
            setBookedDates(normalizedBookedDates);
        } catch (error) {
            console.log("Could not fetch booked dates, proceeding with empty calendar:", error);
            setBookedDates([]);
        } finally {
            setSelectedRoom(room);
            setSelectedCoupon("");
            setDiscountAmount(0);
            setBookingForm({
                checkIn: null,
                checkOut: null,
                totalGuests: 1,
                specialRequest: "",
            });
            setBookingModal(true);
        }
    };

    const closeBookingModal = () => {
        if (bookingLoading || holdLoading) return;

        if (holdDetails && timeLeft !== "00:00") {
            cancelCurrentHold(holdDetails._id);
        }

        setBookingModal(false);
        setSelectedRoom(null);
        setSelectedCoupon("");
        setDiscountAmount(0);
        setExpireTime(null);
        setTimeLeft(null);
        setHoldDetails(null);
    };

    const calculateNights = () => {
        if (!bookingForm.checkIn || !bookingForm.checkOut) return 0;
        const difference = bookingForm.checkOut.getTime() - bookingForm.checkIn.getTime();
        if (difference <= 0) return 0;
        return Math.ceil(difference / (1000 * 60 * 60 * 24));
    };

    const totalNights = calculateNights();
    const totalAmount = selectedRoom && totalNights > 0 ? Number(selectedRoom.pricePerNight) * totalNights : 0;

    const isDateAvailable = (date) => {
        const time = new Date(date).setHours(0, 0, 0, 0);
        return !bookedDates.some((booked) => new Date(booked).setHours(0, 0, 0, 0) === time);
    };

    const getMaxCheckoutDate = () => {
        if (!bookingForm.checkIn) return null;
        const checkInTime = new Date(bookingForm.checkIn).setHours(0, 0, 0, 0);
        const futureBookedDates = bookedDates
            .map(d => new Date(d).setHours(0, 0, 0, 0))
            .filter(time => time > checkInTime)
            .sort((a, b) => a - b);

        if (futureBookedDates.length > 0) return new Date(futureBookedDates[0]);
        return null;
    };

    const isRangeValid = (start, end) => {
        if (!start || !end) return true;
        let current = new Date(start.getTime());
        while (current < end) {
            const time = new Date(current).setHours(0, 0, 0, 0);
            const isBooked = bookedDates.some((d) => new Date(d).setHours(0, 0, 0, 0) === time);
            if (isBooked) return false;
            current.setDate(current.getDate() + 1);
        }
        return true;
    };

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!bookingModal || !token || totalAmount <= 0) {
                setCoupons([]);
                return;
            }
            try {
                const res = await axios.get(`${signupApi}coupon/available?amount=${totalAmount}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCoupons(res.data.coupons || []);
                if (selectedCoupon) {
                    const isValidStill = (res.data.coupons || []).some(c => c.couponCode === selectedCoupon);
                    if (!isValidStill) {
                        setSelectedCoupon("");
                        setDiscountAmount(0);
                    }
                }
            } catch (error) {
                setCoupons([]);
            }
        };
        fetchCoupons();
    }, [bookingModal, totalAmount, token, selectedCoupon]);

    const validateCoupon = async (couponCode) => {
        if (!couponCode) {
            setDiscountAmount(0);
            return;
        }
        try {
            const res = await axios.post(
                `${signupApi}coupon/validate`,
                { couponCode, bookingAmount: totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDiscountAmount(res.data.data?.calculatedDeduction || res.data.calculatedDeduction || 0);
        } catch (error) {
            setDiscountAmount(0);
        }
    };

    const handleHoldRoom = async () => {
        if (!bookingForm.checkIn || !bookingForm.checkOut) {
            alert("Please select Check-In and Check-Out dates first."); return;
        }
        if (!isRangeValid(bookingForm.checkIn, bookingForm.checkOut)) {
            alert("Selected date range includes already booked dates."); return;
        }

        try {
            setHoldLoading(true);
            const response = await axios.post(
                `${signupApi}temporary/hold`,
                {
                    roomId: selectedRoom._id,
                    checkIn: bookingForm.checkIn.toISOString(),
                    checkOut: bookingForm.checkOut.toISOString(),
                    totalGuests: Number(bookingForm.totalGuests),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setHoldDetails(response.data.hold);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Room is currently unavailable or already booked.");
        } finally {
            setHoldLoading(false);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (timeLeft === "00:00") {
            alert("Your reservation window has expired. Please try again.");
            return;
        }

        try {
            setBookingLoading(true);

            const response = await axios.post(
                `${signupApi}booking/create`,
                {
                    roomId: selectedRoom._id,
                    checkIn: bookingForm.checkIn.toISOString(),
                    checkOut: bookingForm.checkOut.toISOString(),
                    totalGuests: Number(bookingForm.totalGuests),
                    couponCode: selectedCoupon || undefined,
                    specialRequest: bookingForm.specialRequest.trim(),
                    holdId: holdDetails._id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(response.data?.message || "Booking created successfully.");

            setHoldDetails(null);
            setBookingModal(false);
            navigate("/myBookings");
        } catch (error) {
            console.error("Booking Error:", error);
            alert(error.response?.data?.message || "Booking failed.");
        } finally {
            setBookingLoading(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: hotel?.hotelName,
            text: `Check out ${hotel?.hotelName} in ${displayCity}`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
            }
        } catch (error) {
            console.log("Share cancelled:", error);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-32 animate-pulse font-['Inter',sans-serif]">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded-lg w-1/4 mb-8" />
                <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[50vh] min-h-[400px] mb-12">
                    <div className="col-span-2 row-span-2 bg-gray-200 rounded-2xl" />
                    <div className="bg-gray-200 rounded-xl" />
                    <div className="bg-gray-200 rounded-xl" />
                    <div className="bg-gray-200 rounded-xl" />
                    <div className="bg-gray-200 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 font-['Inter',sans-serif]">
                <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 mb-2">Hotel Not Found</h2>
                <p className="text-gray-500 mb-6 text-sm">This hotel is currently unavailable.</p>
                <button onClick={() => navigate("/")} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-2xs">
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 min-h-screen text-gray-800 font-['Inter',sans-serif] flex flex-col justify-between">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
                
                .react-datepicker-wrapper { width: 100%; }
                .react-datepicker {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 0.9rem !important;
                    border: 1px solid #E5E7EB !important;
                    border-radius: 16px !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08) !important;
                    padding: 8px !important;
                }
                .react-datepicker__header {
                    background-color: white !important;
                    border-bottom: 1px solid #F3F4F6 !important;
                    padding-top: 10px !important;
                }
                .react-datepicker__current-month {
                    font-family: 'Space Grotesk', sans-serif !important;
                    font-size: 1.05rem !important;
                    color: #111827 !important;
                    margin-bottom: 6px !important;
                }
                .react-datepicker__day-name, .react-datepicker__day {
                    width: 2.3rem !important; 
                    line-height: 2.3rem !important; 
                    margin: 0.15rem !important;
                    border-radius: 10px !important;
                    font-weight: 500;
                }
                .react-datepicker__day-name { color: #9CA3AF !important; font-weight: 700 !important; }
                .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
                    background-color: #2563EB !important;
                    color: white !important;
                    font-weight: bold !important;
                }
                .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
                    background-color: #EFF6FF !important;
                    color: #2563EB !important;
                }
                .react-datepicker__day--disabled { color: #D1D5DB !important; }
                .react-datepicker-popper { z-index: 9999 !important; }
            `}</style>

            <div>
                {/* 🌐 PERMANENT CLEAN WHITE STICKY NAVBAR */}
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
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => navigate("/signup")}
                                        className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer"
                                    >
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
                                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 text-xs uppercase tracking-wider">
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

                <div className="max-w-[1600px] mx-auto px-6 sm:px-8 pt-28 lg:pb-24 pb-16">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-['IBM_Plex_Mono']">
                                <span onClick={() => navigate("/")} className="cursor-pointer hover:text-blue-600">Home</span>
                                <ChevronRight size={13} />
                                <span>{displayState}</span>
                                <ChevronRight size={13} />
                                <span className="text-gray-900">{displayCity}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-['Space_Grotesk'] tracking-tight">
                                {hotel.hotelName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2.5">
                                <span className="flex items-center gap-1 text-xs font-bold bg-gray-900 text-white px-2.5 py-1 rounded-lg shadow-2xs">
                                    <Star size={13} fill="currentColor" className="text-amber-400" />
                                    4.8 <span className="font-normal text-gray-300 ml-1">(124 Reviews)</span>
                                </span>
                                <p className="flex items-center gap-1.5 text-gray-600 text-xs font-medium">
                                    <MapPin size={14} className="text-blue-600" />
                                    {hotel.address}, {displayCity}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2.5">
                            <button onClick={handleShare} className="relative flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-2xs hover:bg-gray-50 transition cursor-pointer">
                                <Share size={15} /> Share
                                {shareCopied && (
                                    <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-md">
                                        Link copied!
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setIsSaved(!isSaved)} className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-2xs hover:bg-gray-50 transition cursor-pointer">
                                <Heart size={15} className={isSaved ? "text-rose-500 fill-rose-500" : "text-rose-500"} />
                                {isSaved ? "Saved" : "Save"}
                            </button>
                        </div>
                    </div>

                    {/* IMAGE GALLERY */}
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[40vh] md:h-[520px] min-h-[380px] mb-12 rounded-3xl overflow-hidden shadow-2xs border border-gray-200 bg-white p-2">
                        <div className="col-span-1 md:col-span-2 md:row-span-2 relative group rounded-2xl overflow-hidden">
                            <img src={hotelImages[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={hotel.hotelName} />
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                <ShieldCheck size={14} className="text-emerald-600" /> Verified Property
                            </div>
                        </div>
                        {hotelImages.slice(1, 5).map((image, index) => (
                            <div key={index} className="hidden md:block relative overflow-hidden group rounded-xl">
                                <img src={image || hotelImages[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={`${hotel.hotelName} ${index + 2}`} />
                            </div>
                        ))}
                    </div>

                    {/* MAIN BODY */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-8">

                            {/* HIGHLIGHTS */}
                            <div className="flex flex-wrap gap-4 border-b border-gray-200 pb-8">
                                <div className="bg-white px-5 py-4 rounded-2xl border border-gray-200 shadow-2xs flex-1 min-w-[140px] text-center">
                                    <Users size={22} className="text-blue-600 mx-auto mb-2" />
                                    <p className="text-[10px] text-gray-400 uppercase font-bold font-['IBM_Plex_Mono']">Property Type</p>
                                    <p className="font-bold text-gray-900 text-base mt-0.5 font-['Space_Grotesk']">{hotel.hotelType}</p>
                                </div>
                                <div className="bg-white px-5 py-4 rounded-2xl border border-gray-200 shadow-2xs flex-1 min-w-[140px] text-center">
                                    <BedDouble size={22} className="text-blue-600 mx-auto mb-2" />
                                    <p className="text-[10px] text-gray-400 uppercase font-bold font-['IBM_Plex_Mono']">Total Inventory</p>
                                    <p className="font-bold text-gray-900 text-base mt-0.5 font-['Space_Grotesk']">{hotel.totalRooms} Rooms</p>
                                </div>
                                <div className="bg-white px-5 py-4 rounded-2xl border border-gray-200 shadow-2xs flex-1 min-w-[140px] text-center">
                                    <Clock size={22} className="text-blue-600 mx-auto mb-2" />
                                    <p className="text-[10px] text-gray-400 uppercase font-bold font-['IBM_Plex_Mono']">Check-In</p>
                                    <p className="font-bold text-gray-900 text-base mt-0.5 font-['Space_Grotesk']">02:00 PM</p>
                                </div>
                            </div>

                            {/* ABOUT */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
                                <h2 className="text-xl font-bold mb-3 text-gray-900 font-['Space_Grotesk'] tracking-tight">About this space</h2>
                                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-medium">{hotel.description}</p>
                            </div>

                            {/* AMENITIES */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
                                <h2 className="text-xl font-bold mb-5 text-gray-900 font-['Space_Grotesk'] tracking-tight">What this place offers</h2>
                                {hotel.amenities?.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {hotel.amenities.map((amenity, index) => (
                                            <div key={index} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                                                <div className="text-blue-600">{amenityIcons[amenity] || <Check size={16} className="text-blue-600" />}</div>
                                                {amenity}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-xs">No amenities listed.</p>
                                )}
                            </div>

                            {/* ROOMS SECTION WITH AVAILABILITY FILTER */}
                            <div id="rooms-section" className="pt-2">
                                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 gap-4 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
                                    <div className="w-full xl:w-auto shrink-0">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-['Space_Grotesk'] tracking-tight">Select your room</h2>
                                        <p className="text-gray-500 mt-0.5 text-xs font-medium">{processedRooms.length} room{processedRooms.length !== 1 ? "s" : ""} available</p>
                                    </div>

                                    <div className="flex flex-wrap gap-3 w-full xl:w-auto items-end">
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:w-48">
                                                <input
                                                    type="text"
                                                    placeholder="Search room..."
                                                    value={roomSearch}
                                                    onChange={(e) => setRoomSearch(e.target.value)}
                                                    className="border border-gray-200 pl-3.5 pr-8 py-2.5 outline-none focus:border-blue-500 rounded-xl text-xs font-medium w-full bg-gray-50/50 focus:bg-white shadow-2xs transition"
                                                />
                                                {roomSearch && (
                                                    <button type="button" onClick={() => setRoomSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                                                        <X size={15} />
                                                    </button>
                                                )}
                                            </div>
                                            <select
                                                value={roomSort}
                                                onChange={(e) => setRoomSort(e.target.value)}
                                                className="border border-gray-200 px-3.5 py-2.5 outline-none rounded-xl text-xs bg-white shadow-2xs cursor-pointer font-semibold text-gray-700"
                                            >
                                                <option value="lowToHigh">Price: Low to High</option>
                                                <option value="highToLow">Price: High to Low</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* ROOM CARDS */}
                                <div className="space-y-4">
                                    {processedRooms.length === 0 ? (
                                        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-3xl shadow-2xs">
                                            <BedDouble size={36} className="mx-auto text-gray-300 mb-2" />
                                            <p className="text-gray-500 font-medium text-sm font-['Space_Grotesk']">No rooms available matching criteria.</p>
                                        </div>
                                    ) : (
                                        processedRooms.map((room) => (
                                            <div key={room._id} className="bg-white border border-gray-200 rounded-3xl p-5 flex flex-col md:flex-row gap-5 shadow-2xs hover:shadow-md transition-all duration-300">
                                                <div className="w-full md:w-72 h-48 relative rounded-2xl overflow-hidden shrink-0 border border-gray-200">
                                                    <img src={room.roomImages?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"} alt={room.roomType} className="w-full h-full object-cover" />
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <div className="flex justify-between items-start gap-3">
                                                            <h3 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">{room.roomType}</h3>
                                                            <button
                                                                onClick={() => setViewRoomModal(room)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs transition cursor-pointer uppercase tracking-wider"
                                                            >
                                                                <Eye size={13} /> View Details
                                                            </button>
                                                        </div>

                                                        <p className="text-gray-500 text-xs mt-1.5 mb-3 line-clamp-2 font-medium">
                                                            {room.description || "Comfortable room designed for a relaxing stay."}
                                                        </p>

                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                                                <Users size={14} className="text-blue-600" /> Max {room.maxOccupancy} Guests
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                                                <BedDouble size={14} className="text-blue-600" /> {room.totalBeds} {room.bedType} Bed
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-end justify-between mt-4 pt-3 border-t border-gray-100">
                                                        <div>
                                                            <p className="text-2xl font-bold text-blue-600 font-['Space_Grotesk']">
                                                                ₹{Number(room.pricePerNight).toLocaleString("en-IN")}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono']">Per Night</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReserve(room)}
                                                            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 font-bold uppercase tracking-wider text-xs rounded-xl transition shadow-2xs cursor-pointer"
                                                        >
                                                            Reserve
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="w-full lg:w-[360px] shrink-0 hidden lg:block">
                            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl sticky top-24">
                                <div className="flex items-end gap-1.5 mb-5 border-b border-gray-100 pb-5">
                                    {minPrice > 0 ? (
                                        <>
                                            <span className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">₹{Number(minPrice).toLocaleString("en-IN")}</span>
                                            <span className="text-gray-400 font-medium text-xs mb-1">/ night onward</span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">Pricing Unavailable</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("rooms-section")?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition shadow-2xs cursor-pointer"
                                >
                                    Select a Room
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* 🔍 ROOM DETAILS MODAL */}
                {/* ========================================== */}
                {viewRoomModal && (
                    <div className="fixed inset-0 z-[110] bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative border border-gray-200">
                            <button
                                onClick={() => setViewRoomModal(null)}
                                className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>

                            <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
                                Room Specifications
                            </span>
                            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 mb-5">
                                {viewRoomModal.roomType}
                            </h2>

                            <RoomImageSlider
                                images={viewRoomModal.roomImages?.length > 0 ? viewRoomModal.roomImages : ["https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"]}
                            />

                            <div className="space-y-5 text-xs mt-5">
                                <p className="text-gray-600 leading-relaxed font-medium">{viewRoomModal.description || "No description provided for this room."}</p>

                                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                    <div>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase font-['IBM_Plex_Mono']">Max Occupancy</p>
                                        <p className="font-bold text-gray-900 mt-0.5">{viewRoomModal.maxOccupancy} Guests</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase font-['IBM_Plex_Mono']">Bed Config</p>
                                        <p className="font-bold text-gray-900 mt-0.5">{viewRoomModal.totalBeds} {viewRoomModal.bedType}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase font-['IBM_Plex_Mono']">Room Size</p>
                                        <p className="font-bold text-gray-900 mt-0.5">{viewRoomModal.roomSize ? `${viewRoomModal.roomSize} sq ft` : "Standard"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase font-['IBM_Plex_Mono']">Rate per Night</p>
                                        <p className="font-bold text-blue-600 mt-0.5">₹{Number(viewRoomModal.pricePerNight).toLocaleString("en-IN")}</p>
                                    </div>
                                </div>

                                {viewRoomModal.roomAmenities?.length > 0 && (
                                    <div>
                                        <p className="text-[11px] font-bold uppercase text-gray-400 mb-2.5 font-['IBM_Plex_Mono']">Room Amenities</p>
                                        <div className="flex flex-wrap gap-2">
                                            {viewRoomModal.roomAmenities.map((amenity, i) => (
                                                <span key={i} className="flex items-center gap-1 bg-gray-50 text-gray-700 px-3 py-1 rounded-xl text-xs font-medium border border-gray-200 shadow-2xs">
                                                    <Check size={12} className="text-blue-600" /> {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        const roomToBook = viewRoomModal;
                                        setViewRoomModal(null);
                                        handleReserve(roomToBook);
                                    }}
                                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-2xs cursor-pointer"
                                >
                                    Proceed to Reserve
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================= */}
                {/* 2-STEP BOOKING MODAL WITH AUTO TIMER */}
                {/* ========================================= */}
                {bookingModal && selectedRoom && (
                    <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={closeBookingModal}>
                        <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-gray-200">

                            {/* MODAL HEADER */}
                            <div className="shrink-0 bg-white flex items-center justify-between p-5 border-b border-gray-100">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-blue-600 font-['IBM_Plex_Mono']">Complete Reservation</p>
                                    <h2 className="text-lg font-bold text-gray-900 mt-0.5 font-['Space_Grotesk']">{selectedRoom.roomType}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    {timeLeft && (
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-2xs ${timeLeft === "00:00" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                            <Clock size={15} className={timeLeft !== "00:00" ? "animate-pulse" : ""} />
                                            <span className="text-xs font-bold font-['IBM_Plex_Mono'] tracking-wider">
                                                {timeLeft}
                                            </span>
                                        </div>
                                    )}
                                    <button type="button" disabled={bookingLoading || holdLoading} onClick={closeBookingModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer shrink-0">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* SCROLLABLE MODAL BODY */}
                            <div className="overflow-y-auto p-6 sm:p-8 space-y-5 relative text-xs">

                                {timeLeft === "00:00" && (
                                    <div className="p-4 rounded-xl flex flex-col items-center gap-2.5 border bg-rose-50 border-rose-200 text-rose-800 text-center mb-4">
                                        <p className="font-bold text-xs">Reservation Expired</p>
                                        <p className="text-[11px] mb-1">Your hold on this room has expired.</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setHoldDetails(null);
                                                setTimeLeft(null);
                                                setExpireTime(null);
                                            }}
                                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 transition text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                                        >
                                            Select Dates Again
                                        </button>
                                    </div>
                                )}

                                {/* PHASE 1: DATE SELECTION (BEFORE HOLD) */}
                                {!holdDetails && timeLeft !== "00:00" && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 font-['IBM_Plex_Mono']">
                                                    Check-In
                                                </label>
                                                <div className="relative">
                                                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 z-10 pointer-events-none" />
                                                    <DatePicker
                                                        selected={bookingForm.checkIn}
                                                        onChange={(date) => {
                                                            setBookingForm((prev) => ({
                                                                ...prev,
                                                                checkIn: date,
                                                                checkOut: null,
                                                            }));
                                                        }}
                                                        filterDate={isDateAvailable}
                                                        minDate={new Date()}
                                                        monthsShown={1}
                                                        isClearable
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="Select Check-In"
                                                        wrapperClassName="w-full"
                                                        portalId="root"
                                                        popperStrategy="fixed"
                                                        className="w-full border border-gray-200 bg-gray-50/50 focus:bg-white rounded-xl pl-10 pr-3.5 h-11 outline-none focus:border-blue-500 text-xs font-medium transition shadow-2xs cursor-pointer relative z-50"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 font-['IBM_Plex_Mono']">
                                                    Check-Out
                                                </label>
                                                <div className="relative">
                                                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 z-10 pointer-events-none" />
                                                    <DatePicker
                                                        selected={bookingForm.checkOut}
                                                        onChange={(date) => {
                                                            setBookingForm((prev) => ({
                                                                ...prev,
                                                                checkOut: date,
                                                            }));
                                                        }}
                                                        filterDate={isDateAvailable}
                                                        minDate={
                                                            bookingForm.checkIn
                                                                ? new Date(bookingForm.checkIn.getTime() + 24 * 60 * 60 * 1000)
                                                                : new Date()
                                                        }
                                                        maxDate={getMaxCheckoutDate()}
                                                        disabled={!bookingForm.checkIn}
                                                        monthsShown={1}
                                                        isClearable
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="Select Check-Out"
                                                        wrapperClassName="w-full"
                                                        portalId="root"
                                                        popperStrategy="fixed"
                                                        className="w-full border border-gray-200 bg-gray-50/50 focus:bg-white rounded-xl pl-10 pr-3.5 h-11 outline-none focus:border-blue-500 text-xs font-medium transition shadow-2xs disabled:opacity-50 cursor-pointer relative z-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 font-['IBM_Plex_Mono']">Total Guests</label>
                                            <select
                                                required
                                                value={bookingForm.totalGuests}
                                                onChange={(e) => {
                                                    setBookingForm(prev => ({ ...prev, totalGuests: e.target.value }));
                                                }}
                                                className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 h-11 outline-none focus:border-blue-500 text-xs cursor-pointer shadow-2xs font-medium text-gray-900"
                                            >
                                                {Array.from({ length: Number(selectedRoom.maxOccupancy) || 1 }, (_, index) => {
                                                    const guestCount = index + 1;
                                                    return (
                                                        <option key={guestCount} value={guestCount}>
                                                            {guestCount} Guest{guestCount > 1 ? "s" : ""}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleHoldRoom}
                                            disabled={holdLoading || totalNights <= 0}
                                            className="w-full mt-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {holdLoading && <Loader2 size={15} className="animate-spin" />}
                                            {holdLoading ? "Locking Dates..." : "Reserve Dates & Continue"}
                                        </button>
                                    </>
                                )}

                                {/* PHASE 2: DETAILS & PAYMENT (AFTER HOLD) */}
                                {holdDetails && timeLeft !== "00:00" && (
                                    <>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 font-['IBM_Plex_Mono']">
                                                Locked Schedule
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleBackToDates}
                                                className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:underline flex items-center gap-1 cursor-pointer transition"
                                            >
                                                <ChevronLeft size={13} /> Change Dates
                                            </button>
                                        </div>

                                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center text-xs mb-3 shadow-2xs relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-emerald-800 text-[10px] font-bold uppercase mb-0.5 font-['IBM_Plex_Mono']">Check-In</p>
                                                <p className="font-bold text-emerald-900">{bookingForm.checkIn.toLocaleDateString()}</p>
                                            </div>

                                            <div className="relative z-10 bg-white px-2 py-1 rounded-lg shadow-2xs border border-emerald-100">
                                                <ChevronRight className="text-emerald-600" size={13} />
                                            </div>

                                            <div className="text-right relative z-10">
                                                <p className="text-emerald-800 text-[10px] font-bold uppercase mb-0.5 font-['IBM_Plex_Mono']">Check-Out</p>
                                                <p className="font-bold text-emerald-900">{bookingForm.checkOut.toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 font-['IBM_Plex_Mono']">Special Request</label>
                                                <textarea
                                                    rows={3}
                                                    maxLength={500}
                                                    placeholder="Any special request? (Optional)"
                                                    value={bookingForm.specialRequest}
                                                    onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequest: e.target.value }))}
                                                    className="w-full border border-gray-200 bg-gray-50/50 focus:bg-white rounded-xl p-3.5 outline-none focus:border-blue-500 text-xs resize-none transition shadow-2xs"
                                                />
                                            </div>

                                            {coupons.length > 0 && (
                                                <div>
                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 font-['IBM_Plex_Mono']">
                                                        Available Coupons
                                                    </label>
                                                    <select
                                                        value={selectedCoupon}
                                                        onChange={(e) => {
                                                            setSelectedCoupon(e.target.value);
                                                            validateCoupon(e.target.value);
                                                        }}
                                                        className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 h-11 outline-none focus:border-blue-500 text-xs cursor-pointer shadow-2xs font-medium text-gray-900"
                                                    >
                                                        <option value="">Select Coupon</option>
                                                        {coupons.map((coupon) => (
                                                            <option key={coupon._id} value={coupon.couponCode}>
                                                                {coupon.couponCode} - {coupon.discountType === "Percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-200 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Price per night</span>
                                                    <span className="font-bold text-gray-900">₹{Number(selectedRoom.pricePerNight).toLocaleString("en-IN")}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Total nights</span>
                                                    <span className="font-bold text-gray-900">{totalNights}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Subtotal</span>
                                                    <span className="font-bold text-gray-900">₹{Number(totalAmount).toLocaleString("en-IN")}</span>
                                                </div>
                                                {discountAmount > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Discount</span>
                                                        <span className="text-emerald-600 font-bold">
                                                            -₹{discountAmount}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center">
                                                    <span className="font-bold text-gray-900">
                                                        Payable Amount
                                                    </span>
                                                    <span className="text-lg font-bold text-blue-600 font-['Space_Grotesk']">
                                                        ₹{Number(totalAmount - discountAmount).toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={bookingLoading}
                                                className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {bookingLoading && <Loader2 size={15} className="animate-spin" />}
                                                {bookingLoading ? "Confirming..." : `Confirm Booking • ₹${Number(totalAmount - discountAmount).toLocaleString("en-IN")}`}
                                            </button>
                                        </form>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelDetails;