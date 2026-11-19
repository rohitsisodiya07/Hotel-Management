import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { signupApi } from "../api";
import {
    MapPin,
    ChevronRight,
    Building2,
    ArrowRight,
    Compass,
    Sparkles,
} from "lucide-react";

const FALLBACK_DESTINATIONS = [
    {
        name: "Jaipur",
        state: "Rajasthan",
        count: 8,
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200",
    },
    {
        name: "Udaipur",
        state: "Rajasthan",
        count: 6,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
    },
    {
        name: "Mumbai",
        state: "Maharashtra",
        count: 12,
        image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200",
    },
    {
        name: "Goa",
        state: "Goa",
        count: 14,
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200",
    },
    {
        name: "Delhi",
        state: "Delhi",
        count: 9,
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200",
    },
    {
        name: "Bengaluru",
        state: "Karnataka",
        count: 7,
        image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1200",
    },
];

const PopularCity = ({ onSelectCity }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isStandalonePage = location.pathname.toLowerCase().includes("popularcity");

    const [citiesList, setCitiesList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCitiesFromHotels = async () => {
            try {
                setLoading(true);

                const res = await axios.get(
                    `${signupApi}hotel/public/all?limit=100`
                );

                if (res.data.success) {
                    const hotels = res.data.hotels || [];
                    const cityMap = {};

                    hotels.forEach((hotel) => {
                        const cityName = hotel.city?.cityName || hotel.city;
                        const stateName =
                            hotel.city?.districtId?.stateId?.stateName ||
                            hotel.state ||
                            "India";

                        const hotelImage =
                            Array.isArray(hotel.hotelImages) &&
                            hotel.hotelImages.length > 0
                                ? hotel.hotelImages[0]
                                : null;

                        if (
                            cityName &&
                            typeof cityName === "string"
                        ) {
                            const cityKey = cityName.trim().toLowerCase();

                            if (!cityMap[cityKey]) {
                                cityMap[cityKey] = {
                                    name: cityName.trim(),
                                    state: stateName,
                                    count: 1,
                                    image: hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
                                };
                            } else {
                                cityMap[cityKey].count += 1;
                                if (!cityMap[cityKey].image && hotelImage) {
                                    cityMap[cityKey].image = hotelImage;
                                }
                            }
                        }
                    });

                    const liveCities = Object.values(cityMap).sort(
                        (a, b) => b.count - a.count
                    );

                    if (liveCities.length > 0) {
                        setCitiesList(isStandalonePage ? liveCities : liveCities.slice(0, 4));
                    } else {
                        setCitiesList(isStandalonePage ? FALLBACK_DESTINATIONS : FALLBACK_DESTINATIONS.slice(0, 4));
                    }
                } else {
                    setCitiesList(isStandalonePage ? FALLBACK_DESTINATIONS : FALLBACK_DESTINATIONS.slice(0, 4));
                }
            } catch (error) {
                console.error("Error fetching popular cities:", error);
                setCitiesList(isStandalonePage ? FALLBACK_DESTINATIONS : FALLBACK_DESTINATIONS.slice(0, 4));
            } finally {
                setLoading(false);
            }
        };

        fetchCitiesFromHotels();
    }, [isStandalonePage]);

    const handleCityClick = (cityName) => {
        if (onSelectCity) {
            onSelectCity(cityName);
            setTimeout(() => {
                const element = document.getElementById("hotels-section");
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 120);
        } else {
            // Navigate to home page with city query param and scroll hash
            navigate(`/?city=${encodeURIComponent(cityName)}#hotels-section`);
        }
    };

    if (loading) {
        return (
            <section className={`w-full bg-[#faf9f6] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 ${isStandalonePage ? "pt-24 sm:pt-28" : "border-t border-[#e9e7e1]"}`}>
                <div className="mx-auto max-w-[1440px]">
                    <div className="mb-7 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
                        <div className="w-full">
                            <div className="mb-3 h-3 w-28 animate-pulse rounded-full bg-[#e7e5df]" />
                            <div className="h-8 w-56 max-w-full animate-pulse rounded-lg bg-[#e7e5df]" />
                            <div className="mt-3 h-3 w-72 max-w-full animate-pulse rounded-full bg-[#eeece7]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-[280px] animate-pulse rounded-[22px] bg-[#eeece7] sm:h-[310px] lg:h-[330px]"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`w-full overflow-hidden bg-[#faf9f6] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 ${isStandalonePage ? "pt-24 sm:pt-28 min-h-screen" : "border-t border-[#e9e7e1]"}`}>
            <div className="mx-auto max-w-[1440px]">
                {/* Standalone Breadcrumbs */}
                {isStandalonePage && (
                    <div className="mb-6 flex items-center gap-2 text-xs font-medium text-[#738477]">
                        <Link to="/" className="hover:text-[#252b26] transition-colors">Home</Link>
                        <ChevronRight size={13} />
                        <span className="text-[#252b26] font-semibold">Destinations</span>
                    </div>
                )}

                {/* Section heading */}
                <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3d5945] sm:text-[11px]">
                            <Compass size={13} strokeWidth={2} />
                            Curated Destinations
                        </span>

                        <h2 className="font-['Cormorant_Garamond'] text-[34px] font-semibold leading-[1.05] tracking-tight text-[#1c241e] sm:text-4xl lg:text-[46px]">
                            Find your next <span className="italic text-[#4a6b53]">escape</span>
                        </h2>

                        <p className="mt-3 max-w-xl text-[13px] leading-6 text-[#697268] sm:text-sm">
                            Click any iconic destination below to discover handpicked luxury stays, heritage retreats, and scenic suites.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 border-b border-[#d4dbd0] pb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[#5d685c]">
                        <Building2 size={14} strokeWidth={1.8} />
                        <span>{citiesList.length} destinations ready to explore</span>
                    </div>
                </div>

                {/* Destination cards grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {citiesList.map((destination) => (
                        <button
                            key={`${destination.name}-${destination.state}`}
                            type="button"
                            onClick={() => handleCityClick(destination.name)}
                            aria-label={`Explore hotels in ${destination.name}, ${destination.state}`}
                            className="group relative isolate h-[290px] w-full overflow-hidden rounded-[22px] bg-[#1a251e] text-left shadow-[0_6px_22px_rgba(20,32,24,0.1)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(15,28,19,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a6b53] focus-visible:ring-offset-4 sm:h-[320px] lg:h-[340px] cursor-pointer"
                        >
                            <img
                                src={destination.image}
                                alt={`Hotels in ${destination.name}`}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src =
                                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200";
                                }}
                            />

                            {/* Deep luxury gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#09150e]/95 via-[#0e1d13]/35 to-black/15" />
                            <div className="absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/15" />

                            {/* Property count badge */}
                            <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#0e1a12]/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-white shadow-sm backdrop-blur-md">
                                    <Sparkles size={11} className="text-amber-300" />
                                    {destination.count}{" "}
                                    {destination.count === 1 ? "Stay" : "Stays"}
                                </span>
                            </div>

                            {/* Card content */}
                            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                                <div className="flex items-end justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="truncate font-['Cormorant_Garamond'] text-[32px] font-semibold leading-none tracking-wide text-white group-hover:text-amber-100 transition-colors sm:text-[36px]">
                                            {destination.name}
                                        </h3>

                                        <p className="mt-2 flex items-center gap-1.5 text-xs text-white/85 sm:text-[13px]">
                                            <MapPin
                                                size={12}
                                                className="shrink-0 text-emerald-300"
                                                strokeWidth={2}
                                            />
                                            <span className="truncate">{destination.state}</span>
                                        </p>

                                        <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 transition-all duration-300 group-hover:text-amber-200">
                                            Explore stays
                                            <ArrowRight
                                                size={13}
                                                className="transition-transform duration-300 group-hover:translate-x-1.5"
                                            />
                                        </span>
                                    </div>

                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-[#1a251e] sm:h-11 sm:w-11">
                                        <ChevronRight size={18} strokeWidth={2} />
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PopularCity;
