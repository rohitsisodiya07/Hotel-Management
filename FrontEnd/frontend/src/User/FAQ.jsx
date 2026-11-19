import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    HelpCircle,
    ChevronDown,
    Search,
    ShieldCheck,
    CreditCard,
    CalendarCheck,
    Clock,
    PhoneCall,
    Mail,
    Sparkles,
    ChevronRight,
} from "lucide-react";

const FAQ_DATA = [
    {
        category: "Bookings",
        question: "How do I make a reservation on AuraStay?",
        answer:
            "Browse our curated collection of verified hotels and suites, choose your preferred dates and guest count, select your ideal room type, and proceed to book. AuraStay holds your chosen room in real time for 5 minutes while you enter your details and complete the confirmation.",
    },
    {
        category: "Bookings",
        question: "Is my booking instantly confirmed?",
        answer:
            "Yes! Once payment or reservation details are processed, your booking is immediately confirmed. You will receive an official booking confirmation email with your booking reference code, invoice details, and check-in voucher.",
    },
    {
        category: "Bookings",
        question: "What is the 5-minute temporary room hold feature?",
        answer:
            "When you begin the reservation process, our system locks that room for 5 minutes so no other traveler can book it while you complete your details. If the timer elapses before you confirm, the hold is safely released back to inventory.",
    },
    {
        category: "Check-in",
        question: "What are standard check-in and check-out times?",
        answer:
            "Standard check-in is typically 02:00 PM and check-out is 11:00 AM. Early check-in or late check-out is subject to property availability and can be requested via our 24/7 Concierge Desk or directly with the hotel manager upon arrival.",
    },
    {
        category: "Check-in",
        question: "What documents are required during hotel check-in?",
        answer:
            "In accordance with government regulations, all adult guests must present a valid government-issued photo ID (Aadhaar Card, Passport, Voter ID, or Driving License) along with your digital AuraStay booking confirmation voucher. PAN cards are not accepted as proof of identity.",
    },
    {
        category: "Cancellations",
        question: "What is AuraStay's cancellation policy?",
        answer:
            "Free cancellation is available for most bookings up to 24 hours prior to standard check-in time. You can easily manage or cancel reservations directly from your 'My Bookings' portal. Applicable refunds are processed to your original payment method within 3 to 5 business days.",
    },
    {
        category: "Cancellations",
        question: "How do I download my booking voucher or tax invoice?",
        answer:
            "Navigate to 'My Bookings', find your confirmed reservation, and click 'View Details' or 'Download Voucher'. You can save a high-resolution PDF voucher or print an official A4 receipt with tax breakdown and hotel arrival details.",
    },
    {
        category: "Payments",
        question: "What payment methods are supported?",
        answer:
            "We support all major payment modes including UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards (Visa, Mastercard, RuPay, Amex), Net Banking across 50+ banks, and approved corporate billing cards.",
    },
    {
        category: "Payments",
        question: "How do I apply a promotional coupon code?",
        answer:
            "On the booking checkout modal, enter your valid promotional coupon code in the coupon field and click 'Apply'. The discount will instantly reflect on your total room fare before payment.",
    },
    {
        category: "Policies",
        question: "Are AuraStay properties thoroughly verified?",
        answer:
            "Every single property listed on AuraStay undergoes an in-person physical audit and background check by our hospitality curators. We verify hygiene, security measures, linen quality, and staff standards before awarding our 'Verified Stay' badge.",
    },
    {
        category: "Policies",
        question: "How can I partner and list my hotel on AuraStay?",
        answer:
            "Hoteliers and luxury villa owners can register via our 'Become a Partner' portal (/adminSignup). Our property verification team will inspect your premises and approve your portal within 24 to 48 business hours.",
    },
];

const CATEGORIES = ["All", "Bookings", "Check-in", "Cancellations", "Payments", "Policies"];

