import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";

import {
    Search,
    MapPin,
    Star,
    Wifi,
    Waves,
    Sparkles,
    Dumbbell,
    Utensils,
    Car,
    ChevronRight,
    X,
    Menu,
    Hotel,
    Calendar,
    LogOut,
    LayoutDashboard,
    SlidersHorizontal,
    Coffee,
    Shield,
    Check,
    Lock
} from "lucide-react";

const amenityIcons = {
    "Free Wi-Fi": <Wifi size={14} />,
    "Free Parking": <Car size={14} />,
    "Valet Parking": <Car size={14} />,
    "24/7 Front Desk": "🛎️",
    "Express Check-in": "⚡",
    "Express Check-out": "⚡",
    "Elevator/Lift": "🛗",
    "Airport Shuttle": "✈️",
    "Railway Station Pickup": "🚆",
    "Taxi Service": "🚕",
    "Car Rental": "🚗",
    "Swimming Pool": <Waves size={14} />,
    "Indoor Pool": <Waves size={14} />,
    "Outdoor Pool": <Waves size={14} />,
    "Kids Pool": "🧒",
    "Gym / Fitness Center": <Dumbbell size={14} />,
    "Spa & Wellness Center": <Sparkles size={14} />,
    "Steam Room": "💨",
    "Sauna": "🔥",
    "Yoga Center": "🧘",
    "Restaurant": <Utensils size={14} />,
    "Multi-Cuisine Restaurant": "🍽️",
    "Cafe": <Coffee size={14} />,
    "Bar / Lounge": "🍷",
    "Rooftop Restaurant": "🏙️",
    "Buffet Breakfast": "🍳",
    "Complimentary Breakfast": "🥐",
    "24/7 Room Service": "🛎️",
    "Laundry Service": "🧺",
    "Dry Cleaning": "👔",
    "Ironing Service": "🥼",
    "Business Center": "💻",
    "Conference Room": "📊",
    "Meeting Room": "💼",
    "Banquet Hall": "🏛️",
    "Wedding Venue": "💍",
    "Garden": "🌿",
    "Terrace": "🌅",
    "Kids Play Area": "🎠",
    "Game Room": "🎮",
    "Library": "📚",
    "BBQ Area": "🔥",
    "Pet Friendly": "🐾",
    "Wheelchair Accessible": "♿",
    "Family Friendly": "👨‍👩‍👧‍👦",
    "Non-Smoking Property": "🚭",
    "Smoking Area": "🚬",
    "Luggage Storage": "🧳",
    "Concierge Service": "🎩",
    "Travel Desk": "🧭",
    "Tour Assistance": "🗺️",
    "Currency Exchange": "💱",
    "ATM": "🏧",
    "Gift Shop": "🎁",
    "Beauty Salon": "💄",
    "Medical Assistance": "🩺",
    "Doctor On Call": "👨‍⚕️",
    "First Aid": "🩹",
    "Power Backup": "⚡",
    "CCTV Security": "📷",
    "Fire Safety": "🧯",
    "Smoke Detectors": "🚨",
    "24/7 Security": <Shield size={14} />,
    "EV Charging Station": "🔋"
};

