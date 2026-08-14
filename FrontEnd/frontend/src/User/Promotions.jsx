import React, { useState } from "react";
import {
    Sparkles,
    ArrowRight,
    Percent,
    Copy,
    Check,
} from "lucide-react";

const Promotions = () => {
    const [copied, setCopied] = useState(false);

    const copyCoupon = async () => {
        try {
            await navigator.clipboard.writeText("AURA20");
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.log("Copy failed:", error);
        }
    };

    return (
        <section className="max-w-[1600px] mx-auto px-6 sm:px-12 py-16">

            {/* ================= HEADER ================= */}
            <div className="text-center max-w-2xl mx-auto mb-10">

                <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest font-['IBM_Plex_Mono'] mb-3">
                    <Sparkles size={12} />
                    Exclusive Deals
                </span>

                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Space_Grotesk'] tracking-tight">
                    Special Offers & Packages
                </h2>

                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    Unlock incredible savings and exclusive perks on your next
                    luxury getaway with AuraStays.
                </p>

            </div>


            {/* ================= OFFER CARDS ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ================= OFFER 1 ================= */}
                <div className="relative group rounded-3xl overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white p-7 sm:p-10 shadow-xl border border-gray-800 transition-all duration-500 hover:shadow-2xl">

                    {/* Background Image */}
                    <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
                        <img
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800"
                            alt=""
                            className="w-96 h-96 object-cover rounded-full blur-sm"
                        />
                    </div>

                    <div className="relative z-10">

                        {/* Badge + Code */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">

                            <span className="bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-['IBM_Plex_Mono'] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 backdrop-blur-md">
                                <Percent size={12} />
                                Limited Time
                            </span>

                            <button
                                onClick={copyCoupon}
                                className="group/code flex items-center gap-2 text-xs font-['IBM_Plex_Mono'] text-blue-300 font-bold tracking-wider uppercase bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg transition cursor-pointer"
                            >
                                <span>AURA20</span>

                                {copied ? (
                                    <Check
                                        size={13}
                                        className="text-green-400"
                                    />
                                ) : (
                                    <Copy
                                        size={13}
                                        className="opacity-70 group-hover/code:opacity-100"
                                    />
                                )}
                            </button>

                        </div>


                        {/* Content */}
                        <div>

                            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-2">
                                Save More on Luxury Stays
                            </p>

                            <h3 className="text-2xl sm:text-4xl font-bold font-['Space_Grotesk'] leading-[1.12] mb-4 max-w-xl">
                                Flat 20% Off on Luxury Resorts
                            </h3>

                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-lg">
                                Enjoy premium stays, exceptional hospitality,
                                and unforgettable experiences at selected
                                luxury resorts.
                            </p>

                        </div>


                        {/* Bottom */}
                        <div className="relative z-10 mt-10 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                            <div>
                                <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono'] uppercase tracking-wider">
                                    Use code
                                </p>

                                <p className="text-xs text-gray-200 font-semibold mt-1">
                                    AURA20 · Selected resorts
                                </p>
                            </div>

                            <a
                                href="#hotels-section"
                                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shadow-md group-hover:translate-x-1"
                            >
                                View Eligible Stays
                                <ArrowRight size={14} />
                            </a>

                        </div>

                    </div>
                </div>


                {/* ================= OFFER 2 ================= */}
                <div className="relative group rounded-3xl overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-900 to-gray-950 text-white p-7 sm:p-10 shadow-xl border border-blue-900/50 transition-all duration-500 hover:shadow-2xl">

                    {/* Background Image */}
                    <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
                        <img
                            src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800"
                            alt=""
                            className="w-96 h-96 object-cover rounded-full blur-sm"
                        />
                    </div>

                    <div className="relative z-10">

                        {/* Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">

                            <span className="bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[10px] font-['IBM_Plex_Mono'] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 backdrop-blur-md">
                                <Sparkles size={12} />
                                Weekend Special
                            </span>

                            <span className="text-xs font-['IBM_Plex_Mono'] text-amber-300 font-bold tracking-wider uppercase bg-white/10 px-3 py-2 rounded-lg">
                                3+ Nights
                            </span>

                        </div>


                        {/* Content */}
                        <div>

                            <p className="text-[10px] text-amber-300 font-bold uppercase tracking-widest mb-2">
                                Complimentary Experiences
                            </p>

                            <h3 className="text-2xl sm:text-4xl font-bold font-['Space_Grotesk'] leading-[1.12] mb-4 max-w-xl">
                                Free Spa & Fine Dining Perks
                            </h3>

                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-lg">
                                Make your extended stay even better with
                                complimentary breakfast, wellness sessions,
                                and selected dining privileges.
                            </p>

                        </div>


                        {/* Bottom */}
                        <div className="relative z-10 mt-10 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                            <div>
                                <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono'] uppercase tracking-wider">
                                    Eligibility
                                </p>

                                <p className="text-xs text-gray-200 font-semibold mt-1">
                                    Minimum 3-night stay
                                </p>
                            </div>

                            <a
                                href="#hotels-section"
                                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shadow-md group-hover:translate-x-1"
                            >
                                Explore Stays
                                <ArrowRight size={14} />
                            </a>

                        </div>

                    </div>
                </div>

            </div>

        </section>
    );
};

export default Promotions;
