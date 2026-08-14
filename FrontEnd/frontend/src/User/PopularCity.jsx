import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import {
    MapPin,
    ChevronRight,
    Building2,
    ArrowRight,
} from "lucide-react";

const PopularCity = ({ onSelectCity }) => {
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
                        const cityName =
                            hotel.city?.cityName || hotel.city;

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
                            typeof cityName === "string" &&
                            hotelImage
                        ) {
                            const cityKey = cityName
                                .trim()
                                .toLowerCase();

                            if (!cityMap[cityKey]) {
                                cityMap[cityKey] = {
                                    name: cityName.trim(),
                                    state: stateName,
                                    count: 1,
                                    image: hotelImage,
                                };
                            } else {
                                cityMap[cityKey].count += 1;
                            }
                        }
                    });

                    const formattedCities = Object.values(cityMap)
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 4);

                    setCitiesList(formattedCities);
                }
            } catch (error) {
                console.error(
                    "Error fetching popular cities:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCitiesFromHotels();
    }, []);

    const handleCityClick = (cityName) => {
        // Set city in the main search
        if (onSelectCity) {
            onSelectCity(cityName);
        }

        // Scroll to hotel results
        setTimeout(() => {
            const element =
                document.getElementById("hotels-section");

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }, 100);
    };

    /* ================= LOADING ================= */
    if (loading) {
        return (
            <section className="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 bg-white w-full border-t border-gray-100 mt-12">

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
                    <div>
                        <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mb-2" />

                        <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="h-4 w-64 bg-gray-100 rounded animate-pulse hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-80 rounded-3xl bg-gray-100 animate-pulse"
                        />
                    ))}
                </div>

            </section>
        );
    }

    if (citiesList.length === 0) {
        return null;
    }

    return (
        <section className="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 bg-white w-full border-t border-gray-100 mt-12">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">

                <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-['IBM_Plex_Mono'] tracking-[0.15em] text-blue-600 font-bold uppercase mb-1.5">
                        <MapPin size={12} />
                        Explore Locations
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-gray-900 tracking-tight">
                        Popular Destinations
                    </h2>

                    <p className="text-xs text-gray-500 mt-2 max-w-lg leading-relaxed">
                        Discover beautiful destinations and find your
                        perfect stay from our verified hotel collection.
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400 font-['IBM_Plex_Mono'] uppercase tracking-wider">
                    <Building2 size={13} />
                    Based on available stays
                </div>

            </div>


            {/* ================= CITY CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {citiesList.map((destination) => (

                    <button
                        key={`${destination.name}-${destination.state}`}
                        type="button"
                        onClick={() =>
                            handleCityClick(destination.name)
                        }
                        className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 text-left bg-gray-900"
                    >

                        {/* ================= IMAGE ================= */}
                        <img
                            src={destination.image}
                            alt={`Hotels in ${destination.name}`}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src =
                                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070";
                            }}
                        />


                        {/* ================= OVERLAY ================= */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />


                        {/* ================= TOP BADGE ================= */}
                        <div className="absolute top-4 left-4">

                            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider">

                                <Building2 size={11} />

                                {destination.count}{" "}
                                {destination.count === 1
                                    ? "Property"
                                    : "Properties"}

                            </span>

                        </div>


                        {/* ================= BOTTOM CONTENT ================= */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">

                            <div className="flex items-end justify-between gap-3">

                                <div className="min-w-0">

                                    <h3 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] leading-tight truncate">
                                        {destination.name}
                                    </h3>

                                    <p className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                                        <MapPin
                                            size={11}
                                            className="text-blue-400 shrink-0"
                                        />

                                        <span className="truncate">
                                            {destination.state}
                                        </span>
                                    </p>

                                    <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-300 group-hover:text-white transition">
                                        Explore stays
                                        <ArrowRight
                                            size={12}
                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                        />
                                    </div>

                                </div>


                                {/* Arrow */}
                                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-white group-hover:text-gray-900 group-hover:scale-105">

                                    <ChevronRight size={17} />

                                </div>

                            </div>

                        </div>

                    </button>

                ))}

            </div>

        </section>
    );
};

export default PopularCity;