// 🖼️ Swipeable/Scrollable Image Slider Component
const RoomImageSlider = ({ images, className = "h-60 rounded-none border-none" }) => {
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
        <div className={`relative w-full overflow-hidden bg-gray-900 shadow-inner ${className}`}>
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
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={`Slide ${idx + 1}`}
                        />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none"></div>

            {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full z-20 pointer-events-auto">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                scrollToImage(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentIndex ? "bg-white w-4" : "bg-white/50 w-1.5"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const PublicHome = () => {
    const navigate = useNavigate();

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedPropertyType, setSelectedPropertyType] = useState("");

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const hotelAmenitiesList = Object.keys(amenityIcons);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await axios.get(`${signupApi}hotel/public/all`);
                setHotels(res.data.hotels || []);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
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

    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((item) => item !== amenity)
                : [...prev, amenity]
        );
    };

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    const availablePropertyTypes = useMemo(() => {
        const typesSet = new Set();
        hotels.forEach((h) => {
            if (h.hotelType) typesSet.add(h.hotelType);
        });
        return Array.from(typesSet).sort();
    }, [hotels]);

    const availableStates = useMemo(() => {
        const statesSet = new Set();
        hotels.forEach((h) => {
            const stateName = h.city?.districtId?.stateId?.stateName || h.state;
            if (stateName) statesSet.add(stateName);
        });
        return Array.from(statesSet).sort();
    }, [hotels]);

    const availableCities = useMemo(() => {
        const citiesSet = new Set();
        hotels.forEach((h) => {
            const stateName = h.city?.districtId?.stateId?.stateName || h.state;
            const cityName = h.city?.cityName || h.city;
            if (cityName && (!selectedState || stateName === selectedState)) {
                citiesSet.add(cityName);
            }
        });
        return Array.from(citiesSet).sort();
    }, [hotels, selectedState]);

    const filteredHotels = useMemo(() => {
        return hotels.filter((hotel) => {
            const cityName = typeof hotel.city === "object" ? hotel.city?.cityName || "" : hotel.city || "";
            const stateName = hotel.city?.districtId?.stateId?.stateName || hotel.state || "";

            const query = searchQuery.toLowerCase();
            const searchMatch =
                hotel.hotelName?.toLowerCase().includes(query) ||
                cityName.toLowerCase().includes(query) ||
                stateName.toLowerCase().includes(query);

            const stateMatch = !selectedState || stateName.toLowerCase() === selectedState.toLowerCase();
            const cityMatch = !selectedCity || cityName.toLowerCase() === selectedCity.toLowerCase();
            const propertyTypeMatch = !selectedPropertyType || (hotel.hotelType && hotel.hotelType.toLowerCase() === selectedPropertyType.toLowerCase());

            const hotelAmenities = Array.isArray(hotel.amenities)
                ? hotel.amenities
                : hotel.amenities
                    ? hotel.amenities.split(",").map((i) => i.trim())
                    : [];

            const amenityMatch =
                selectedAmenities.length === 0 ||
                selectedAmenities.every((item) => hotelAmenities.includes(item));

            let dateMatch = true;
            if (checkInDate && checkOutDate && Array.isArray(hotel.bookedDates)) {
                const requestedIn = new Date(checkInDate);
                const requestedOut = new Date(checkOutDate);
                const hasConflict = hotel.bookedDates.some(b => {
                    const bIn = new Date(b.checkIn);
                    const bOut = new Date(b.checkOut);
                    return requestedIn < bOut && requestedOut > bIn;
                });
                if (hasConflict) dateMatch = false;
            }

            return searchMatch && stateMatch && cityMatch && propertyTypeMatch && amenityMatch && dateMatch;
        });
    }, [hotels, searchQuery, selectedAmenities, selectedState, selectedCity, selectedPropertyType, checkInDate, checkOutDate]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-[11px] uppercase font-semibold">Curating AuraStays...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 text-gray-800 font-['Inter',sans-serif] flex flex-col justify-between">

            <div>
                {/* 🌐 PERMANENT CLEAN WHITE STICKY NAVBAR */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-2xs py-4 border-b border-gray-200">
                    <div className="max-w-[1600px] mx-auto px-6 sm:px-8 flex items-center justify-between">

                        {/* Logo */}
                        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-2xs">
                                <Hotel size={18} />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-gray-900 font-['Space_Grotesk']">
                                AuraStays
                            </span>
                        </div>

                        {/* Desktop Navigation */}
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
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition border border-gray-200 hover:bg-gray-50 text-gray-800 bg-white cursor-pointer shadow-2xs"
                                    >
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

                {/* Mobile Dropdown Menu */}
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

                {/* 🌟 HERO SECTION WITH ADVANCED TOP-CENTER CALENDAR & LOCATION BAR */}
                <section className="relative pt-36 pb-20 px-6 sm:px-8 bg-gray-900 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/60"></div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center mb-10">
                        <span className="text-blue-400 tracking-[0.15em] text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase block mb-2">
                            World-Class Destinations
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] tracking-tight">
                            Find Your Sanctuary of Comfort
                        </h1>
                        <p className="text-gray-300 mt-2 text-xs md:text-sm font-medium max-w-lg mx-auto">
                            Filter by destination, select your travel dates, and explore verified luxury properties with AuraStays.
                        </p>
                    </div>

                    {/* 🗺️ TOP CENTER FLOATING SEARCH & CALENDAR BAR */}
                    <div className="relative z-20 max-w-4xl mx-auto bg-white rounded-2xl p-2.5 shadow-xl border border-white/20 text-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">

                            <div className="px-3.5 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                                <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase font-bold mb-1">Destination / Hotel</label>
                                <div className="flex items-center gap-2">
                                    <Search size={15} className="text-blue-600 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search city, resort..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full outline-none text-xs font-semibold bg-transparent text-gray-800 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="px-3.5 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                                <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase font-bold mb-1">Check-in Date</label>
                                <div className="flex items-center gap-2">
                                    <Calendar size={15} className="text-blue-600 shrink-0" />
                                    <input
                                        type="date"
                                        value={checkInDate}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        className="w-full outline-none text-xs font-semibold bg-transparent text-gray-800 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="px-3.5 py-2 border-b md:border-b-0 border-gray-100">
                                <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase font-bold mb-1">Check-out Date</label>
                                <div className="flex items-center gap-2">
                                    <Calendar size={15} className="text-blue-600 shrink-0" />
                                    <input
                                        type="date"
                                        value={checkOutDate}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        min={checkInDate}
                                        className="w-full outline-none text-xs font-semibold bg-transparent text-gray-800 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    onClick={() => { }}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                                >
                                    Check Availability
                                </button>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 🏛️ MAIN CONTENT CONTAINER */}
                <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-10 flex flex-col lg:flex-row gap-8">

                    {/* 🎛️ SIDEBAR FILTERS */}
                    <aside className="lg:w-80 w-full shrink-0">
                        <div className="sticky top-24 bg-white rounded-3xl shadow-2xs border border-gray-200 p-6 space-y-5">

                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h2 className="text-sm font-bold flex items-center gap-2 font-['Space_Grotesk'] text-gray-900">
                                    <SlidersHorizontal size={15} className="text-blue-600" />
                                    Filters & Amenities
                                </h2>

                                {(selectedAmenities.length > 0 || selectedState || selectedCity || selectedPropertyType || checkInDate) && (
                                    <button
                                        onClick={() => {
                                            setSelectedAmenities([]);
                                            setSelectedState("");
                                            setSelectedCity("");
                                            setSelectedPropertyType("");
                                            setCheckInDate("");
                                            setCheckOutDate("");
                                        }}
                                        className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                    >
                                        <X size={12} /> Reset All
                                    </button>
                                )}
                            </div>

                            {/* State, City & Property Type Dropdowns */}
                            <div className="space-y-3.5 pb-4 border-b border-gray-100 text-xs">

                                <div>
                                    <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Property Type
                                    </label>
                                    <select
                                        value={selectedPropertyType}
                                        onChange={(e) => setSelectedPropertyType(e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 text-gray-800 capitalize cursor-pointer shadow-2xs"
                                    >
                                        <option value="">All Property Types</option>
                                        {availablePropertyTypes.map((pt) => (
                                            <option key={pt} value={pt} className="capitalize">{pt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Filter by State
                                    </label>
                                    <select
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setSelectedCity("");
                                        }}
                                        className="w-full bg-gray-50/50 border border-gray-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 text-gray-800 capitalize cursor-pointer shadow-2xs"
                                    >
                                        <option value="">All States</option>
                                        {availableStates.map((st) => (
                                            <option key={st} value={st} className="capitalize">{st}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Filter by City
                                    </label>
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 text-gray-800 capitalize cursor-pointer shadow-2xs"
                                    >
                                        <option value="">All Cities</option>
                                        {availableCities.map((ct) => (
                                            <option key={ct} value={ct} className="capitalize">{ct}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Full 60+ Amenities Checklist */}
                            <div>
                                <div className="flex justify-between items-center mb-2.5">
                                    <h4 className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Amenities ({hotelAmenitiesList.length})
                                    </h4>
                                    {selectedAmenities.length > 0 && (
                                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md">
                                            {selectedAmenities.length} selected
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                                    {hotelAmenitiesList.map((item) => {
                                        const isChecked = selectedAmenities.includes(item);
                                        return (
                                            <label
                                                key={item}
                                                className={`flex items-center justify-between rounded-xl cursor-pointer px-3 py-2 transition-all duration-150 border text-xs font-medium ${isChecked
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-bold"
                                                        : "border-gray-100 hover:bg-gray-50 text-gray-700 bg-white"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <span className="w-4 flex justify-center text-xs shrink-0">{amenityIcons[item] || "✓"}</span>
                                                    <span className="truncate">{item}</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleAmenity(item)}
                                                    className="hidden"
                                                />
                                                {isChecked && <div className="w-2 h-2 rounded-full bg-white shrink-0"></div>}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* 🏨 HOTEL LISTINGS GRID */}
                    <section className="flex-1">
                        <div className="flex justify-between items-end mb-5 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-2xs">
                            <div>
                                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-0.5">
                                    Verified Properties
                                </span>
                                <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900">
                                    Available Stays {checkInDate && <span className="text-xs font-normal text-gray-400">(For selected dates)</span>}
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold font-['IBM_Plex_Mono',monospace] text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                                {filteredHotels.length} {filteredHotels.length === 1 ? "Property" : "Properties"} Found
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {filteredHotels.length > 0 ? (
                                filteredHotels.map((hotel) => {
                                    const hotelAmenities = Array.isArray(hotel.amenities)
                                        ? hotel.amenities
                                        : hotel.amenities
                                            ? hotel.amenities.split(",").map((item) => item.trim())
                                            : [];

                                    return (
                                        <div
                                            key={hotel._id}
                                            onClick={() => navigate(`/hotel-details/${hotel._id}`)}
                                            className="group cursor-pointer overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                                        >
                                            {/* HOTEL IMAGE SWIPER */}
                                            <div className="relative h-56 overflow-hidden bg-gray-100">
                                                <RoomImageSlider
                                                    images={
                                                        hotel.hotelImages?.length > 0
                                                            ? hotel.hotelImages
                                                            : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"]
                                                    }
                                                    className="w-full h-full rounded-none border-none"
                                                />

                                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-2xs z-10 pointer-events-none">
                                                    <Star size={12} fill="#FACC15" className="text-yellow-400" />
                                                    <span className="text-[11px] font-bold text-gray-900">4.9</span>
                                                </div>

                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-300 text-[9px] font-bold px-2.5 py-1 rounded-xl tracking-wider uppercase border border-white/10 z-10 pointer-events-none font-['IBM_Plex_Mono']">
                                                    Verified
                                                </div>

                                                <div className="absolute bottom-4 left-4 right-4 text-white z-10 pointer-events-none">
                                                    <h3 className="text-lg font-bold font-['Space_Grotesk'] leading-tight">
                                                        {hotel.hotelName}
                                                    </h3>
                                                    <p className="flex items-center gap-1 text-[11px] mt-1 text-gray-200 font-medium capitalize truncate">
                                                        <MapPin size={12} className="text-blue-400 shrink-0" />
                                                        {hotel.city?.cityName || hotel.city}, {hotel.city?.districtId?.stateId?.stateName || hotel.state}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-5 flex flex-col justify-between flex-1">
                                                <div className="flex flex-wrap gap-1.5 min-h-[32px] mb-4">
                                                    {hotelAmenities.length > 0 ? (
                                                        hotelAmenities.slice(0, 4).map((item) => (
                                                            <div
                                                                key={item}
                                                                className="flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-medium shadow-2xs"
                                                            >
                                                                {amenityIcons[item] || <Check size={11} className="text-blue-600" />}
                                                                <span>{item}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400 italic">No amenities specified</span>
                                                    )}
                                                    {hotelAmenities.length > 4 && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-bold flex items-center">
                                                            +{hotelAmenities.length - 4} more
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase tracking-wider block">
                                                            Starting from
                                                        </span>
                                                        <span className="font-bold text-gray-900 text-base font-['Space_Grotesk']">
                                                            ₹{hotel.pricePerNight || "2,500"} <span className="text-xs text-gray-400 font-sans font-normal">/ night</span>
                                                        </span>
                                                    </div>

                                                    <button className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-2xs cursor-pointer">
                                                        View Details <ChevronRight size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 text-center px-6 shadow-2xs">
                                    <Search size={40} className="text-gray-300 mb-3 stroke-1" />
                                    <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900">
                                        No Properties Found
                                    </h2>
                                    <p className="text-gray-500 mt-1 text-xs max-w-sm font-medium">
                                        We couldn't find any properties matching your current filter selections or selected dates. Try resetting your criteria.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedAmenities([]);
                                            setSelectedState("");
                                            setSelectedCity("");
                                            setSelectedPropertyType("");
                                            setCheckInDate("");
                                            setCheckOutDate("");
                                        }}
                                        className="mt-5 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-2xs"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

        </div>
    );
};

export default PublicHome;