
import React, {
    useEffect,
    useMemo,
    useState,
    useRef,
    useCallback,
} from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupApi } from "../api";
import PopularCity from "./PopularCity";
import Promotions from "./Promotions";
import Testimonials from "./Testimonials";
import logo from "../assets/logo.png";
import { Toaster, toast } from "sonner";
import { isStaySaved, toggleSaveStay } from "../utils/wishlist";

import {
    Search,
    MapPin,
    Star,
    Wifi,
    Waves,
    Dumbbell,
    Utensils,
    Car,
    ChevronRight,
    X,
    Menu,
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
    Eye,
    ArrowRight,
    Building2,
    Heart,
} from "lucide-react";

// Real hotel and resort photographs used in the hero background slider.
const HERO_BACKGROUNDS = [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=76",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=76",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=76",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=76",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=76",
];

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85";

// Small client-side cache so repeat visits can show hotels immediately
// while the latest data is fetched in the background.
const HOTEL_CACHE_KEY_PREFIX = "aurastays_public_hotels_v1:";
const HOTEL_CACHE_TTL = 5 * 60 * 1000;
const HOTEL_META_CACHE_KEY = "aurastays_hotel_metadata_v1";
const HOTEL_META_CACHE_TTL = 30 * 60 * 1000;

const readLocalCache = (key, ttl) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const cached = JSON.parse(raw);
        if (!cached?.savedAt || Date.now() - cached.savedAt > ttl) {
            localStorage.removeItem(key);
            return null;
        }

        return cached.data ?? null;
    } catch {
        return null;
    }
};

const writeLocalCache = (key, data) => {
    try {
        localStorage.setItem(
            key,
            JSON.stringify({ savedAt: Date.now(), data })
        );
    } catch (error) {
        // Storage can be unavailable or full; the page still works without it.
        console.warn("AuraStays cache could not be saved:", error);
    }
};

const DEFAULT_HOTELS_CACHE_KEY =
    `${HOTEL_CACHE_KEY_PREFIX}sortBy=recommended&page=1&limit=6`;
const initialHotelsCache = readLocalCache(
    DEFAULT_HOTELS_CACHE_KEY,
    HOTEL_CACHE_TTL
);
const initialMetadataCache = readLocalCache(
    HOTEL_META_CACHE_KEY,
    HOTEL_META_CACHE_TTL
);

const amenityIcons = {
    "Free Wi-Fi": <Wifi size={14} />,
    "Free Parking": <Car size={14} />,
    "Valet Parking": <Car size={14} />,
    "Swimming Pool": <Waves size={14} />,
    "Gym / Fitness Center": <Dumbbell size={14} />,
    "Spa & Wellness Center": <Waves size={14} />,
    Restaurant: <Utensils size={14} />,
    Cafe: <Coffee size={14} />,
    "24/7 Security": <Shield size={14} />,
};

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
};

