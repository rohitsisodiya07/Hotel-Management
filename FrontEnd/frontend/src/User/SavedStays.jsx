import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSavedStays, toggleSaveStay, clearSavedStays } from "../utils/wishlist";
import {
    Heart,
    MapPin,
    Star,
    Trash2,
    ArrowRight,
    Building2,
    Sparkles,
    Search,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

const SavedStays = () => {
    const navigate = useNavigate();
    const [savedList, setSavedList] = useState([]);

    const loadSaved = () => {
        setSavedList(getSavedStays());
    };

    useEffect(() => {
        loadSaved();
        const handler = () => loadSaved();
        window.addEventListener("aurastay_wishlist_updated", handler);
        return () => window.removeEventListener("aurastay_wishlist_updated", handler);
    }, []);

    const handleRemove = (hotel, e) => {
        e.stopPropagation();
        toggleSaveStay(hotel);
        toast.success(`Removed "${hotel.hotelName}" from Saved Stays`);
        loadSaved();
    };

    const handleClearAll = async () => {
        const res = await Swal.fire({
            title: "Clear all saved stays?",
            text: "Are you sure you want to remove all properties from your wishlist?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, clear all",
            cancelButtonText: "Keep them",
            confirmButtonColor: "#173D31",
            cancelButtonColor: "#718575",
        });

        if (res.isConfirmed) {
            clearSavedStays();
            toast.success("Wishlist cleared");
            loadSaved();
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] pt-24 pb-20 sm:pt-28 px-4 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1440px]">
                {/* Breadcrumbs */}
                <div className="mb-6 flex items-center gap-2 text-xs font-medium text-[#738477]">
                    <Link to="/" className="hover:text-[#252b26] transition-colors">Home</Link>
                    <ChevronRight size={13} />
                    <span className="text-[#252b26] font-semibold">Saved Stays</span>
                </div>

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#e6e9e3] pb-6">
                    <div>
                        <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3d5945] sm:text-[11px]">
                            <Heart size={13} className="text-rose-500 fill-rose-500" />
                            Your Curated Collection
                        </span>
                        <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1c241e]">
                            Saved <span className="italic text-[#4a6b53]">Stays</span>
                        </h1>
                        <p className="mt-2 text-sm text-[#697268] max-w-xl">
                            All your dream sanctuaries, luxury villas, and heritage retreats saved in one place for effortless booking.
                        </p>
                    </div>

                    {savedList.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-[#526354] bg-[#edf2ea] px-3.5 py-1.5 rounded-full border border-[#d6ded2]">
                                {savedList.length} {savedList.length === 1 ? "Property" : "Properties"} Saved
                            </span>
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                            >
                                <Trash2 size={13} />
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {savedList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white border border-[#e8ece4] shadow-xs my-8 max-w-2xl mx-auto">
                        <div className="w-16 h-16 rounded-full bg-[#f2f6f0] border border-[#d9e4d5] flex items-center justify-center text-[#405D4B] mb-5 shadow-xs">
                            <Heart size={28} className="text-[#597561]" />
                        </div>
                        <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-bold text-[#232d25]">
                            Your wishlist is empty
                        </h3>
                        <p className="mt-2 text-sm text-[#738275] max-w-md leading-relaxed">
                            Explore our handpicked collection of luxury stays and tap the heart icon on any property to save it here for later.
                        </p>
                        <Link
                            to="/#hotels-section"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1c3a2b] hover:bg-[#284f3c] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:-translate-y-0.5"
                        >
                            <Search size={15} />
                            Explore Properties
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {savedList.map((hotel) => {
                            const hotelImg =
                                hotel.hotelImages && hotel.hotelImages.length > 0
                                    ? hotel.hotelImages[0]
                                    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200";

                            const cityName =
                                hotel.city?.cityName || (typeof hotel.city === "string" ? hotel.city : "");
                            const stateName =
                                hotel.city?.districtId?.stateId?.stateName ||
                                (typeof hotel.state === "string" ? hotel.state : "");

                            return (
                                <div
                                    key={hotel._id}
                                    onClick={() => navigate(`/hotel-details/${hotel._id}`)}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-[#e3e8de] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                        <img
                                            src={hotelImg}
                                            alt={hotel.hotelName}
                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src =
                                                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200";
                                            }}
                                        />

                                        {/* Remove Heart Button */}
                                        <button
                                            type="button"
                                            title="Remove from saved"
                                            onClick={(e) => handleRemove(hotel, e)}
                                            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-md backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white"
                                        >
                                            <Heart size={16} className="fill-rose-500 hover:fill-white" />
                                        </button>

                                        {/* Property Type Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#1c2c22]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                                                <Building2 size={11} />
                                                {hotel.hotelType || "Hotel"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col justify-between p-5">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#536d59]">
                                                    <MapPin size={13} />
                                                    {cityName ? `${cityName}${stateName ? `, ${stateName}` : ""}` : "India"}
                                                </span>

                                                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                    {hotel.rating || 4.8}
                                                </span>
                                            </div>

                                            <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#1f2821] group-hover:text-[#385541] transition-colors line-clamp-1">
                                                {hotel.hotelName}
                                            </h3>

                                            {hotel.address && (
                                                <p className="mt-1 text-xs text-[#7c887e] line-clamp-1">
                                                    {hotel.address}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-5 flex items-center justify-between border-t border-[#edf0ea] pt-3.5">
                                            <div>
                                                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8b998d]">
                                                    Starting from
                                                </span>
                                                <p className="text-base font-bold text-[#1f2c22]">
                                                    ₹{Number(hotel.price).toLocaleString("en-IN")}{" "}
                                                    <span className="text-xs font-normal text-gray-400">/ night</span>
                                                </p>
                                            </div>

                                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#234232] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-white group-hover:bg-[#325e47] transition-colors">
                                                View
                                                <ArrowRight size={13} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedStays;
