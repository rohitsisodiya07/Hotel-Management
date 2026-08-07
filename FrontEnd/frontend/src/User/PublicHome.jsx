import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import { toast, Toaster } from "sonner";

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
    Loader2
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

// 🖼️ Swipeable Image Slider Component
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
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070";
                            }}
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
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedPropertyType, setSelectedPropertyType] = useState("");
    const [sortBy, setSortBy] = useState("recommended");

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");

    // Continuous Flow (Load More) States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalHotels, setTotalHotels] = useState(0);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const hotelAmenitiesList = Object.keys(amenityIcons);

    // Initial metadata fetch for populating state/city dropdown options
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

    // 🌟 Fetch Data on Filter/Search/Sort Change (Reset to page 1)
    useEffect(() => {
        setPage(1);
        fetchFilteredHotels(1, true);
    }, [searchQuery, selectedState, selectedCity, selectedPropertyType, selectedAmenities, checkInDate, checkOutDate, sortBy]);

    const fetchFilteredHotels = async (pageNum = 1, isNewFilter = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const params = new URLSearchParams({
                search: searchQuery,
                state: selectedState,
                city: selectedCity,
                propertyType: selectedPropertyType,
                amenities: selectedAmenities.join(","),
                checkIn: checkInDate,
                checkOut: checkOutDate,
                sortBy,
                page: pageNum,
                limit: 6 // 6 items per batch
            });

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
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchFilteredHotels(nextPage, false);
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
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
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
        <div className="min-h-screen bg-gray-50/50 text-gray-800 font-['Inter',sans-serif] flex flex-col justify-between">
            <Toaster position="top-right" richColors />

            <div>
                {/* Navbar */}
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
                                            {(user?.role === "admin" || user?.role === "hotel" || user?.role === "superAdmin") && (
                                                <button onClick={() => { setProfileDropdownOpen(false); navigate(user?.role === "superAdmin" ? "/superAdmin/dashboard" : "/hotel/hotelDashboard"); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50/60 hover:text-blue-600 flex items-center gap-2.5 font-semibold transition cursor-pointer">
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

                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-800 bg-white">
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
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
                            Filter by destination, select your travel dates, and explore verified luxury properties.
                        </p>
                    </div>

                    <div className="relative z-20 max-w-4xl mx-auto bg-white rounded-2xl p-2.5 shadow-xl border border-white/20 text-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                            <div className="px-3.5 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                                <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase font-bold mb-1">Destination</label>
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
                                        min={checkInDate}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        className="w-full outline-none text-xs font-semibold bg-transparent text-gray-800 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <button onClick={() => toast.success("Availability updated!")} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer">
                                    Check Availability
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-10 flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-80 w-full shrink-0">
                        <div className="sticky top-24 bg-white rounded-3xl shadow-2xs border border-gray-200 p-6 space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h2 className="text-sm font-bold flex items-center gap-2 font-['Space_Grotesk'] text-gray-900">
                                    <SlidersHorizontal size={15} className="text-blue-600" /> Filters & Amenities
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
                                            setSortBy("recommended");
                                        }}
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
                                                className={`flex items-center justify-between rounded-xl cursor-pointer px-3 py-2 text-xs font-medium border transition ${
                                                    isChecked ? "bg-blue-600 text-white border-blue-600 font-bold" : "border-gray-100 hover:bg-gray-50 text-gray-700 bg-white"
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
                                    {totalHotels} Total
                                </span>
                            </div>
                        </div>

                        <div className="relative min-h-[350px]">
                            {loading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex justify-center items-center z-20 rounded-2xl">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            )}

                            {hotels.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 text-center px-6">
                                    <Search size={40} className="text-gray-300 mb-3" />
                                    <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">No Properties Found</h3>
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm">No properties match your current search or date availability.</p>
                                    <button onClick={() => { setSelectedState(""); setSelectedCity(""); setSearchQuery(""); }} className="mt-4 bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl uppercase cursor-pointer">
                                        Reset Search
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {hotels.map((hotel) => {
                                        const hotelAmenities = Array.isArray(hotel.amenities)
                                            ? hotel.amenities
                                            : hotel.amenities ? hotel.amenities.split(",").map(i => i.trim()) : [];

                                        return (
                                            <div
                                                key={hotel._id}
                                                onClick={() => navigate(`/hotel-details/${hotel._id}`)}
                                                className="group cursor-pointer overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                                            >
                                                <div className="relative h-56 overflow-hidden bg-gray-100">
                                                    <RoomImageSlider images={hotel.hotelImages?.length > 0 ? hotel.hotelImages : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"]} />
                                                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-2xs z-10">
                                                        <Star size={12} fill="#FACC15" className="text-yellow-400" />
                                                        <span className="text-[11px] font-bold text-gray-900">4.9</span>
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
                                                                ₹{hotel.pricePerNight || "2,500"} <span className="text-xs text-gray-400 font-sans font-normal">/ night</span>
                                                            </span>
                                                        </div>
                                                        <button className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer">
                                                            View Details <ChevronRight size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* 🌟 CONTINUOUS "LOAD MORE" BUTTON */}
                            {hasMore && hotels.length > 0 && (
                                <div className="text-center mt-10">
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
            </div>
        </div>
    );
};

export default PublicHome;