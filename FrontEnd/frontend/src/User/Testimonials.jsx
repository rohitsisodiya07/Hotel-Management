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
        <section className="w-full overflow-hidden bg-[#faf9f6] px-4 py-14 sm:px-8 sm:py-16 lg:px-12">
            <div className="mx-auto max-w-[1440px]">
                {/* Section heading */}
                <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-11">
                    <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dce4d9] bg-[#eaf0e8] px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-[#58745e] sm:text-[10px]">
                        <Quote size={12} strokeWidth={1.8} />
                        Guest experiences
                    </span>

                    <h2 className="font-['Cormorant_Garamond'] text-[36px] font-semibold leading-[1.05] tracking-tight text-[#252b26] sm:text-4xl lg:text-[46px]">
                        Stories from our <span className="italic text-[#64806a]">guests</span>
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-[#777b73] sm:text-sm">
                        Hear from travelers who found their perfect place to
                        pause, unwind and make lasting memories with AuraStays.
                    </p>
                </div>

                {/* Review cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                    {customerReviews.map((rev, idx) => (
                        <article
                            key={idx}
                            className="group relative flex min-h-[300px] flex-col rounded-[20px] border border-[#e9e7e1] bg-white p-5 shadow-[0_4px_18px_rgba(35,45,37,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#d8e0d5] hover:shadow-[0_14px_30px_rgba(35,45,37,0.09)] sm:min-h-[320px] sm:rounded-[22px] sm:p-7"
                        >
                            {/* Decorative quote */}
                            <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2eb] text-[#8da18a] transition-colors group-hover:bg-[#e4ebe1] sm:right-6 sm:top-6 sm:h-10 sm:w-10">
                                <Quote size={18} strokeWidth={1.7} />
                            </div>

                            <div className="flex-1">
                                {/* Rating */}
                                <div
                                    className="mb-5 flex items-center gap-2 pr-12"
                                    aria-label={`${rev.rating} out of 5 stars`}
                                >
                                    <div className="flex items-center gap-0.5 text-[#b18b4b]">
                                        {[...Array(rev.rating)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={13}
                                                fill="currentColor"
                                                strokeWidth={1.4}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[11px] font-semibold tabular-nums text-[#62685f]">
                                        {rev.rating.toFixed(1)}
                                    </span>
                                </div>

                                {/* Review text */}
                                <p className="max-w-[38rem] text-[13px] font-medium leading-7 text-[#555d54] sm:text-sm sm:leading-[1.9]">
                                    “{rev.comment}”
                                </p>
                            </div>

                            {/* Guest details */}
                            <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#eeede8] pt-5 sm:mt-8">
                                <div className="flex min-w-0 items-center gap-3">
                                    <img
                                        src={rev.image}
                                        alt={`${rev.name} profile`}
                                        loading="lazy"
                                        className="h-11 w-11 shrink-0 rounded-full border border-[#e9e7e1] object-cover shadow-sm sm:h-12 sm:w-12"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src =
                                                "https://ui-avatars.com/api/?name=" +
                                                encodeURIComponent(rev.name) +
                                                "&background=eaf0e8&color=58745e";
                                        }}
                                    />

                                    <div className="min-w-0">
                                        <div className="flex min-w-0 items-center gap-1.5">
                                            <h4 className="truncate text-xs font-semibold text-[#29332b] sm:text-[13px]">
                                                {rev.name}
                                            </h4>
                                            <BadgeCheck
                                                size={14}
                                                className="shrink-0 text-[#6d8b70]"
                                                aria-label="Verified guest"
                                            />
                                        </div>

                                        <p className="mt-1 truncate text-[10px] font-medium text-[#92968e] sm:text-[11px]">
                                            {rev.location}
                                        </p>
                                    </div>
                                </div>

                                <span className="hidden shrink-0 text-[9px] font-medium uppercase tracking-[0.16em] text-[#a0a49b] min-[380px]:block">
                                    Guest
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
