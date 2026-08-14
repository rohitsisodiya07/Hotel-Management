import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Hotel,
    MapPin,
    Phone,
    Mail,
    ShieldCheck,
    BadgeCheck,
    Headphones,
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
        <footer className="bg-white border-t border-gray-200 font-['Inter',sans-serif] text-gray-800">

            {/* ================= MAIN FOOTER ================= */}
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 pt-12">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">

                    {/* ================= BRAND ================= */}
                    <div>

                        <button
                            onClick={scrollToTop}
                            className="flex items-center gap-3 cursor-pointer group mb-4 text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gray-950 group-hover:bg-blue-600 flex items-center justify-center transition-all duration-300 shadow-sm">
                                <Hotel
                                    className="text-white"
                                    size={18}
                                />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-900 font-['Space_Grotesk'] tracking-tight leading-none">
                                    AuraStays
                                </h2>

                                <p className="text-[9px] text-blue-600 tracking-[0.15em] font-bold uppercase font-['IBM_Plex_Mono'] mt-1">
                                    Luxury Hotel Booking
                                </p>
                            </div>
                        </button>

                        <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-sm">
                            Discover handpicked hotels, premium stays and
                            unforgettable travel experiences across India.
                        </p>


                        {/* Trust Indicators */}
                        <div className="flex flex-wrap gap-2 mt-5">

                            <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-gray-600">
                                <BadgeCheck
                                    size={12}
                                    className="text-blue-600"
                                />
                                Verified Stays
                            </span>

                            <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-gray-600">
                                <ShieldCheck
                                    size={12}
                                    className="text-blue-600"
                                />
                                Secure Booking
                            </span>

                        </div>

                    </div>


                    {/* ================= EXPLORE ================= */}
                    <div>

                        <h3 className="text-gray-900 text-[11px] font-bold mb-4 uppercase tracking-[0.12em] font-['IBM_Plex_Mono']">
                            Explore
                        </h3>

                        <ul className="space-y-3 text-xs font-semibold text-gray-600">

                            <li>
                                <button
                                    onClick={scrollToTop}
                                    className="hover:text-blue-600 transition cursor-pointer"
                                >
                                    Home
                                </button>
                            </li>

                            <li>
                                <button
                                    onClick={scrollToHotels}
                                    className="hover:text-blue-600 transition cursor-pointer"
                                >
                                    Explore Hotels
                                </button>
                            </li>

                            <li>
                                <button
                                    onClick={() =>
                                        handleNavigation("/myBookings")
                                    }
                                    className="hover:text-blue-600 transition cursor-pointer"
                                >
                                    My Bookings
                                </button>
                            </li>

                            <li>
                                <button
                                    onClick={() =>
                                        handleNavigation("/login")
                                    }
                                    className="hover:text-blue-600 transition cursor-pointer"
                                >
                                    Partner Sign In
                                </button>
                            </li>

                        </ul>

                    </div>


                    {/* ================= PARTNERS ================= */}
                    <div>

                        <h3 className="text-gray-900 text-[11px] font-bold mb-4 uppercase tracking-[0.12em] font-['IBM_Plex_Mono']">
                            For Partners
                        </h3>

                        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">

                            <div className="flex items-start gap-3">

                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                                    <Hotel size={15} />
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-900">
                                        List your property
                                    </h4>

                                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                                        Grow your reach and connect with
                                        travelers looking for premium stays.
                                    </p>
                                </div>

                            </div>

                            <button
                                onClick={() =>
                                    handleNavigation("/adminSignup")
                                }
                                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-950 hover:bg-blue-600 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                            >
                                Become a Partner
                            </button>

                        </div>

                    </div>


                    {/* ================= CONTACT ================= */}
                    <div>

                        <h3 className="text-gray-900 text-[11px] font-bold mb-4 uppercase tracking-[0.12em] font-['IBM_Plex_Mono']">
                            Contact Desk
                        </h3>

                        <div className="space-y-3">

                            <div className="flex items-start gap-2.5">
                                <MapPin
                                    size={15}
                                    className="text-blue-600 mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                                        Office
                                    </p>

                                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                                        Jaipur, Rajasthan, India
                                    </p>
                                </div>
                            </div>


                            <a
                                href="tel:+919876543210"
                                className="flex items-start gap-2.5 group"
                            >
                                <Phone
                                    size={15}
                                    className="text-blue-600 mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                                        Phone
                                    </p>

                                    <p className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition mt-0.5">
                                        +91 98765 43210
                                    </p>
                                </div>
                            </a>


                            <a
                                href="mailto:support@aurastays.com"
                                className="flex items-start gap-2.5 group"
                            >
                                <Mail
                                    size={15}
                                    className="text-blue-600 mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                                        Email
                                    </p>

                                    <p className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition mt-0.5">
                                        support@aurastays.com
                                    </p>
                                </div>
                            </a>


                            <div className="flex items-start gap-2.5">
                                <Headphones
                                    size={15}
                                    className="text-blue-600 mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                                        Support
                                    </p>

                                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                                        Available for booking assistance
                                    </p>
                                </div>
                            </div>

                        </div>


                        {/* Social */}
                        <div className="flex gap-2 mt-5">

                            <a
                                href="#"
                                aria-label="Facebook"
                                onClick={(e) => e.preventDefault()}
                                className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-all duration-300 flex items-center justify-center"
                            >
                                <FaFacebookF size={12} />
                            </a>

                            <a
                                href="#"
                                aria-label="Instagram"
                                onClick={(e) => e.preventDefault()}
                                className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-all duration-300 flex items-center justify-center"
                            >
                                <FaInstagram size={12} />
                            </a>

                            <a
                                href="#"
                                aria-label="X"
                                onClick={(e) => e.preventDefault()}
                                className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-all duration-300 flex items-center justify-center"
                            >
                                <FaXTwitter size={12} />
                            </a>

                            <a
                                href="#"
                                aria-label="LinkedIn"
                                onClick={(e) => e.preventDefault()}
                                className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-all duration-300 flex items-center justify-center"
                            >
                                <FaLinkedinIn size={12} />
                            </a>

                        </div>

                    </div>

                </div>


                {/* ================= BOTTOM ================= */}
                <div className="border-t border-gray-200 py-5 flex flex-col lg:flex-row justify-between items-center gap-4">

                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 text-center lg:text-left">
                        © {new Date().getFullYear()}{" "}
                        <span className="font-bold text-gray-900">
                            AuraStays
                        </span>
                        . All Rights Reserved.
                    </p>


                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-semibold text-gray-500">

                        <button className="hover:text-blue-600 transition cursor-pointer">
                            Privacy Policy
                        </button>

                        <button className="hover:text-blue-600 transition cursor-pointer">
                            Terms & Conditions
                        </button>

                        <button className="hover:text-blue-600 transition cursor-pointer">
                            Refund Policy
                        </button>

                        <button className="hover:text-blue-600 transition cursor-pointer">
                            Help Center
                        </button>

                    </div>

                </div>

            </div>

        </footer>
    );
};

export default Footer;