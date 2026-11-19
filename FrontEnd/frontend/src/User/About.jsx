import React from "react";
import { Link } from "react-router-dom";
import {
    ShieldCheck,
    Sparkles,
    Building2,
    Compass,
    HeartHandshake,
    Award,
    CheckCircle2,
    ArrowRight,
    ChevronRight,
    Star,
} from "lucide-react";

const STATS = [
    { label: "Handpicked Stays", value: "500+" },
    { label: "Verified Heritage Sites", value: "120+" },
    { label: "Guest Satisfaction", value: "99.4%" },
    { label: "Concierge Assistance", value: "24/7" },
];

const PILLARS = [
    {
        icon: ShieldCheck,
        title: "Physically Verified Properties",
        description:
            "Every single villa, palace, and boutique hotel listed on AuraStay undergoes an in-person physical audit for hygiene, linen standards, safety protocols, and scenic integrity.",
    },
    {
        icon: Sparkles,
        title: "Curated Luxury Experiences",
        description:
            "From royal havelis in Rajasthan to misty coffee estate cottages in Coorg, our stays offer architectural charm, authentic local cuisine, and mindful relaxation.",
    },
    {
        icon: ClockPillar,
        title: "Guaranteed Room Hold Technology",
        description:
            "Our patented 5-minute inventory hold ensures your selected room cannot be intercepted by another guest while you review dates and complete your payment.",
    },
    {
        icon: HeartHandshake,
        title: "Dedicated Guest Concierge",
        description:
            "Direct access to human hospitality specialists before, during, and after your stay. We manage custom dining requests, transfers, and special celebration setups.",
    },
];

function ClockPillar(props) {
    return <Award {...props} />;
}

const About = () => {
    return (
        <div className="min-h-screen bg-[#faf9f6] pt-24 pb-20 sm:pt-28 px-4 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1300px]">
                {/* Breadcrumbs */}
                <div className="mb-6 flex items-center gap-2 text-xs font-medium text-[#738477]">
                    <Link to="/" className="hover:text-[#252b26] transition-colors">Home</Link>
                    <ChevronRight size={13} />
                    <span className="text-[#252b26] font-semibold">About AuraStay</span>
                </div>

                {/* Hero section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20">
                    <div>
                        <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#3d5945] bg-[#eef3ec] px-4 py-1.5 rounded-full border border-[#dce5d9]">
                            <Sparkles size={13} className="text-amber-500" />
                            The AuraStay Heritage
                        </span>

                        <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#17231a] leading-[1.08]">
                            Curating sanctuaries of <span className="italic text-[#4a6b53]">grace, heritage & rest.</span>
                        </h1>

                        <p className="mt-5 text-sm sm:text-base text-[#616f63] leading-relaxed">
                            AuraStay was founded with a singular conviction: travel should be more than standard hotel rooms. It should be a transformative immersion into architectural beauty, genuine Indian hospitality, and serene retreat.
                        </p>

                        <p className="mt-3 text-sm text-[#748275] leading-relaxed">
                            We bridge discerning travelers with India’s finest independent boutique resorts, royal heritage havelis, and quiet hill sanctuaries — each backed by transparent pricing, real verified reviews, and around-the-clock human care.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4 items-center">
                            <Link
                                to="/#hotels-section"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#1c3a2b] hover:bg-[#284f3c] text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:-translate-y-0.5"
                            >
                                <Compass size={15} />
                                Explore Stays
                                <ArrowRight size={14} />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 rounded-xl border border-[#d1dacd] bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#2e4738] hover:bg-[#f2f6ef] transition"
                            >
                                Contact Concierge
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1400"
                                alt="Luxury Resort Interior"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-[#e1e7dc] shadow-xl max-w-xs hidden sm:block">
                            <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-xs font-bold text-[#1e2a21]">"Unparalleled luxury and attention to detail."</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Verified Guest Review</p>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white border border-[#e5eae0] rounded-3xl p-6 sm:p-8 shadow-xs mb-20 text-center">
                    {STATS.map((s, idx) => (
                        <div key={idx} className="p-3">
                            <p className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#203a2c]">
                                {s.value}
                            </p>
                            <p className="text-xs uppercase font-bold tracking-widest text-[#728274] mt-2">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Core Pillars */}
                <div className="mb-20">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#3d5945]">
                            The AuraStay Standard
                        </span>
                        <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-bold text-[#1b251d] mt-2">
                            Built upon uncompromising hospitality
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PILLARS.map((pillar, idx) => {
                            const Icon = pillar.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e2e7dc] shadow-xs hover:shadow-md transition-shadow"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-[#edf3ea] border border-[#d3ded0] flex items-center justify-center text-[#2b4c37] mb-5">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#1c261e]">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-sm text-[#667568] leading-relaxed mt-2.5">
                                        {pillar.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Partner Banner */}
                <div className="rounded-3xl bg-[#14291e] text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
                    <div className="max-w-2xl mx-auto relative z-10">
                        <Building2 size={36} className="mx-auto text-amber-300 mb-4" />
                        <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-bold">
                            Are you a luxury property owner or boutique hotelier?
                        </h2>
                        <p className="mt-3 text-sm text-white/80 leading-relaxed">
                            Join our prestigious network of independent hoteliers and reach travelers looking for authentic, high-value experiences across India.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-4">
                            <Link
                                to="/adminSignup"
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#14291e] px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition shadow-md"
                            >
                                Become a Partner
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
