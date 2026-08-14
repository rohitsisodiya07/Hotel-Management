import React from "react";
import { Star, Quote, BadgeCheck } from "lucide-react";

const customerReviews = [
    {
        name: "Aarav Sharma",
        location: "Jaipur, Rajasthan",
        comment:
            "AuraStays made our family vacation incredibly smooth. Finding verified luxury resorts and booking our stay was completely hassle-free.",
        rating: 5,
        image:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    },
    {
        name: "Priya Verma",
        location: "Mumbai, Maharashtra",
        comment:
            "The experience was smooth from start to finish. I could easily find highly-rated stays with the amenities I wanted within my budget.",
        rating: 5,
        image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    },
    {
        name: "Rohan Malhotra",
        location: "New Delhi",
        comment:
            "Great experience with transparent pricing and no unnecessary surprises. The hotel selection and booking process were excellent.",
        rating: 5,
        image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
    },
];

const Testimonials = () => {
    return (
        <section className="max-w-[1600px] mx-auto px-6 sm:px-12 py-16">

            {/* ================= HEADER ================= */}
            <div className="text-center max-w-2xl mx-auto mb-10">

                <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest font-['IBM_Plex_Mono'] mb-3">
                    <Quote size={12} />
                    Guest Experiences
                </span>

                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Space_Grotesk'] tracking-tight">
                    What Our Customers Say
                </h2>

                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    Real experiences from travelers who discovered their
                    perfect stay with AuraStays.
                </p>

            </div>


            {/* ================= REVIEW CARDS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

                {customerReviews.map((rev, idx) => (

                    <div
                        key={idx}
                        className="relative bg-white border border-gray-200 p-7 sm:p-8 rounded-3xl flex flex-col min-h-[300px] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                    >

                        {/* Quote Icon */}
                        <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Quote
                                size={20}
                                className="text-blue-200"
                            />
                        </div>


                        {/* Review */}
                        <div className="flex-1">

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-5">

                                <div className="flex items-center gap-0.5">
                                    {[...Array(rev.rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill="currentColor"
                                            className="text-yellow-400"
                                        />
                                    ))}
                                </div>

                                <span className="text-[11px] font-bold text-gray-700">
                                    {rev.rating}.0
                                </span>

                            </div>


                            {/* Comment */}
                            <p className="text-sm text-gray-700 leading-7 font-medium pr-5">
                                "{rev.comment}"
                            </p>

                        </div>


                        {/* Customer */}
                        <div className="flex items-center justify-between gap-3 pt-5 mt-6 border-t border-gray-100">

                            <div className="flex items-center gap-3">

                                <img
                                    src={rev.image}
                                    alt={`${rev.name} profile`}
                                    className="w-11 h-11 rounded-full object-cover shadow-sm border border-gray-100"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src =
                                            "https://ui-avatars.com/api/?name=" +
                                            encodeURIComponent(rev.name) +
                                            "&background=eef2ff&color=2563eb";
                                    }}
                                />

                                <div>
                                    <div className="flex items-center gap-1">

                                        <h4 className="text-xs font-bold text-gray-900 font-['Space_Grotesk']">
                                            {rev.name}
                                        </h4>

                                        <BadgeCheck
                                            size={13}
                                            className="text-blue-500"
                                        />

                                    </div>

                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                        {rev.location}
                                    </p>
                                </div>

                            </div>

                            <span className="hidden sm:block text-[9px] text-gray-400 font-['IBM_Plex_Mono'] uppercase tracking-wider">
                                Guest
                            </span>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
};

export default Testimonials;

