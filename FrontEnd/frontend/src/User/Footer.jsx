
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Phone,
    Mail,
    ShieldCheck,
    BadgeCheck,
    Headphones,
    Building2,
    ChevronRight,
} from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";
import Logo from "../components/Logo";

const Footer = () => {
    const navigate = useNavigate();

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleNavigation = (path) => {
        navigate(path);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const scrollToHotels = () => {
        const element = document.getElementById("hotels-section");

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        } else {
            navigate("/");

            setTimeout(() => {
                const el = document.getElementById("hotels-section");

                if (el) {
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 100);
        }
    };

    const exploreLinks = [
        "Home",
        "Explore Hotels",
        "Destinations",
        "About AuraStay",
        "Help & FAQ",
        "Saved Stays",
        "My Bookings",
        "Contact Concierge",
        "Partner Sign In",
    ];

    const socialIcons = [
        FaFacebookF,
        FaInstagram,
        FaXTwitter,
        FaLinkedinIn,
    ];

    const handleExploreClick = (item) => {
        switch (item) {
            case "Home":
                scrollToTop();
                break;

            case "Explore Hotels":
                scrollToHotels();
                break;

            case "Destinations":
                handleNavigation("/popularcity");
                break;

            case "About AuraStay":
                handleNavigation("/about");
                break;

            case "Help & FAQ":
                handleNavigation("/faq");
                break;

            case "Saved Stays":
                handleNavigation("/saved-stays");
                break;

            case "My Bookings":
                handleNavigation("/myBookings");
                break;

            case "Contact Concierge":
                handleNavigation("/contact");
                break;

            case "Partner Sign In":
                handleNavigation("/login");
                break;

            default:
                break;
        }
    };

    return (
        <footer className="relative w-full overflow-hidden border-t border-[#e5e5dc] bg-[#f4f3ee] text-[#424a41]">

            <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:px-12">

                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4 lg:gap-8">

                    {/* Brand */}
                    <div className="flex flex-col">

                        <div className="mb-5 block w-fit">
                            <Logo to="/" imgHeight="h-14 sm:h-16" />
                        </div>

                        <p className="max-w-sm text-[13px] leading-7 text-[#777b73]">
                            Discover handpicked hotels, premium stays, and
                            unforgettable travel experiences across India.
                            Elevate your journey with AuraStays.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2.5">

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4d9] bg-[#eaf0e8] px-3 py-2 text-[10px] font-semibold text-[#58745e]">
                                <BadgeCheck size={14} />
                                Verified stays
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4d9] bg-[#eaf0e8] px-3 py-2 text-[10px] font-semibold text-[#58745e]">
                                <ShieldCheck size={14} />
                                Secure booking
                            </span>

                        </div>
                    </div>

                    {/* Explore */}
                    <div>

                        <h3 className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#29352c] sm:mb-6">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#718b70]" />
                            Explore
                        </h3>

                        <ul className="space-y-4">

                            {exploreLinks.map((item) => (
                                <li key={item}>
                                    <button
                                        type="button"
                                        onClick={() => handleExploreClick(item)}
                                        className="group flex items-center text-left text-[13px] font-medium text-[#777b73] transition-colors duration-200 hover:text-[#58745e] focus-visible:outline-none focus-visible:text-[#58745e]"
                                    >
                                        <ChevronRight
                                            size={14}
                                            className="-ml-4 mr-1.5 shrink-0 text-[#64806a] opacity-0 transition-all duration-200 group-hover:ml-0 group-hover:opacity-100"
                                        />

                                        <span>{item}</span>
                                    </button>
                                </li>
                            ))}

                        </ul>
                    </div>

                    {/* Partners */}
                    <div>

                        <h3 className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#29352c] sm:mb-6">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#718b70]" />
                            For partners
                        </h3>

                        <div className="group relative overflow-hidden rounded-[20px] border border-[#dce3d8] bg-[#eaf0e8] p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(35,45,37,0.08)] sm:p-6">

                            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border border-[#cbd8c8]/60" />

                            <div className="relative flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#526d57] text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                                    <Building2 size={19} strokeWidth={1.7} />
                                </div>

                                <div className="min-w-0">

                                    <h4 className="text-[14px] font-semibold text-[#29352c]">
                                        List your property
                                    </h4>

                                    <p className="mt-1.5 text-[11px] leading-5 text-[#737c70]">
                                        Grow your reach and connect with travelers
                                        looking for premium stays.
                                    </p>

                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleNavigation("/adminSignup")}
                                className="relative mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#293b30] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white shadow-sm transition duration-300 hover:bg-[#526d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64806a] focus-visible:ring-offset-2"
                            >
                                Become a partner
                                <ChevronRight size={14} />
                            </button>

                        </div>
                    </div>

                    {/* Contact */}
                    <div>

                        <h3 className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#29352c] sm:mb-6">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#718b70]" />
                            Contact desk
                        </h3>

                        <div className="space-y-4">

                            <div className="flex items-center gap-3">

                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dce4d9] bg-[#eaf0e8] text-[#58745e]">
                                    <MapPin size={15} />
                                </span>

                                <p className="text-[12px] font-medium text-[#687066]">
                                    Jaipur, Rajasthan, India
                                </p>

                            </div>

                            <a
                                href="tel:+919876543210"
                                className="group flex min-w-0 items-center gap-3 focus-visible:outline-none"
                            >

                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dce4d9] bg-[#eaf0e8] text-[#58745e] transition-colors group-hover:bg-[#526d57] group-hover:text-white">
                                    <Phone size={15} />
                                </span>

                                <span className="truncate text-[12px] font-medium text-[#687066] transition-colors group-hover:text-[#526d57]">
                                    +91 98765 43210
                                </span>

                            </a>

                            <a
                                href="mailto:support@aurastays.com"
                                className="group flex min-w-0 items-center gap-3 focus-visible:outline-none"
                            >

                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dce4d9] bg-[#eaf0e8] text-[#58745e] transition-colors group-hover:bg-[#526d57] group-hover:text-white">
                                    <Mail size={15} />
                                </span>

                                <span className="break-all text-[12px] font-medium text-[#687066] transition-colors group-hover:text-[#526d57]">
                                    onboarding@resend.dev
                                </span>

                            </a>

                            <div className="flex items-center gap-3">

                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dce4d9] bg-[#eaf0e8] text-[#58745e]">
                                    <Headphones size={15} />
                                </span>

                                <p className="text-[12px] font-medium text-[#687066]">
                                    24/7 Booking Assistance
                                </p>

                            </div>

                        </div>

                        {/* Social links */}
                        <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7">

                            {socialIcons.map((Icon, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    aria-label={[
                                        "Facebook",
                                        "Instagram",
                                        "X",
                                        "LinkedIn",
                                    ][idx]}
                                    onClick={(e) => e.preventDefault()}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e1e2da] bg-[#faf9f6] text-[#737b70] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#526d57] hover:bg-[#526d57] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64806a]"
                                >
                                    <Icon size={14} />
                                </a>
                            ))}

                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#e5e5dc] bg-[#eeede7]">

                <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-4 py-5 sm:px-8 sm:py-6 lg:flex-row lg:justify-between lg:px-12">

                    <p className="text-center text-[11px] font-medium text-[#858980] sm:text-left sm:text-xs">

                        © {new Date().getFullYear()}{" "}

                        <span className="font-semibold tracking-wide text-[#39443a]">
                            AuraStays
                        </span>

                        . All Rights Reserved.

                    </p>

                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6">

                        {[
                            "Privacy Policy",
                            "Terms & Conditions",
                            "Refund Policy",
                            "Help Center",
                        ].map((link) => (
                            <button
                                key={link}
                                type="button"
                                className="text-center text-[10px] font-medium text-[#858980] transition-colors duration-200 hover:text-[#526d57] focus-visible:outline-none focus-visible:text-[#526d57] sm:text-[11px]"
                            >
                                {link}
                            </button>
                        ))}

                    </div>

                </div>
            </div>

        </footer>
    );
};

export default Footer;