const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getNextDay = (dateString) => {
    if (!dateString) return "";

    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Swipeable hotel image gallery
const HotelImageSlider = ({ images = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const sliderRef = useRef(null);

    const validImages = images.length ? images : [FALLBACK_IMAGE];

    const handleScroll = () => {
        if (!sliderRef.current) return;

        const index = Math.round(
            sliderRef.current.scrollLeft /
            sliderRef.current.clientWidth
        );

        setCurrentIndex(index);
    };

    const scrollToImage = (index) => {
        if (!sliderRef.current) return;

        sliderRef.current.scrollTo({
            left: index * sliderRef.current.clientWidth,
            behavior: "smooth",
        });

        setCurrentIndex(index);
    };

    return (
        <div className="relative h-full w-full overflow-hidden bg-gray-100">
            <div
                ref={sliderRef}
                onScroll={handleScroll}
                className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
            >
                {validImages.map((image, index) => (
                    <div
                        key={`${image}-${index}`}
                        className="h-full w-full shrink-0 snap-center"
                    >
                        <img
                            src={image || FALLBACK_IMAGE}
                            alt={`Hotel view ${index + 1}`}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = FALLBACK_IMAGE;
                            }}
                        />
                    </div>
                ))}
            </div>

            {validImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-2">
                    {validImages.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                scrollToImage(index);
                            }}
                            aria-label={`View image ${index + 1}`}
                            className={`h-1.5 rounded-full transition-all ${currentIndex === index
                                ? "w-5 bg-white"
                                : "w-1.5 bg-white/60"
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

    // Change the hero background automatically every five seconds.
    const [heroBgIndex, setHeroBgIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setHeroBgIndex((currentIndex) =>
                (currentIndex + 1) % HERO_BACKGROUNDS.length
            );
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // Prepare the next slide in the background to keep the transition smooth.
    useEffect(() => {
        const nextImage = new Image();
        nextImage.src =
            HERO_BACKGROUNDS[(heroBgIndex + 1) % HERO_BACKGROUNDS.length];
    }, [heroBgIndex]);

    const [hotels, setHotels] = useState(
        () => initialHotelsCache?.hotels || []
    );
    const [loading, setLoading] = useState(!initialHotelsCache);
    const [loadingMore, setLoadingMore] = useState(false);

    const [allHotelsForDropdowns, setAllHotelsForDropdowns] =
        useState(() => initialMetadataCache || []);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedPropertyType, setSelectedPropertyType] =
        useState("");

    const [sortBy, setSortBy] = useState("recommended");

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");

    const [searchParams] = useSearchParams();
    const [maxPrice, setMaxPrice] = useState(50000);
    const [selectedStar, setSelectedStar] = useState(0);
    const [destinationDropdownOpen, setDestinationDropdownOpen] = useState(false);
    const [wishlistTick, setWishlistTick] = useState(0);
    const destinationRef = useRef(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(
        () => initialHotelsCache?.hasMore ?? true
    );
    const [totalHotels, setTotalHotels] = useState(
        () => initialHotelsCache?.totalHotels || 0
    );

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] =
        useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] =
        useState(false);

    const dropdownRef = useRef(null);

    const hotelAmenitiesList = Object.keys(amenityIcons);

    const token = localStorage.getItem("token");
    const user = getStoredUser();

    // Listen to ?city= param from destinations page or explore links
    useEffect(() => {
        const cityParam = searchParams.get("city");
        if (cityParam) {
            setSelectedCity(cityParam);
            setSearchQuery(cityParam);
            setTimeout(() => {
                document
                    .getElementById("hotels-section")
                    ?.scrollIntoView({ behavior: "smooth" });
            }, 300);
        }
    }, [searchParams]);

    // Close destination suggestions on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                destinationRef.current &&
                !destinationRef.current.contains(e.target)
            ) {
                setDestinationDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () =>
            document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load filter metadata from cache first; refresh it in the background.
    useEffect(() => {
        const fetchInitialMeta = async () => {
            const cachedMetadata = readLocalCache(
                HOTEL_META_CACHE_KEY,
                HOTEL_META_CACHE_TTL
            );

            if (cachedMetadata) {
                setAllHotelsForDropdowns(cachedMetadata);
                return;
            }

            try {
                const response = await axios.get(
                    `${signupApi}hotel/public/all?limit=100`,
                    { timeout: 20000 }
                );

                const metadata = response.data.hotels || [];
                setAllHotelsForDropdowns(metadata);
                writeLocalCache(HOTEL_META_CACHE_KEY, metadata);
            } catch (error) {
                console.error("Hotel metadata error:", error);
            }
        };

        fetchInitialMeta();
    }, []);

    // Fetch hotels using the existing public API
    const fetchFilteredHotels = useCallback(
        async (pageNumber = 1, isNewFilter = false) => {
            let hasCachedResults = false;

            try {
                if (pageNumber === 1) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }

                const params = new URLSearchParams();

                if (debouncedSearch.trim()) {
                    params.append("search", debouncedSearch.trim());
                }

                if (selectedState) {
                    params.append("state", selectedState);
                }

                if (selectedCity) {
                    params.append("city", selectedCity);
                }

                if (selectedPropertyType) {
                    params.append(
                        "propertyType",
                        selectedPropertyType
                    );
                }

                if (selectedAmenities.length > 0) {
                    params.append(
                        "amenities",
                        selectedAmenities.join(",")
                    );
                }

                if (checkInDate) {
                    params.append("checkIn", checkInDate);
                }

                if (checkOutDate) {
                    params.append("checkOut", checkOutDate);
                }

                params.append("sortBy", sortBy);
                params.append("page", pageNumber);
                params.append("limit", 6);

                const requestUrl =
                    `${signupApi}hotel/public/all?${params.toString()}`;
                const cacheKey =
                    `${HOTEL_CACHE_KEY_PREFIX}${params.toString()}`;

                // For the first page, show cached results immediately.
                // The request below still refreshes the data from the server.
                if (pageNumber === 1) {
                    const cached = readLocalCache(
                        cacheKey,
                        HOTEL_CACHE_TTL
                    );

                    if (cached) {
                        hasCachedResults = true;
                        setHotels(cached.hotels || []);
                        setTotalHotels(cached.totalHotels || 0);
                        setHasMore(cached.hasMore ?? false);
                        setLoading(false);
                    } else {
                        setLoading(true);
                    }
                }

                const response = await axios.get(requestUrl, {
                    timeout: 30000,
                });

                if (response.data.success) {
                    const fetchedHotels =
                        response.data.hotels || [];
                    const nextTotalHotels =
                        response.data.totalHotels || 0;
                    const nextHasMore =
                        pageNumber < (response.data.totalPages || 1);

                    if (isNewFilter || pageNumber === 1) {
                        setHotels(fetchedHotels);
                    } else {
                        setHotels((previous) => [
                            ...previous,
                            ...fetchedHotels,
                        ]);
                    }

                    setTotalHotels(nextTotalHotels);
                    setHasMore(nextHasMore);

                    if (pageNumber === 1) {
                        writeLocalCache(cacheKey, {
                            hotels: fetchedHotels,
                            totalHotels: nextTotalHotels,
                            hasMore: nextHasMore,
                        });
                    }
                }
            } catch (error) {
                console.error("Fetch hotels error:", error);

                // If cached hotels are already visible, don't interrupt the user.
                if (pageNumber !== 1 || !hasCachedResults) {
                    toast.error("Unable to load hotels. Please try again.");
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [
            debouncedSearch,
            selectedState,
            selectedCity,
            selectedPropertyType,
            selectedAmenities,
            checkInDate,
            checkOutDate,
            sortBy,
        ]
    );

    // Refetch when filters change
    useEffect(() => {
        setPage(1);
        fetchFilteredHotels(1, true);
    }, [fetchFilteredHotels]);

    const handleLoadMore = () => {
        if (loadingMore || !hasMore) return;

        const nextPage = page + 1;

        setPage(nextPage);
        fetchFilteredHotels(nextPage, false);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedAmenities([]);
        setSelectedState("");
        setSelectedCity("");
        setSelectedPropertyType("");
        setCheckInDate("");
        setCheckOutDate("");
        setMaxPrice(50000);
        setSelectedStar(0);
        setSortBy("recommended");
    };

    const toggleAmenity = (amenity) => {
        setSelectedAmenities((previous) =>
            previous.includes(amenity)
                ? previous.filter((item) => item !== amenity)
                : [...previous, amenity]
        );
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setProfileDropdownOpen(false);
        navigate("/login");
    };

    const managementRoutes = {
        admin: "/admin/dashboard",
        hotel: "/hotel/hotelDashboard",
        superAdmin: "/superAdmin/dashboard",
    };

    const handleManagementRedirect = () => {
        setProfileDropdownOpen(false);

        const route =
            managementRoutes[user?.role] ||
            "/hotel/hotelDashboard";

        navigate(route);
    };

    // Available filter options
    const availablePropertyTypes = useMemo(() => {
        const types = new Set();

        allHotelsForDropdowns.forEach((hotel) => {
            if (hotel.hotelType) {
                types.add(hotel.hotelType);
            }
        });

        return Array.from(types).sort();
    }, [allHotelsForDropdowns]);

    const availableStates = useMemo(() => {
        const states = new Set();

        allHotelsForDropdowns.forEach((hotel) => {
            const stateName =
                hotel.city?.districtId?.stateId?.stateName ||
                hotel.state;

            if (stateName) states.add(stateName);
        });

        return Array.from(states).sort();
    }, [allHotelsForDropdowns]);

    const availableCities = useMemo(() => {
        const cities = new Set();

        allHotelsForDropdowns.forEach((hotel) => {
            const stateName =
                hotel.city?.districtId?.stateId?.stateName ||
                hotel.state;

            const cityName =
                hotel.city?.cityName || hotel.city;

            if (
                cityName &&
                (!selectedState || stateName === selectedState)
            ) {
                cities.add(cityName);
            }
        });

        return Array.from(cities).sort();
    }, [allHotelsForDropdowns, selectedState]);

    const activeFiltersCount =
        selectedAmenities.length +
        Number(Boolean(selectedState)) +
        Number(Boolean(selectedCity)) +
        Number(Boolean(selectedPropertyType)) +
        Number(Boolean(checkInDate)) +
        Number(Boolean(checkOutDate)) +
        Number(maxPrice < 50000) +
        Number(selectedStar > 0);

    const scrollToHotels = () => {
        document
            .getElementById("hotels-section")
            ?.scrollIntoView({ behavior: "smooth" });

        setMobileMenuOpen(false);
    };

    const renderFilters = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E8E3] pb-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal
                        size={17}
                        className="text-[#405B49]"
                    />
                    <h3 className="font-semibold text-[#292D29]">
                        Filters
                    </h3>
                </div>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="text-sm font-medium text-[#405B49] hover:underline"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#343A34]">
                        Max Price / Night
                    </label>
                    <span className="text-xs font-bold text-[#405B49]">
                        {maxPrice >= 50000
                            ? "Any price"
                            : `Up to ₹${maxPrice.toLocaleString("en-IN")}`}
                    </span>
                </div>
                <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#405B49] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>₹1,000</span>
                    <span>₹25,000</span>
                    <span>₹50,000+</span>
                </div>
            </div>

            {/* Star Rating Filter */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-[#343A34]">
                    Minimum Rating
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                    {[
                        { label: "All", value: 0 },
                        { label: "4.5+ ★", value: 4.5 },
                        { label: "4.0+ ★", value: 4.0 },
                        { label: "3.5+ ★", value: 3.5 },
                    ].map((star) => (
                        <button
                            key={star.value}
                            type="button"
                            onClick={() => setSelectedStar(star.value)}
                            className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                selectedStar === star.value
                                    ? "bg-[#405B49] text-white border-[#405B49] shadow-xs"
                                    : "bg-white text-gray-600 border-[#E3E5DF] hover:bg-[#F3F5F1]"
                            }`}
                        >
                            {star.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-[#343A34]">
                    Property type
                </label>

                <select
                    value={selectedPropertyType}
                    onChange={(event) =>
                        setSelectedPropertyType(event.target.value)
                    }
                    className="w-full rounded-lg border border-[#E3E5DF] bg-white px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-[#536B57]"
                >
                    <option value="">All property types</option>

                    {availablePropertyTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-[#343A34]">
                    State
                </label>

                <select
                    value={selectedState}
                    onChange={(event) => {
                        setSelectedState(event.target.value);
                        setSelectedCity("");
                    }}
                    className="w-full rounded-lg border border-[#E3E5DF] bg-white px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-[#536B57]"
                >
                    <option value="">All states</option>

                    {availableStates.map((state) => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-[#343A34]">
                    City
                </label>

                <select
                    value={selectedCity}
                    onChange={(event) =>
                        setSelectedCity(event.target.value)
                    }
                    className="w-full rounded-lg border border-[#E3E5DF] bg-white px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-[#536B57]"
                >
                    <option value="">All cities</option>

                    {availableCities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#343A34]">
                    Amenities
                </h4>

                <div className="space-y-2">
                    {hotelAmenitiesList.map((amenity) => {
                        const checked =
                            selectedAmenities.includes(amenity);

                        return (
                            <label
                                key={amenity}
                                className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                        toggleAmenity(amenity)
                                    }
                                    className="h-4 w-4 accent-[#405B49]"
                                />

                                <span className="flex items-center gap-2">
                                    <span className="text-[#647568]">
                                        {amenityIcons[amenity]}
                                    </span>
                                    {amenity}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#F7F8F4] font-sans text-[#252B26] selection:bg-[#DCE7DC] selection:text-[#263B2C]">
            <style>{`
                @keyframes heroFade {
                    from { opacity: 0.35; transform: scale(1.015); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
            <Toaster position="top-right" richColors />

            {/* HERO SECTION */}
            <section className="relative flex min-h-[700px] flex-col overflow-visible bg-[#1E2922] text-white lg:min-h-[790px]">
                {/* AUTOMATIC HERO BACKGROUND SLIDER */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        key={HERO_BACKGROUNDS[heroBgIndex]}
                        className="absolute inset-0 animate-[heroFade_900ms_ease-in-out]"
                    >
                        <img
                            src={HERO_BACKGROUNDS[heroBgIndex]}
                            alt="Luxury hotel and resort view"
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover object-center"
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = FALLBACK_IMAGE;
                            }}
                        />
                    </div>
                </div>

                {/* Keep hero text readable over every background image. */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,25,17,0.78)_0%,rgba(13,25,17,0.48)_48%,rgba(13,25,17,0.18)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,18,12,0.62)_0%,transparent_52%,rgba(10,18,12,0.28)_100%)]" />

                {/* MANUAL BACKGROUND IMAGE INDICATORS */}
                <div className="absolute bottom-[270px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-[160px]">
                    {HERO_BACKGROUNDS.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setHeroBgIndex(index)}
                            aria-label={`Show background image ${index + 1}`}
                            aria-pressed={heroBgIndex === index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${heroBgIndex === index
                                ? "w-8 bg-white"
                                : "w-2 bg-white/55 hover:bg-white/90"
                                }`}
                        />
                    ))}
                </div>

                {/* HERO CONTENT */}
                <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pb-28">
                    <div className="max-w-3xl">
                        <p className="mb-6 inline-flex w-fit items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/85 sm:text-xs">
                            A better way to travel
                        </p>

                        <h1 className="max-w-3xl text-[2.65rem] font-medium leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-[5.25rem]">
                            Find your place
                            <br />
                            <span className="font-serif italic">
                                away from home.
                            </span>
                        </h1>

                        <p className="mt-7 max-w-xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
                            Thoughtfully chosen stays for the trips
                            you will remember. Find a place that feels
                            right, wherever you are going.
                        </p>

                        <button
                            onClick={scrollToHotels}
                            className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#F7F8F4] px-7 py-4 text-sm font-semibold text-[#304635] shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                        >
                            Explore properties
                            <ArrowRight size={17} />
                        </button>
                    </div>
                </div>

                {/* SEARCH PANEL */}
                <div className="relative z-20 mx-auto mb-[-58px] w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
                    <div className="rounded-2xl border border-white/70 bg-white p-5 text-[#292D29] shadow-[0_22px_60px_rgba(18,35,23,0.18)] sm:rounded-[22px] sm:p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end lg:gap-3">
                            <div className="min-w-0 relative" ref={destinationRef}>
                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                                    <MapPin size={15} />
                                    Destination
                                </label>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onFocus={() => setDestinationDropdownOpen(true)}
                                    onChange={(event) => {
                                        setSearchQuery(event.target.value);
                                        setDestinationDropdownOpen(true);
                                    }}
                                    placeholder="Where would you like to go?"
                                    className="w-full border-b border-gray-200 bg-transparent pb-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#536B57]"
                                />

                                {/* Interactive Suggestions Dropdown */}
                                {destinationDropdownOpen && (
                                    <div className="absolute left-0 top-[105%] z-50 w-full sm:w-[300px] rounded-2xl bg-white border border-[#E3E8DF] shadow-[0_15px_35px_rgba(20,35,25,0.15)] p-3 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 px-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Popular Destinations
                                            </span>
                                            <span className="text-[10px] text-[#405B49] font-semibold">
                                                Select
                                            </span>
                                        </div>
                                        <div className="space-y-1 max-h-52 overflow-y-auto">
                                            {(availableCities && availableCities.length > 0
                                                ? availableCities
                                                : ["Jaipur", "Udaipur", "Mumbai", "Goa", "Delhi", "Bengaluru"]
                                            ).map((city) => (
                                                <button
                                                    key={city}
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchQuery(city);
                                                        setSelectedCity(city);
                                                        setDestinationDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-gray-700 hover:bg-[#F2F6F1] hover:text-[#173D31] transition-colors cursor-pointer"
                                                >
                                                    <MapPin size={13} className="text-[#405B49] shrink-0" />
                                                    <span className="truncate">{city}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                                    <Calendar size={15} />
                                    Check in
                                </label>

                                <input
                                    type="date"
                                    value={checkInDate}
                                    min={getToday()}
                                    onChange={(event) => {
                                        const value = event.target.value;

                                        setCheckInDate(value);

                                        if (
                                            checkOutDate &&
                                            checkOutDate <= value
                                        ) {
                                            setCheckOutDate(
                                                getNextDay(value)
                                            );
                                        }
                                    }}
                                    className="w-full border-b border-gray-200 bg-transparent pb-3 text-sm text-gray-700 outline-none focus:border-[#536B57]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                                    <Calendar size={15} />
                                    Check out
                                </label>

                                <input
                                    type="date"
                                    value={checkOutDate}
                                    min={
                                        checkInDate
                                            ? getNextDay(checkInDate)
                                            : getToday()
                                    }
                                    onChange={(event) =>
                                        setCheckOutDate(
                                            event.target.value
                                        )
                                    }
                                    className="w-full border-b border-gray-200 bg-transparent pb-3 text-sm text-gray-700 outline-none focus:border-[#536B57]"
                                />
                            </div>

                            <div className="hidden lg:block">
                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                                    <Building2 size={15} />
                                    Stay type
                                </label>

                                <select
                                    value={selectedPropertyType}
                                    onChange={(event) =>
                                        setSelectedPropertyType(
                                            event.target.value
                                        )
                                    }
                                    className="w-full border-b border-gray-200 bg-white pb-3 text-sm text-gray-700 outline-none focus:border-[#536B57]"
                                >
                                    <option value="">Any property</option>

                                    {availablePropertyTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={scrollToHotels}
                                className="flex items-center justify-center gap-2 rounded-lg bg-[#405B49] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#344A3B]"
                            >
                                <Search size={17} />
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOTEL LISTINGS */}
            <section
                id="hotels-section"
                className="scroll-mt-10 bg-[#F7F8F4] px-5 pb-24 pt-32 sm:px-8 lg:px-12"
            >
                <div className="mx-auto max-w-[1440px]">
                    {/* SECTION INTRO */}
                    <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#657968]">
                                Find your next stay
                            </p>

                            <h2 className="font-serif text-3xl text-[#292D29] sm:text-4xl">
                                Places worth staying
                            </h2>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                                Explore comfortable stays, beautiful
                                locations and places made for a good
                                experience.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() =>
                                    setMobileFiltersOpen(true)
                                }
                                className="flex items-center gap-2 rounded-lg border border-[#DFE3DC] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 lg:hidden"
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#405B49] text-xs text-white">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            <div className="flex items-center gap-2 rounded-lg border border-[#DFE3DC] bg-white px-3 py-2.5">
                                <ArrowUpDown
                                    size={15}
                                    className="text-[#536B57]"
                                />

                                <select
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(event.target.value)
                                    }
                                    className="max-w-[175px] bg-transparent text-sm text-gray-700 outline-none"
                                >
                                    <option value="recommended">
                                        Recommended
                                    </option>
                                    <option value="price-low">
                                        Price: Low to High
                                    </option>
                                    <option value="price-high">
                                        Price: High to Low
                                    </option>
                                    <option value="name-asc">
                                        Name: A to Z
                                    </option>
                                    <option value="name-desc">
                                        Name: Z to A
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* DESKTOP FILTER SIDEBAR */}
                        <aside className="hidden w-full shrink-0 lg:block lg:w-[260px]">
                            <div className="sticky top-6 rounded-xl border border-[#E8E8E3] bg-white p-5">
                                {renderFilters()}
                            </div>
                        </aside>

                        {/* HOTEL RESULTS */}
                        <div className="min-w-0 flex-1">
                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold text-[#292D29]">
                                        {totalHotels}
                                    </span>{" "}
                                    properties found
                                </p>

                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={resetFilters}
                                        className="text-sm font-medium text-[#405B49] hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            <div className="relative min-h-[350px]">
                                {loading && (
                                    <div className="absolute inset-0 z-10 grid grid-cols-1 gap-6 bg-[#FAFAF7]/90 sm:grid-cols-2">
                                        {[1, 2, 3, 4].map((item) => (
                                            <div
                                                key={item}
                                                className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white"
                                            >
                                                <div className="h-56 bg-gray-200" />
                                                <div className="space-y-3 p-5">
                                                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                                                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                                                    <div className="h-8 w-full rounded bg-gray-100" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!loading && hotels.length === 0 ? (
                                    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-[#D8DED5] bg-white px-6 text-center">
                                        <Search
                                            size={35}
                                            className="mb-4 text-gray-300"
                                        />

                                        <h3 className="font-serif text-2xl text-[#292D29]">
                                            No stays found
                                        </h3>

                                        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                            We could not find properties
                                            matching your current search.
                                            Try changing your filters.
                                        </p>

                                        <button
                                            onClick={resetFilters}
                                            className="mt-5 rounded-lg bg-[#405B49] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344A3B]"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        {hotels
                                            .filter((h) => {
                                                if (
                                                    selectedStar > 0 &&
                                                    (h.rating || 4.8) < selectedStar
                                                )
                                                    return false;
                                                if (
                                                    maxPrice < 50000 &&
                                                    h.pricePerNight &&
                                                    Number(h.pricePerNight) > maxPrice
                                                )
                                                    return false;
                                                return true;
                                            })
                                            .map((hotel) => {
                                            const hotelAmenities =
                                                Array.isArray(hotel.amenities)
                                                    ? hotel.amenities
                                                    : hotel.amenities
                                                        ? hotel.amenities
                                                            .split(",")
                                                            .map((item) =>
                                                                item.trim()
                                                            )
                                                        : [];

                                            const cityName =
                                                hotel.city?.cityName ||
                                                hotel.city ||
                                                "";

                                            const stateName =
                                                hotel.city?.districtId
                                                    ?.stateId?.stateName ||
                                                hotel.state ||
                                                "";

                                            return (
                                                <article
                                                    key={hotel._id}
                                                    className="group overflow-hidden rounded-[22px] border border-[#E5E9E2] bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-[#CFD9CE] hover:shadow-[0_24px_55px_rgba(31,49,37,0.12)]"
                                                >
                                                    {/* HOTEL IMAGE */}
                                                    <div className="relative h-64 overflow-hidden bg-[#EEF1EC] sm:h-[280px]">
                                                        <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.035]">
                                                            <HotelImageSlider
                                                                images={
                                                                    hotel.hotelImages?.length
                                                                        ? hotel.hotelImages
                                                                        : [FALLBACK_IMAGE]
                                                                }
                                                            />
                                                        </div>

                                                        {hotel.hotelType && (
                                                            <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#405B49] shadow-sm">
                                                                {hotel.hotelType}
                                                            </span>
                                                        )}

                                                        {/* Top right badges: Rating & Wishlist Heart */}
                                                        <div className="absolute right-3.5 top-3.5 z-10 flex items-center gap-2">
                                                            {hotel.rating ? (
                                                                <div className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#292D29] shadow-sm backdrop-blur-xs">
                                                                    <Star
                                                                        size={12}
                                                                        fill="#D97706"
                                                                        className="text-amber-500"
                                                                    />
                                                                    {Number(hotel.rating).toFixed(1)}
                                                                </div>
                                                            ) : null}
                                                            <button
                                                                type="button"
                                                                aria-label="Save to wishlist"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const nowSaved = toggleSaveStay(hotel);
                                                                    setWishlistTick((prev) => prev + 1);
                                                                    if (nowSaved) {
                                                                        toast.success(`Saved "${hotel.hotelName}"!`);
                                                                    } else {
                                                                        toast.info(`Removed "${hotel.hotelName}"`);
                                                                    }
                                                                }}
                                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white cursor-pointer"
                                                            >
                                                                <Heart
                                                                    size={15}
                                                                    className={isStaySaved(hotel._id) ? "fill-rose-500 hover:fill-white" : ""}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* HOTEL DETAILS */}
                                                    <div className="p-5 sm:p-6 lg:p-7">
                                                        <div className="mb-4">
                                                            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#718071]">
                                                                <MapPin size={13} />
                                                                <span className="truncate">
                                                                    {cityName}
                                                                    {stateName ? `, ${stateName}` : ""}
                                                                </span>
                                                            </p>

                                                            <h3 className="line-clamp-1 font-serif text-[22px] leading-tight text-[#292D29] transition-colors group-hover:text-[#405B49]">
                                                                {hotel.hotelName}
                                                            </h3>
                                                        </div>

                                                        {hotelAmenities.length > 0 && (
                                                            <div className="mb-5 flex min-h-[34px] flex-wrap content-start gap-2">
                                                                {hotelAmenities.slice(0, 4).map((item) => (
                                                                    <span
                                                                        key={item}
                                                                        className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F5F1] px-3 py-1.5 text-[11px] font-medium text-[#536653]"
                                                                    >
                                                                        {amenityIcons[item] || <Check size={12} />}
                                                                        {item}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex items-end justify-between gap-3 border-t border-[#EEEEEA] pt-4">
                                                            <div className="min-w-0">
                                                                <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#899188]">
                                                                    Starting from
                                                                </p>
                                                                <p className="text-xl font-semibold tabular-nums text-[#292D29]">
                                                                    {hotel.pricePerNight
                                                                        ? `₹${hotel.pricePerNight}`
                                                                        : "Price unavailable"}
                                                                    {hotel.pricePerNight && (
                                                                        <span className="ml-1 text-xs font-normal text-gray-400">
                                                                            / night
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <button
                                                                onClick={() =>
                                                                    navigate(`/hotel-details/${hotel._id}`)
                                                                }
                                                                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#405B49] px-5 py-3 text-xs font-semibold text-white transition-all duration-300 hover:bg-[#344A3B] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#405B49]/30 focus:ring-offset-2"
                                                            >
                                                                View details
                                                                <ChevronRight size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* LOAD MORE */}
                            {hasMore && hotels.length > 0 && (
                                <div className="mt-12 text-center">
                                    <p className="mb-4 text-xs text-gray-400">
                                        Showing {hotels.length} of{" "}
                                        {totalHotels} properties
                                    </p>

                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="inline-flex items-center gap-2 rounded-lg border border-[#405B49] bg-white px-7 py-3 text-sm font-semibold text-[#405B49] transition hover:bg-[#405B49] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                Load more properties
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* MOBILE FILTER DRAWER */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <button
                        aria-label="Close filters"
                        onClick={() => setMobileFiltersOpen(false)}
                        className="absolute inset-0 bg-black/40"
                    />

                    <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-serif text-2xl text-[#292D29]">
                                Filters
                            </h3>

                            <button
                                onClick={() =>
                                    setMobileFiltersOpen(false)
                                }
                                className="rounded-full bg-gray-100 p-2 text-gray-600"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {renderFilters()}

                        <div className="sticky bottom-0 mt-7 flex gap-3 border-t border-gray-100 bg-white pt-4">
                            <button
                                onClick={resetFilters}
                                className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-700"
                            >
                                Reset
                            </button>

                            <button
                                onClick={() =>
                                    setMobileFiltersOpen(false)
                                }
                                className="flex-1 rounded-lg bg-[#405B49] py-3 text-sm font-semibold text-white"
                            >
                                Show properties
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTHER HOME SECTIONS */}
            <div className="bg-white">
                <Promotions />
                <Testimonials />
                <PopularCity
                    onSelectCity={(cityName) => {
                        setSearchQuery(cityName);

                        setTimeout(() => {
                            document
                                .getElementById("hotels-section")
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                });
                        }, 100);
                    }}
                />
            </div>
        </main>
    );
};

export default PublicHome;
