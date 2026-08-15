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
    ChevronRight
} from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";
import logo from '../assets/logo.png';

const Footer = () => {
    const navigate = useNavigate();
    const [logoError, setLogoError] = useState(false); // Image error tracking state

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
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    };

    return (
        <footer className="bg-white border-t border-gray-200 text-gray-800 font-['Inter',sans-serif] relative overflow-hidden">
            {/* ================= MAIN FOOTER ================= */}
            <div className="max-w-[1600px] mx-auto px-6 sm:px-12 pt-16 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* ================= BRAND ================= */}
                    <div className="flex flex-col pr-4">
                        <button onClick={scrollToTop} className="block cursor-pointer group text-left mb-6 focus:outline-none">
                            {!logoError ? (
                                <img
                                    src={logo}
                                    alt="AuraStay Logo"
                                    className="h-16 sm:h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-105 origin-left brightness-0 opacity-80"
                                />
                            ) : (
                                <div className="text-3xl font-extrabold text-blue-600 tracking-tight transition-transform duration-500 group-hover:scale-105 origin-left">
                                    Aura<span className="text-gray-900">Stay</span>
                                </div>
                            )}
                        </button>

                        <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium max-w-sm">
                            Discover handpicked hotels, premium stays, and unforgettable travel experiences across India. Elevate your journey with AuraStays.
                        </p>

                        {/* TRUST INDICATORS */}
                        <div className="flex flex-wrap gap-3 mt-auto">
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-blue-700">
                                <BadgeCheck size={15} className="text-blue-600" />
                                Verified Stays
                            </span>

                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-emerald-700">
                                <ShieldCheck size={15} className="text-emerald-600" />
                                Secure Booking
                            </span>
                        </div>
                    </div>

                    {/* ================= EXPLORE ================= */}
                    <div>
                        <h3 className="text-gray-900 text-xs font-bold mb-6 uppercase tracking-widest font-['IBM_Plex_Mono'] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Explore
                        </h3>

                        <ul className="space-y-4 text-[14px] font-semibold text-gray-500">
                            {["Home", "Explore Hotels", "My Bookings", "Partner Sign In"].map((item, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => {
                                            if (item === "Home") scrollToTop();
                                            else if (item === "Explore Hotels") scrollToHotels();
                                            else if (item === "My Bookings") handleNavigation("/myBookings");
                                            else handleNavigation("/login");
                                        }}
                                        className="group flex items-center hover:text-blue-600 transition-all duration-300 cursor-pointer outline-none"
                                    >
                                        <ChevronRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 text-blue-600 transition-all duration-300 mr-1.5" />
                                        <span>{item}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ================= PARTNERS ================= */}
                    <div>
                        <h3 className="text-gray-900 text-xs font-bold mb-6 uppercase tracking-widest font-['IBM_Plex_Mono'] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            For Partners
                        </h3>

                        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-100 p-6 relative overflow-hidden group hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-bold text-gray-900 mb-1.5">List your property</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Grow your reach and connect with travelers looking for premium stays.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleNavigation("/adminSignup")}
                                className="mt-6 w-full relative z-10 flex items-center justify-center gap-2 bg-gray-900 hover:bg-blue-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-blue-600/30"
                            >
                                Become a Partner
                            </button>
                        </div>
                    </div>

                    {/* ================= CONTACT ================= */}
                    <div>
                        <h3 className="text-gray-900 text-xs font-bold mb-6 uppercase tracking-widest font-['IBM_Plex_Mono'] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Contact Desk
                        </h3>

                        <div className="space-y-5">
                            {/* LOCATION */}
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                    <MapPin size={16} className="text-blue-600" />
                                </div>
                                <div className="pt-2">
                                    <p className="text-gray-600 font-medium text-[13px]">Jaipur, Rajasthan, India</p>
                                </div>
                            </div>

                            {/* PHONE */}
                            <a href="tel:+919876543210" className="flex items-center gap-3 text-sm group outline-none">
                                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                                    <Phone size={16} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <p className="text-gray-600 font-medium text-[13px] group-hover:text-blue-600 transition-colors">+91 98765 43210</p>
                            </a>

                            {/* EMAIL */}
                            <a href="mailto:support@aurastays.com" className="flex items-center gap-3 text-sm group outline-none">
                                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                                    <Mail size={16} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <p className="text-gray-600 font-medium text-[13px] group-hover:text-blue-600 transition-colors">AuraStay &lt;onboarding@resend.dev&gt;</p>
                            </a>

                            {/* SUPPORT */}
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                    <Headphones size={16} className="text-blue-600" />
                                </div>
                                <div className="pt-2">
                                    <p className="text-gray-600 font-medium text-[13px]">24/7 Booking Assistance</p>
                                </div>
                            </div>
                        </div>

                        {/* SOCIAL ICONS */}
                        <div className="flex gap-3 mt-8">
                            {[FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn].map((Icon, idx) => (
                                <a key={idx} href="#" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300 flex items-center justify-center outline-none">
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= BOTTOM BAR ================= */}
            <div className="border-t border-gray-100 bg-gray-50/50">
                <div className="max-w-[1600px] mx-auto px-6 sm:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[13px] font-medium text-gray-500 text-center md:text-left">
                        © {new Date().getFullYear()} <span className="font-bold text-gray-900 tracking-wide">AuraStays</span>. All Rights Reserved.
                    </p>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-gray-500">
                        {["Privacy Policy", "Terms & Conditions", "Refund Policy", "Help Center"].map((link, idx) => (
                            <button key={idx} className="hover:text-blue-600 transition-colors duration-300 outline-none">
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