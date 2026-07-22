import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";

import {
    Search,
    MapPin,
    Star,
    Filter,
    Wifi,
    Waves,
    Sparkles,
    Dumbbell,
    Utensils,
    Car,
    ChevronRight,
    ShieldCheck,
    BadgeCheck,
    X,
    Menu,
    Hotel,
} from "lucide-react";

const amenityIcons = {
    "Free WiFi": <Wifi size={14} />,
    "Parking": <Car size={14} />,
    "Elevator/Lift": "🛗",
    "Airport Shuttle": "✈️",
    "Swimming Pool": <Waves size={14} />,
    "Gym": <Dumbbell size={14} />,
    "Spa": <Sparkles size={14} />,
    "Pet Friendly": "🐶",
    "Restaurant": <Utensils size={14} />,
    "Bar / Lounge": "🍷",
    "Breakfast": "🍳",
    "Room Service": "🛎️",
    "Laundry": "🧺",
    "Air Conditioning": "❄️",
    "Banquet Hall": "🏛️",
    "CCTV Security": "📹",
    "Power Backup": "⚡",
};

const PublicHome = () => {
    const navigate = useNavigate();

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    // Navbar
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((item) => item !== amenity)
                : [...prev, amenity]
        );
    };

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        window.location.reload();
    };

    const filteredHotels = useMemo(() => {
        return hotels.filter((hotel) => {
            const city =
                typeof hotel.city === "object"
                    ? hotel.city?.cityName || ""
                    : hotel.city || "";

            const query = searchQuery.toLowerCase();

            const searchMatch =
                hotel.hotelName?.toLowerCase().includes(query) ||
                city.toLowerCase().includes(query);

            const hotelAmenities = Array.isArray(hotel.amenities)
                ? hotel.amenities
                : hotel.amenities
                    ? hotel.amenities.split(",").map((i) => i.trim())
                    : [];

            const amenityMatch =
                selectedAmenities.length === 0 ||
                selectedAmenities.every((item) =>
                    hotelAmenities.includes(item)
                );

            return searchMatch && amenityMatch;
        });
    }, [hotels, searchQuery, selectedAmenities]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#faf9f6]">
                <div className="w-12 h-12 border-4 border-[#A2782E] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 tracking-wide text-sm uppercase">Loading Hotels...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf9f6]">

            {/* NAVBAR */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-white shadow-md py-3"
                    : "bg-transparent py-5"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">

                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${scrolled ? "bg-[#A2782E]" : "bg-white/15 backdrop-blur"}`}>
                            <Hotel size={18} className={scrolled ? "text-white" : "text-white"} />
                        </div>
                        <span className={`font-serif text-xl font-bold tracking-wide ${scrolled ? "text-gray-900" : "text-white"}`}>
                            StayFinder
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-3">

                        {!token ? (
                            <>
                                <button
                                    onClick={() => navigate("/login")}
                                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${scrolled
                                        ? "text-gray-700 hover:bg-gray-100"
                                        : "text-white hover:bg-white/10"
                                        }`}
                                >
                                    Login
                                </button>

                                <button
                                    onClick={() => navigate("/signup")}
                                    className="bg-[#A2782E] hover:bg-[#8d6928] transition text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md"
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>
                                <span
                                    className={`font-semibold ${scrolled ? "text-gray-800" : "text-white"
                                        }`}
                                >
                                    Hi, {user?.name}
                                </span>

                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
                                >
                                    Logout
                                </button>
                            </>
                        )}

                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg ${scrolled ? "text-gray-900" : "text-white"}`}
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white shadow-lg mt-3 mx-5 rounded-2xl p-4 flex flex-col gap-2">

                        {!token ? (
                            <>
                                <button
                                    onClick={() => {
                                        navigate("/login");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-xl font-semibold hover:bg-gray-100"
                                >
                                    Login
                                </button>

                                <button
                                    onClick={() => {
                                        navigate("/signup");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-[#A2782E] text-white px-4 py-3 rounded-xl font-semibold"
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="px-4 py-2 font-semibold">
                                    Hi, {user?.name}
                                </p>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-semibold"
                                >
                                    Logout
                                </button>
                            </>
                        )}

                    </div>
                )}
            </nav>

            {/* HERO */}

            <section className="relative h-[560px]">

                <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>

                <div className="relative z-10 h-full flex flex-col justify-center items-center px-5">

                    <span className="text-[#E7C77A] tracking-[0.3em] text-xs md:text-sm font-semibold uppercase mb-4">
                        Luxury Stays, Handpicked For You
                    </span>

                    <h1 className="text-white text-4xl md:text-6xl font-bold text-center leading-tight font-serif">
                        Find Your Perfect Stay
                    </h1>

                    <p className="text-gray-200 mt-5 text-base md:text-lg text-center max-w-xl">
                        Discover premium hotels, resorts and villas at the best prices — verified stays, trusted service.
                    </p>

                    <div className="bg-white rounded-2xl mt-10 flex items-center overflow-hidden shadow-2xl w-full max-w-3xl border border-white/20">

                        <div className="pl-6 pr-3">
                            <Search className="text-gray-400" size={20} />
                        </div>

                        <input
                            type="text"
                            placeholder="Search by hotel name or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 py-4 md:py-5 outline-none text-base md:text-lg text-gray-800 placeholder:text-gray-400"
                        />

                        <button className="bg-[#A2782E] hover:bg-[#8d6928] transition text-white px-6 md:px-10 py-4 md:py-5 font-semibold tracking-wide">
                            Search
                        </button>

                    </div>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10">
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                            <ShieldCheck size={18} className="text-[#E7C77A]" />
                            Verified Hotels
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                            <BadgeCheck size={18} className="text-[#E7C77A]" />
                            Best Price Guarantee
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                            <Star size={18} className="text-[#E7C77A]" />
                            Top Rated Stays
                        </div>
                    </div>

                </div>

            </section>

            {/* BODY */}

            <div className="max-w-7xl mx-auto px-5 py-16 flex flex-col lg:flex-row gap-10">

                {/* FILTER */}

                <aside className="lg:w-72 w-full">

                    <div className="sticky top-6 bg-white rounded-3xl shadow-md border border-gray-100 p-7">

                        <div className="flex items-center justify-between mb-7">
                            <h2 className="text-xl font-bold flex items-center gap-2 font-serif">
                                <Filter size={20} className="text-[#A2782E]" />
                                Filters
                            </h2>

                            {selectedAmenities.length > 0 && (
                                <button
                                    onClick={() => setSelectedAmenities([])}
                                    className="text-xs text-[#A2782E] font-semibold flex items-center gap-1 hover:underline"
                                >
                                    <X size={14} />
                                    Clear
                                </button>
                            )}
                        </div>

                        <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-5">
                            Amenities
                        </h4>

                        <div className="space-y-2">

                            {hotelAmenitiesList.map((item) => (
                                <label
                                    key={item}
                                    className={`flex items-center gap-3 rounded-xl cursor-pointer p-3 transition-all duration-200 border
                  ${selectedAmenities.includes(item)
                                            ? "bg-[#A2782E] text-white border-[#A2782E] shadow-sm"
                                            : "border-transparent hover:bg-amber-50 text-gray-600"
                                        }
                  `}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedAmenities.includes(item)}
                                        onChange={() => toggleAmenity(item)}
                                        className="hidden"
                                    />

                                    <span className="w-4 flex justify-center">{amenityIcons[item]}</span>

                                    <span className="text-sm font-medium">
                                        {item}
                                    </span>
                                </label>
                            ))}

                        </div>

                    </div>

                </aside>

                {/* HOTEL LIST */}

                <section className="flex-1">

                    <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-6">

                        <div>
                            <h2 className="text-3xl font-bold font-serif text-gray-900">
                                Recommended Hotels
                            </h2>
                            <p className="text-gray-500 mt-2 text-sm">
                                {filteredHotels.length} {filteredHotels.length === 1 ? "hotel" : "hotels"} found
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                        onClick={() =>
                                            navigate(`/hotel-details/${hotel._id}`)
                                        }
                                        className="group cursor-pointer overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {/* IMAGE */}

                                        <div className="relative h-64 overflow-hidden">

                                            <img
                                                src={
                                                    hotel.hotelImages?.[0] ||
                                                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"
                                                }
                                                alt={hotel.hotelName}
                                                className="w-full h-full object-cover group-hover:scale-110 duration-500"
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

                                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1 shadow">
                                                <Star size={14} fill="#FACC15" className="text-yellow-400" />
                                                <span className="text-sm font-semibold text-gray-800">4.8</span>
                                            </div>

                                            <div className="absolute top-4 right-4 bg-[#A2782E] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide uppercase">
                                                Verified
                                            </div>

                                            <div className="absolute bottom-5 left-5 right-5 text-white">
                                                <h3 className="text-2xl font-bold font-serif drop-shadow">
                                                    {hotel.hotelName}
                                                </h3>
                                                <p className="flex items-center gap-1 text-sm mt-1.5 text-gray-200">
                                                    <MapPin size={14} />
                                                    {hotel.city?.cityName || hotel.city}
                                                </p>
                                            </div>

                                        </div>

                                        {/* CONTENT */}

                                        <div className="p-6">

                                            <div className="flex flex-wrap gap-2 min-h-[38px]">

                                                {hotelAmenities.length > 0 ? (
                                                    hotelAmenities.slice(0, 4).map((item) => (
                                                        <div
                                                            key={item}
                                                            className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-semibold"
                                                        >
                                                            {amenityIcons[item]}
                                                            {item}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        No amenities available
                                                    </span>
                                                )}

                                            </div>

                                            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-400">Starting from</p>
                                                    <p className="text-lg font-bold text-gray-900">
                                                        Best Price
                                                    </p>
                                                </div>

                                                <button
                                                    className="rounded-xl bg-[#A2782E] hover:bg-[#8d6928] text-white px-5 py-3 font-semibold flex items-center justify-center gap-2 transition"
                                                >
                                                    View Details
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100">

                                <Search size={70} className="text-gray-300 mb-5" />

                                <h2 className="text-3xl font-bold font-serif">
                                    No Hotels Found
                                </h2>

                                <p className="text-gray-500 mt-3 text-center">
                                    Try changing your search keyword or filters.
                                </p>

                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedAmenities([]);
                                    }}
                                    className="mt-8 bg-[#A2782E] hover:bg-[#8d6928] text-white px-8 py-3 rounded-xl font-semibold transition"
                                >
                                    Clear Filters
                                </button>

                            </div>
                        )}

                    </div>

                </section>

            </div>

        </div>
    );

};

export default PublicHome;