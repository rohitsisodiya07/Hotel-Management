import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Hotel,
    MapPin,
    Phone,
    Mail,
    ArrowUp,
} from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
    const navigate = useNavigate();

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <footer className="bg-white border-t border-gray-200 font-['Inter',sans-serif] pt-16 mt-20 relative text-gray-800">
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8">

                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14">

                    {/* Brand Identity */}
                    <div>
                        <div
                            onClick={() => navigate("/")}
                            className="flex items-center gap-3 cursor-pointer mb-4 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center transition shadow-2xs group-hover:bg-gray-800">
                                <Hotel className="text-white" size={18} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-gray-900 font-['Space_Grotesk'] tracking-tight leading-none">
                                    AuraStays
                                </h2>
                                <p className="text-[10px] text-blue-600 tracking-[0.15em] font-bold uppercase font-['IBM_Plex_Mono'] mt-1">
                                    Luxury Hotel Booking
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Discover handpicked luxury hotels, premium stays, and unforgettable travel experiences across India. Book your perfect stay with confidence.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 text-sm font-bold font-['Space_Grotesk'] mb-4 uppercase tracking-wider font-['IBM_Plex_Mono']">
                            Quick Links
                        </h3>

                        <ul className="space-y-3 text-xs font-semibold text-gray-600">
                            <li
                                onClick={() => navigate("/")}
                                className="hover:text-blue-600 transition cursor-pointer flex items-center gap-2"
                            >
                                Home
                            </li>
                            <li
                                onClick={() => navigate("/myBookings")}
                                className="hover:text-blue-600 transition cursor-pointer flex items-center gap-2"
                            >
                                My Bookings
                            </li>
                            <li
                                onClick={() => navigate("/login")}
                                className="hover:text-blue-600 transition cursor-pointer flex items-center gap-2"
                            >
                                Partner Sign In
                            </li>
                            <li
                                onClick={() => navigate("/signup")}
                                className="hover:text-blue-600 transition cursor-pointer flex items-center gap-2"
                            >
                                List Your Property
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-gray-900 text-sm font-bold font-['Space_Grotesk'] mb-4 uppercase tracking-wider font-['IBM_Plex_Mono']">
                            Contact Desk
                        </h3>

                        <div className="space-y-3 text-xs font-semibold text-gray-600">
                            <div className="flex items-start gap-2.5">
                                <MapPin className="text-blue-600 mt-0.5 shrink-0" size={16} />
                                <span>
                                    Jaipur, Rajasthan, India
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Phone className="text-blue-600 shrink-0" size={16} />
                                <span>+91 98765 43210</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Mail className="text-blue-600 shrink-0" size={16} />
                                <span>support@aurastays.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Media & Actions */}
                    <div>
                        <h3 className="text-gray-900 text-sm font-bold font-['Space_Grotesk'] mb-4 uppercase tracking-wider font-['IBM_Plex_Mono']">
                            Stay Connected
                        </h3>

                        <p className="text-xs text-gray-500 mb-4 font-medium leading-relaxed">
                            Follow us on social media for exclusive offers, travel inspiration, and the latest luxury updates.
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-2.5">
                            <a
                                href="#"
                                className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 flex items-center justify-center shadow-2xs"
                            >
                                <FaFacebookF size={14} />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 flex items-center justify-center shadow-2xs"
                            >
                                <FaInstagram size={14} />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 flex items-center justify-center shadow-2xs"
                            >
                                <FaXTwitter size={14} />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 flex items-center justify-center shadow-2xs"
                            >
                                <FaLinkedinIn size={14} />
                            </a>
                        </div>

                        {/* Back to Top Button */}
                        <button
                            onClick={scrollToTop}
                            className="mt-5 flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-900 text-gray-700 hover:bg-gray-900 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-2xs cursor-pointer"
                        >
                            <ArrowUp size={13} />
                            Back to Top
                        </button>
                    </div>
                </div>

                {/* Bottom Copyright Section */}
                <div className="border-t border-gray-200 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
                    <p className="text-center md:text-left">
                        © {new Date().getFullYear()} <span className="font-bold text-gray-900">AuraStays</span>. All Rights Reserved.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <span className="cursor-pointer hover:text-blue-600 transition">Privacy Policy</span>
                        <span className="cursor-pointer hover:text-blue-600 transition">Terms & Conditions</span>
                        <span className="cursor-pointer hover:text-blue-600 transition">Refund Policy</span>
                        <span className="cursor-pointer hover:text-blue-600 transition">Help Center</span>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;