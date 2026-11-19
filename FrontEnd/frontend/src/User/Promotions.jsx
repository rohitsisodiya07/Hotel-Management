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
        <section className="w-full overflow-hidden bg-[#f4f3ee] px-4 py-14 sm:px-8 sm:py-16 lg:px-12">
            <div className="mx-auto max-w-[1440px]">
                {/* Section heading */}
                <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-11">
                    <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dce4d9] bg-[#eaf0e8] px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-[#58745e] sm:text-[10px]">
                        <Sparkles size={12} strokeWidth={1.8} />
                        Exclusive offers
                    </span>

                    <h2 className="font-['Cormorant_Garamond'] text-[36px] font-semibold leading-[1.05] tracking-tight text-[#252b26] sm:text-4xl lg:text-[46px]">
                        A little more to <span className="italic text-[#64806a]">enjoy</span>
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-[#777b73] sm:text-sm">
                        Thoughtful extras and special savings to make your next
                        AuraStays getaway even more memorable.
                    </p>
                </div>

                {/* Offer cards */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
                    {/* Offer 1 */}
                    <article className="group relative isolate flex min-h-[390px] flex-col overflow-hidden rounded-[22px] bg-[#26382d] p-5 text-white shadow-[0_8px_28px_rgba(35,45,37,0.10)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(35,45,37,0.18)] sm:min-h-[410px] sm:rounded-[26px] sm:p-8 lg:p-9">
                        <img
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200"
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25 transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1c3024]/95 via-[#26382d]/90 to-[#354b3a]/85" />
                        <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80" />
                        <div className="pointer-events-none absolute -right-10 -top-14 -z-10 h-44 w-44 rounded-full border border-white/10 sm:h-60 sm:w-60" />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c6d6c0]/25 bg-white/10 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#dce9d7] backdrop-blur-md sm:text-[10px]">
                                <Percent size={12} />
                                Limited time
                            </span>

                            <button
                                type="button"
                                onClick={copyCoupon}
                                aria-label={copied ? "Coupon code copied" : "Copy coupon code AURA20"}
                                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-semibold tracking-[0.13em] text-white transition hover:border-white/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:text-xs"
                            >
                                <span>AURA20</span>
                                {copied ? (
                                    <Check size={14} className="text-[#c7dfbd]" />
                                ) : (
                                    <Copy size={13} className="text-white/70" />
                                )}
                                <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
                            </button>
                        </div>

                        <div className="mt-9 max-w-xl sm:mt-11">
                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-[#c5d6bd] sm:text-[10px]">
                                Save more on luxury stays
                            </p>

                            <h3 className="max-w-lg font-['Cormorant_Garamond'] text-[34px] font-semibold leading-[0.98] tracking-tight text-white sm:text-[42px] lg:text-[46px]">
                                Flat 20% Off on Luxury Resorts
                            </h3>

                            <p className="mt-4 max-w-md text-[12px] leading-6 text-white/70 sm:text-sm sm:leading-7">
                                Enjoy premium stays, exceptional hospitality,
                                and unforgettable experiences at selected
                                luxury resorts.
                            </p>
                        </div>

                        <div className="mt-auto flex flex-col gap-4 border-t border-white/15 pt-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                            <div>
                                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/50">
                                    Use code
                                </p>
                                <p className="mt-1 text-xs font-semibold text-white/90 sm:text-sm">
                                    AURA20 <span className="px-1 text-white/35">·</span> Selected resorts
                                </p>
                            </div>

                            <a
                                href="#hotels-section"
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f4f3ee] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#26382d] shadow-sm transition duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#26382d] sm:w-auto sm:text-[10px]"
                            >
                                View eligible stays
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>
                    </article>

                    {/* Offer 2 */}
                    <article className="group relative isolate flex min-h-[390px] flex-col overflow-hidden rounded-[22px] bg-[#34463a] p-5 text-white shadow-[0_8px_28px_rgba(35,45,37,0.10)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(35,45,37,0.18)] sm:min-h-[410px] sm:rounded-[26px] sm:p-8 lg:p-9">
                        <img
                            src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200"
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25 transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#26372d]/95 via-[#34463a]/90 to-[#53634d]/85" />
                        <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80" />
                        <div className="pointer-events-none absolute -right-10 -top-14 -z-10 h-44 w-44 rounded-full border border-white/10 sm:h-60 sm:w-60" />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8dfc8]/25 bg-white/10 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#e5e8d6] backdrop-blur-md sm:text-[10px]">
                                <Sparkles size={12} />
                                Weekend special
                            </span>

                            <span className="inline-flex min-h-10 items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-semibold tracking-[0.13em] text-white/90 sm:text-xs">
                                3+ NIGHTS
                            </span>
                        </div>

                        <div className="mt-9 max-w-xl sm:mt-11">
                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-[#d6dfc5] sm:text-[10px]">
                                Complimentary experiences
                            </p>

                            <h3 className="max-w-lg font-['Cormorant_Garamond'] text-[34px] font-semibold leading-[0.98] tracking-tight text-white sm:text-[42px] lg:text-[46px]">
                                Free Spa & Fine Dining Perks
                            </h3>

                            <p className="mt-4 max-w-md text-[12px] leading-6 text-white/70 sm:text-sm sm:leading-7">
                                Make your extended stay even better with
                                complimentary breakfast, wellness sessions,
                                and selected dining privileges.
                            </p>
                        </div>

                        <div className="mt-auto flex flex-col gap-4 border-t border-white/15 pt-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                            <div>
                                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/50">
                                    Eligibility
                                </p>
                                <p className="mt-1 text-xs font-semibold text-white/90 sm:text-sm">
                                    Minimum 3-night stay
                                </p>
                            </div>

                            <a
                                href="#hotels-section"
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f4f3ee] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#26382d] shadow-sm transition duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#34463a] sm:w-auto sm:text-[10px]"
                            >
                                Explore stays
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default Promotions;