const FAQ = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [openIndex, setOpenIndex] = useState(0); // first item open by default

    const filteredFaqs = useMemo(() => {
        return FAQ_DATA.filter((item) => {
            const matchesCategory =
                selectedCategory === "All" || item.category === selectedCategory;
            const query = searchQuery.toLowerCase().trim();
            const matchesQuery =
                !query ||
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query);
            return matchesCategory && matchesQuery;
        });
    }, [selectedCategory, searchQuery]);

    const toggleAccordion = (idx) => {
        setOpenIndex((prev) => (prev === idx ? null : idx));
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] pt-24 pb-20 sm:pt-28 px-4 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1100px]">
                {/* Breadcrumbs */}
                <div className="mb-6 flex items-center gap-2 text-xs font-medium text-[#738477]">
                    <Link to="/" className="hover:text-[#252b26] transition-colors">Home</Link>
                    <ChevronRight size={13} />
                    <span className="text-[#252b26] font-semibold">Help & FAQ</span>
                </div>

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#3d5945] bg-[#eef3ec] px-4 py-1.5 rounded-full border border-[#dce5d9]">
                        <HelpCircle size={13} />
                        Frequently Asked Questions
                    </span>
                    <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1c241e] mt-2">
                        How can we <span className="italic text-[#4a6b53]">help you?</span>
                    </h1>
                    <p className="mt-3 text-sm text-[#697268] leading-relaxed">
                        Find swift answers about reservations, check-in requirements, cancellation guarantees, and luxury hospitality amenities.
                    </p>

                    {/* Search Bar */}
                    <div className="relative mt-7 max-w-lg mx-auto">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search questions (e.g., check-in, cancel, refund)..."
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#dde3d7] rounded-2xl text-sm text-[#252b26] placeholder-gray-400 focus:outline-none focus:border-[#3d5945] focus:ring-2 focus:ring-[#3d5945]/10 shadow-xs transition"
                        />
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                selectedCategory === cat
                                    ? "bg-[#1f3b2c] text-white shadow-sm"
                                    : "bg-white text-[#526354] border border-[#e0e5dc] hover:bg-[#f1f5ee]"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3.5 mb-14">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-14 bg-white rounded-2xl border border-[#e4e8e0] p-6">
                            <p className="text-base font-semibold text-gray-700">No matching questions found</p>
                            <p className="text-xs text-gray-500 mt-1">Try another keyword or contact our concierge desk directly.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                className="mt-4 text-xs font-bold text-[#3d5945] underline uppercase tracking-wider cursor-pointer"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        filteredFaqs.map((faq, idx) => {
                            const isOpen = openIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                        isOpen
                                            ? "border-[#3d5945]/40 bg-white shadow-md"
                                            : "border-[#e5e9e0] bg-white hover:border-[#ccd4c6]"
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleAccordion(idx)}
                                        className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#486b51] bg-[#eef3ec] px-2.5 py-1 rounded-md shrink-0">
                                                {faq.category}
                                            </span>
                                            <span className="font-semibold text-[#1c241e] text-sm sm:text-base leading-snug">
                                                {faq.question}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            size={18}
                                            className={`text-[#486b51] shrink-0 transition-transform duration-300 ${
                                                isOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-sm text-[#5d6b5e] leading-relaxed border-t border-[#f0f3ed]">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Concierge Help Box */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12281d] via-[#1a3829] to-[#254b38] p-8 sm:p-10 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="max-w-xl">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-300 backdrop-blur-md">
                                <Sparkles size={12} />
                                24/7 Dedicated Concierge
                            </span>
                            <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-bold mt-2.5">
                                Still have specific questions about your stay?
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
                                Our private guest relations desk is on standby round the clock to curate custom requests, transfers, or special arrangements.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                            <Link
                                to="/contact"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#1a3829] transition hover:bg-amber-100 shadow-md cursor-pointer"
                            >
                                <Mail size={14} />
                                Contact Desk
                            </Link>
                            <a
                                href="tel:+919876543210"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/20 backdrop-blur-md"
                            >
                                <PhoneCall size={14} />
                                +91 98765 43210
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
