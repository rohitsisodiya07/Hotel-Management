import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import { toast, Toaster } from "sonner";
import PopularCity from "./PopularCity";
import Promotions from "./Promotions";
import Testimonials from "./Testimonials";
import Footer from "./Footer";

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
    Lock,
    ArrowUpDown,
    Loader2,
    Eye
} from "lucide-react";

const amenityIcons = {
    "Free Wi-Fi": <Wifi size={14} />,
    "Free Parking": <Car size={14} />,
    "Valet Parking": <Car size={14} />,
    "Swimming Pool": <Waves size={14} />,
    "Gym / Fitness Center": <Dumbbell size={14} />,
    "Spa & Wellness Center": <Sparkles size={14} />,
    "Restaurant": <Utensils size={14} />,
    "Cafe": <Coffee size={14} />,
    "24/7 Security": <Shield size={14} />
};

// 🛡️ Safe JSON Parser for User Profile
const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
};

// 🖼️ Swipeable Image Slider Component (For Cards)
const RoomImageSlider = ({ images, className = "h-72 rounded-none border-none" }) => {
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
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070";
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none"></div>

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
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentIndex ? "bg-white w-4" : "bg-white/50 w-1.5"}`}
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [allHotelsForDropdowns, setAllHotelsForDropdowns] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedPropertyType, setSelectedPropertyType] = useState("");
    const [sortBy, setSortBy] = useState("recommended");

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");

    // 🕒 Search Debounce (400ms delay to prevent excessive API calls)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const heroBackgrounds = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070"
    ];
    const [heroBgIndex, setHeroBgIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setHeroBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroBackgrounds.length]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalHotels, setTotalHotels] = useState(0);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const hotelAmenitiesList = Object.keys(amenityIcons);

    useEffect(() => {
        const fetchInitialMeta = async () => {
            try {
                const res = await axios.get(`${signupApi}hotel/public/all?limit=100`);
                setAllHotelsForDropdowns(res.data.hotels || []);
            } catch (err) {
                console.log(err);
            }
        };
        fetchInitialMeta();
    }, []);

    const fetchFilteredHotels = useCallback(async (pageNum = 1, isNewFilter = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const params = new URLSearchParams();
            if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
            if (selectedState) params.append("state", selectedState);
            if (selectedCity) params.append("city", selectedCity);
            if (selectedPropertyType) params.append("propertyType", selectedPropertyType);
            if (selectedAmenities.length > 0) params.append("amenities", selectedAmenities.join(","));
            if (checkInDate) params.append("checkIn", checkInDate);
            if (checkOutDate) params.append("checkOut", checkOutDate);
            params.append("sortBy", sortBy);
            params.append("page", pageNum);
            params.append("limit", 6);

            const res = await axios.get(`${signupApi}hotel/public/all?${params.toString()}`);
            if (res.data.success) {
                const fetchedHotels = res.data.hotels || [];

                if (isNewFilter || pageNum === 1) {
                    setHotels(fetchedHotels);
                } else {
                    setHotels(prev => [...prev, ...fetchedHotels]);
                }

                setTotalHotels(res.data.totalHotels || 0);
                setHasMore(pageNum < (res.data.totalPages || 1));
            }
        } catch (err) {
            console.error("Fetch Hotels Error:", err);
            toast.error("Failed to load properties.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [debouncedSearch, selectedState, selectedCity, selectedPropertyType, selectedAmenities, checkInDate, checkOutDate, sortBy]);

    useEffect(() => {
        setPage(1);
        fetchFilteredHotels(1, true);
    }, [debouncedSearch, selectedState, selectedCity, selectedPropertyType, selectedAmenities, checkInDate, checkOutDate, sortBy, fetchFilteredHotels]);

    const handleLoadMore = () => {
        if (loadingMore || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchFilteredHotels(nextPage, false);
    };

    // 🔄 Common Reset Filters Function
    const resetFilters = () => {
        setSearchQuery("");
        setSelectedAmenities([]);
        setSelectedState("");
        setSelectedCity("");
        setSelectedPropertyType("");
        setCheckInDate("");
        setCheckOutDate("");
        setSortBy("recommended");
    };

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
    const user = getStoredUser();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // 🛡️ Correct Role-Based Management Console Routes Mapping
    const managementRoutes = {
        admin: "/admin/dashboard",
        hotel: "/hotel/hotelDashboard",
        superAdmin: "/superAdmin/dashboard",
    };

    const handleManagementRedirect = () => {
        setProfileDropdownOpen(false);
        const route = managementRoutes[user?.role] || "/hotel/hotelDashboard";
        navigate(route);
    };

    const availablePropertyTypes = useMemo(() => {
        const typesSet = new Set();
        allHotelsForDropdowns.forEach((h) => {
            if (h.hotelType) typesSet.add(h.hotelType);
        });
        return Array.from(typesSet).sort();
    }, [allHotelsForDropdowns]);

    const availableStates = useMemo(() => {
        const statesSet = new Set();
        allHotelsForDropdowns.forEach((h) => {
            const stateName = h.city?.districtId?.stateId?.stateName || h.state;
            if (stateName) statesSet.add(stateName);
        });
        return Array.from(statesSet).sort();
    }, [allHotelsForDropdowns]);

    const availableCities = useMemo(() => {
        const citiesSet = new Set();
        allHotelsForDropdowns.forEach((h) => {
            const stateName = h.city?.districtId?.stateId?.stateName || h.state;
            const cityName = h.city?.cityName || h.city;
            if (cityName && (!selectedState || stateName === selectedState)) {
                citiesSet.add(cityName);
            }
        });
        return Array.from(citiesSet).sort();
    }, [allHotelsForDropdowns, selectedState]);

    return (
        <div className="min-h-screen bg-white text-gray-800 font-['Inter',sans-serif] flex flex-col justify-between scroll-smooth">
            <Toaster position="top-right" richColors />

            <div>
                {/* 🌟 Full Screen Hero Section with Merged Transparent Navbar */}
                <section className="relative w-full min-h-screen flex flex-col justify-between text-white overflow-hidden bg-gray-950">
                    {heroBackgrounds.map((bgImg, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === heroBgIndex ? "opacity-65" : "opacity-0"}`}
                        >
                            <img src={bgImg} alt="Hotel Background Slide" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60"></div>

                    {/* Merged Navbar inside Full Screen Hero */}
                    <nav className="relative z-50 w-full max-w-[1600px] mx-auto flex items-center justify-between py-6 px-6 sm:px-12">
                        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600 text-white shadow-md font-bold">
                                <Hotel size={19} />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-white font-['Space_Grotesk'] drop-shadow-sm">
                                AuraStays
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-white/90 font-semibold text-xs uppercase tracking-wider">
                            <span onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer hover:text-blue-400 transition">Home</span>
                            <a href="#hotels-section" className="cursor-pointer hover:text-blue-400 transition">Hotels</a>
                            <span onClick={() => navigate("/myBookings")} className="cursor-pointer hover:text-blue-400 transition">My Bookings</span>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {!token ? (
                                <div className="flex items-center gap-3">
                                    <button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer">
                                        Login
                                    </button>
                                    <button onClick={() => navigate("/adminSignup")} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer">
                                        Become a Partner
                                    </button>
                                </div>
                            ) : (
                                <div className="relative pl-2" ref={dropdownRef}>
                                    <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full transition bg-white/10 hover:bg-white/20 backdrop-blur-md text-white cursor-pointer border border-white/20 shadow-md">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <span className="font-bold text-xs">{user?.name}</span>
                                    </button>

                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 text-gray-800">
                                            <div className="px-4 py-2.5 border-b border-gray-100">
                                                <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono',monospace] uppercase font-bold">Signed in as</p>
                                                <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{user?.email}</p>
                                            </div>
                                            <button onClick={() => { setProfileDropdownOpen(false); navigate("/myBookings"); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50/60 hover:text-blue-600 flex items-center gap-2.5 font-semibold transition cursor-pointer">
                                                <Calendar size={14} className="text-blue-600" /> My Bookings
                                            </button>
                                            {(user?.role === "admin" || user?.role === "hotel" || user?.role === "superAdmin") && (
                                                <button onClick={handleManagementRedirect} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50/60 hover:text-blue-600 flex items-center gap-2.5 font-semibold transition cursor-pointer">
                                                    <LayoutDashboard size={14} className="text-blue-600" /> Management Console
                                                </button>
                                            )}
                                            <button onClick={() => { setProfileDropdownOpen(false); navigate("/reset"); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50/60 hover:text-blue-600 flex items-center gap-2.5 font-semibold transition cursor-pointer">
                                                <Lock size={14} className="text-blue-600" /> Reset Password
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button onClick={() => { setProfileDropdownOpen(false); handleLogout(); }} className="w-full text-left bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 mt-1 cursor-pointer">
                                                <LogOut size={14} /> Secure Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Button */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 rounded-xl text-white bg-white/10 backdrop-blur-md">
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </nav>

                    {/* 📱 Mobile Dropdown Menu inside Hero */}
                    {mobileMenuOpen && (
                        <div className="md:hidden absolute top-24 left-6 right-6 bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl px-6 py-5 space-y-3 text-xs font-bold text-white z-50">
                            <span onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block py-2 cursor-pointer hover:text-blue-400">Home</span>
                            <a href="#hotels-section" onClick={() => setMobileMenuOpen(false)} className="block py-2 cursor-pointer hover:text-blue-400">Hotels</a>
                            <span onClick={() => { setMobileMenuOpen(false); navigate("/myBookings"); }} className="block py-2 cursor-pointer hover:text-blue-400">My Bookings</span>

                            <div className="border-t border-white/10 pt-3 space-y-2">
                                {!token ? (
                                    <>
                                        <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="w-full bg-blue-600 text-white py-2.5 rounded-xl uppercase tracking-wider">
                                            Login / Partner Sign In
                                        </button>
                                        <button onClick={() => { setMobileMenuOpen(false); navigate("/adminSignup"); }} className="w-full bg-white/10 text-white py-2.5 rounded-xl uppercase tracking-wider border border-white/20">
                                            Become a Partner
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="w-full bg-rose-500/20 text-rose-300 py-2.5 rounded-xl uppercase tracking-wider">
                                        Logout
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hero Main Content & Search Box Centered/Aligned */}
                    <div className="relative z-10 max-w-[1600px] mx-auto w-full px-6 sm:px-12 my-auto">
                        <span className="bg-blue-500/30 border border-blue-400/30 text-blue-200 tracking-wide text-xs px-3.5 py-1.5 rounded-full font-medium inline-block mb-4 backdrop-blur-xs">
                            The Ultimate Hotel Experience
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-['Space_Grotesk'] tracking-tight max-w-2xl leading-[1.1] mb-4">
                            Stay Somewhere Extraordinary
                        </h1>
                        <p className="text-gray-300 text-xs sm:text-sm font-normal max-w-lg mb-10 leading-relaxed">
                            Unparalleled luxury and comfort await at the world's most exclusive hotels and resorts. Start your journey today.
                        </p>

                        {/* Floating Search Bar Widget */}
                        <div className="bg-white rounded-2xl p-4 shadow-2xl text-gray-800 max-w-4xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
                                <div className="px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1">
                                        <MapPin size={13} className="text-gray-400" /> Where are you going?
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search Jaipur, Udaipur or hotel"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full outline-none text-xs font-medium text-gray-800 placeholder:text-gray-300 bg-transparent"
                                    />
                                </div>

                                <div className="px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1">
                                        <Calendar size={13} className="text-gray-400" /> Check in
                                    </label>
                                    <input
                                        type="date"
                                        value={checkInDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        className="w-full outline-none text-xs font-medium text-gray-800 bg-transparent cursor-pointer"
                                    />
                                </div>

                                <div className="px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1">
                                        <Calendar size={13} className="text-gray-400" /> Check out
                                    </label>
                                    <input
                                        type="date"
                                        value={checkOutDate}
                                        min={checkInDate || new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        className="w-full outline-none text-xs font-medium text-gray-800 bg-transparent cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <button
                                        onClick={() => {
                                            const element = document.getElementById("hotels-section");
                                            if (element) element.scrollIntoView({ behavior: "smooth" });
                                        }}
                                        className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                    >
                                        <Search size={15} /> Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Spacer bottom */}
                    <div className="pb-8"></div>
                </section>
            </div>

            {/* Main Content Listings on Clean White Background */}
            <div id="hotels-section" className="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 flex flex-col lg:flex-row gap-8 scroll-mt-24 bg-white w-full">
                {/* Sidebar */}
                <aside className="lg:w-80 w-full shrink-0">
                    <div className="sticky top-24 bg-white rounded-3xl shadow-2xs border border-gray-200 p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h2 className="text-sm font-bold flex items-center gap-2 font-['Space_Grotesk'] text-gray-900">
                                <SlidersHorizontal size={15} className="text-blue-600" /> Filters & Amenities
                            </h2>
                            {(selectedAmenities.length > 0 || selectedState || selectedCity || selectedPropertyType || checkInDate || searchQuery) && (
                                <button
                                    onClick={resetFilters}
                                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                    <X size={12} /> Reset All
                                </button>
                            )}
                        </div>

                        <div className="space-y-3.5 pb-4 border-b border-gray-100 text-xs">
                            <div>
                                <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Property Type</label>
                                <select
                                    value={selectedPropertyType}
                                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                                >
                                    <option value="">All Property Types</option>
                                    {availablePropertyTypes.map((pt) => (
                                        <option key={pt} value={pt} className="capitalize">{pt}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Filter by State</label>
                                <select
                                    value={selectedState}
                                    onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(""); }}
                                    className="w-full bg-gray-50/50 border border-gray-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                                >
                                    <option value="">All States</option>
                                    {availableStates.map((st) => (
                                        <option key={st} value={st} className="capitalize">{st}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Filter by City</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                                >
                                    <option value="">All Cities</option>
                                    {availableCities.map((ct) => (
                                        <option key={ct} value={ct} className="capitalize">{ct}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h4 className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Amenities</h4>
                            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                                {hotelAmenitiesList.map((item) => {
                                    const isChecked = selectedAmenities.includes(item);
                                    return (
                                        <label
                                            key={item}
                                            onClick={() => toggleAmenity(item)}
                                            className={`flex items-center justify-between rounded-xl cursor-pointer px-3 py-2 text-xs font-medium border transition ${isChecked ? "bg-blue-600 text-white border-blue-600 font-bold" : "border-gray-100 hover:bg-gray-50 text-gray-700 bg-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <span>{amenityIcons[item] || "✓"}</span>
                                                <span className="truncate">{item}</span>
                                            </div>
                                            {isChecked && <div className="w-2 h-2 rounded-full bg-white shrink-0"></div>}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Listings */}
                <section className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white px-6 py-4 rounded-2xl border border-gray-200 gap-4">
                        <div>
                            <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-0.5">Verified Properties</span>
                            <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900">Available Stays</h2>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 h-10 rounded-xl text-xs font-semibold text-gray-700">
                                <ArrowUpDown size={13} className="text-blue-600 shrink-0" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent outline-none cursor-pointer font-bold text-gray-800"
                                >
                                    <option value="recommended">Sort: Recommended</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name-asc">Name: A to Z</option>
                                    <option value="name-desc">Name: Z to A</option>
                                </select>
                            </div>

                            <span className="text-[10px] font-bold font-['IBM_Plex_Mono',monospace] text-gray-600 bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-200 shrink-0">
                                {totalHotels} Properties Found
                            </span>
                        </div>
                    </div>

                    <div className="relative min-h-[350px]">
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 absolute inset-0 bg-white/95 z-20">
                                {[1, 2, 4].map((n) => (
                                    <div key={n} className="border border-gray-200 rounded-3xl p-4 animate-pulse space-y-4">
                                        <div className="h-64 bg-gray-200 rounded-2xl"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {hotels.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 text-center px-6">
                                <Search size={40} className="text-gray-300 mb-3" />
                                <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">No Properties Found</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm">No properties match your current search or date availability.</p>
                                <button onClick={resetFilters} className="mt-4 bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl uppercase cursor-pointer">
                                    Reset Search
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {hotels.map((hotel) => {
                                    const hotelAmenities = Array.isArray(hotel.amenities)
                                        ? hotel.amenities
                                        : hotel.amenities ? hotel.amenities.split(",").map(i => i.trim()) : [];

                                    return (
                                        <div
                                            key={hotel._id}
                                            className="group overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                                        >
                                            <div className="relative h-72 overflow-hidden bg-gray-100">
                                                <RoomImageSlider images={hotel.hotelImages?.length > 0 ? hotel.hotelImages : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"]} className="h-full" />
                                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-2xs z-10">
                                                    {hotel.rating ? (
                                                        <>
                                                            <Star size={12} fill="#FACC15" className="text-yellow-400" />
                                                            <span className="text-[11px] font-bold text-gray-900">{Number(hotel.rating).toFixed(1)}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-800 px-1 font-['Space_Grotesk']">New</span>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-4 left-4 right-4 text-white z-10 pointer-events-none">
                                                    <h3 className="text-lg font-bold font-['Space_Grotesk'] leading-tight">{hotel.hotelName}</h3>
                                                    <p className="flex items-center gap-1 text-[11px] mt-1 text-gray-200 font-medium capitalize truncate">
                                                        <MapPin size={12} className="text-blue-400 shrink-0" />
                                                        {hotel.city?.cityName || hotel.city}, {hotel.city?.districtId?.stateId?.stateName || hotel.state}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-5 flex flex-col justify-between flex-1">
                                                <div className="flex flex-wrap gap-1.5 min-h-[32px] mb-4">
                                                    {hotelAmenities.slice(0, 4).map((item) => (
                                                        <div key={item} className="flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                            {amenityIcons[item] || <Check size={11} className="text-blue-600" />}
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-[10px] font-['IBM_Plex_Mono'] text-gray-400 uppercase tracking-wider block">Starting from</span>
                                                        <span className="font-bold text-gray-900 text-base font-['Space_Grotesk']">
                                                            {hotel.pricePerNight ? `₹${hotel.pricePerNight}` : "Price unavailable"} <span className="text-xs text-gray-400 font-sans font-normal">/ night</span>
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/hotel-details/${hotel._id}`)}
                                                        className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                                    >
                                                        <Eye size={13} /> View Details <ChevronRight size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 🌟 PAGINATION STATUS & LOAD MORE BUTTON */}
                        {hasMore && hotels.length > 0 && (
                            <div className="text-center mt-10 space-y-2">
                                <p className="text-xs text-gray-500 font-medium font-['IBM_Plex_Mono']">
                                    Showing {hotels.length} of {totalHotels} properties
                                </p>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 font-bold px-8 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-2xs cursor-pointer inline-flex items-center gap-2"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="animate-spin text-blue-600" size={16} /> Loading More...
                                        </>
                                    ) : (
                                        "Load More Properties"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Additional Home Sections */}
            <Promotions />
            <Testimonials />
            <PopularCity onSelectCity={(cityName) => setSearchQuery(cityName)} />
        </div>
    );
};

export default PublicHome;