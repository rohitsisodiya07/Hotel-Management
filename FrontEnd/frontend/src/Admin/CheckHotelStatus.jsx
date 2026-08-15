import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import {
    Building2,
    ShieldCheck,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Copy,
    Check
} from "lucide-react";
import logo from '../assets/logo.png'

const STATUS_STYLES = {
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
};

const normalizeStatus = (status) => {
    if (!status) return status;
    const s = status.trim().toLowerCase();
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    if (s === "pending") return "Pending";
    return status;
};

const CheckHotelStatus = () => {
    const navigate = useNavigate();

    const [trackingId, setTrackingId] = useState("");
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const fieldClass =
        "w-full border pl-10 pr-3.5 h-11 rounded-xl text-xs font-medium outline-none transition-all bg-gray-50/50 text-gray-900 border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 shadow-2xs";

    const handleCheckStatus = async (e) => {
        e.preventDefault();

        if (!trackingId.trim()) {
            setError("Please enter your tracking ID");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axios.post(`${signupApi}hotel/checkStatus`, {
                trackingId,
            });

            setHotel(response.data.data);
        } catch (err) {
            setHotel(null);
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyTrackingId = (id) => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const status = normalizeStatus(hotel?.status);

    return (
        <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 sm:p-6">

            <div className="w-full max-w-[1100px] min-h-[650px] bg-white rounded-[30px] overflow-hidden shadow-[0_25px_70px_rgba(15,23,42,0.12)] flex">

                {/* =====================================================
                LEFT BRAND
            ===================================================== */}
                <div className="hidden lg:flex w-[43%] relative bg-blue-600 text-white items-center justify-center px-12 overflow-hidden">

                    <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

                    <div className="absolute -bottom-32 -left-10 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl" />

                    <div className="absolute top-24 right-20 w-3 h-3 rounded-full bg-white/30" />
                    <div className="absolute top-36 right-32 w-2 h-2 rounded-full bg-white/20" />
                    <div className="absolute bottom-28 left-20 w-2 h-2 rounded-full bg-white/20" />

                    <div className="relative z-10 flex flex-col items-center text-center">

                        <p className="text-[13px] uppercase tracking-[0.25em] font-semibold text-white/70 mb-7">
                            Welcome to
                        </p>

                        {/* LOGO */}
                        <div className="w-[250px] mb-9">
                            <img
                                src={logo}
                                alt="AuraStay Logo"
                                className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
                            />
                        </div>

                        <h2 className="text-2xl font-bold mb-3">
                            Your hotel journey.
                        </h2>

                        <p className="text-[14px] leading-6 max-w-[280px] text-white/80">
                            Track your hotel application and stay
                            updated throughout the approval process.
                        </p>

                        {/* FEATURES */}
                        <div className="mt-10 space-y-4 text-left">

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Building2 size={15} />
                                </div>

                                <span className="text-xs text-white/80">
                                    Submit your hotel application
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <ShieldCheck size={15} />
                                </div>

                                <span className="text-xs text-white/80">
                                    Application reviewed securely
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <CheckCircle2 size={15} />
                                </div>

                                <span className="text-xs text-white/80">
                                    Track approval status anytime
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* CURVED EDGE */}
                    <div className="absolute top-[3%] -right-5 w-14 h-24 bg-blue-600 rounded-full" />
                    <div className="absolute top-[18%] -right-9 w-24 h-36 bg-blue-600 rounded-full" />
                    <div className="absolute top-[40%] -right-7 w-20 h-32 bg-blue-600 rounded-full" />
                    <div className="absolute top-[61%] -right-12 w-28 h-40 bg-blue-600 rounded-full" />
                    <div className="absolute top-[82%] -right-5 w-16 h-24 bg-blue-600 rounded-full" />
                    <div className="absolute -bottom-5 -right-4 w-20 h-28 bg-blue-600 rounded-full" />

                </div>


                {/* =====================================================
                RIGHT CONTENT
            ===================================================== */}
                <div className="w-full lg:w-[57%] flex items-center justify-center">

                    <div className="w-full max-w-[470px] px-6 py-10 sm:px-10 lg:px-12">

                        {/* BACK */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-blue-600 transition mb-7"
                        >
                            <ArrowLeft size={15} />
                            Back
                        </button>


                        {/* HEADER */}
                        <div className="mb-8">

                            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-2">
                                Property Application
                            </p>

                            <h1 className="text-[32px] sm:text-[36px] font-extrabold tracking-tight text-gray-900">
                                Check hotel status.
                            </h1>

                            <p className="text-sm text-gray-500 mt-2 leading-6">
                                Enter your tracking ID to view the latest
                                status of your hotel application.
                            </p>

                        </div>


                        {/* =================================================
                        TRACKING FORM
                    ================================================= */}
                        {!hotel && (

                            <form
                                onSubmit={handleCheckStatus}
                                className="space-y-5"
                            >

                                <div>

                                    <label
                                        htmlFor="tracking-id"
                                        className="block text-xs font-bold text-gray-600 mb-2"
                                    >
                                        Hotel Tracking ID
                                    </label>

                                    <div className="relative">

                                        <Building2
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={17}
                                        />

                                        <input
                                            id="tracking-id"
                                            type="text"
                                            placeholder="Enter your hotel tracking ID"
                                            value={trackingId}
                                            onChange={(e) => {
                                                setTrackingId(e.target.value);
                                                setError("");
                                            }}
                                            className="
                                            w-full
                                            h-[52px]
                                            rounded-xl
                                            border
                                            border-gray-200
                                            pl-11
                                            pr-4
                                            text-sm
                                            font-medium
                                            outline-none
                                            bg-gray-50/50
                                            focus:border-blue-500
                                            focus:bg-white
                                            focus:ring-2
                                            focus:ring-blue-500/10
                                            transition-all
                                        "
                                        />

                                    </div>

                                </div>


                                {/* INFO */}
                                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex gap-3">

                                    <ShieldCheck
                                        size={18}
                                        className="text-blue-600 shrink-0 mt-0.5"
                                    />

                                    <p className="text-xs leading-5 text-blue-700">
                                        Use the tracking ID received after
                                        submitting your hotel application.
                                    </p>

                                </div>


                                {/* ERROR */}
                                {error && (

                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">

                                        <AlertCircle
                                            size={17}
                                            className="text-rose-600 shrink-0 mt-0.5"
                                        />

                                        <p className="text-xs leading-5 text-rose-700 font-medium">
                                            {error}
                                        </p>

                                    </div>

                                )}


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                    w-full
                                    h-[52px]
                                    rounded-xl
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    text-sm
                                    font-bold
                                    transition-all
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    shadow-[0_8px_20px_rgba(37,99,235,0.25)]
                                    hover:-translate-y-[1px]
                                    disabled:opacity-60
                                    disabled:cursor-not-allowed
                                "
                                >

                                    {loading && (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}

                                    {loading
                                        ? "Checking Status..."
                                        : "Check Application Status"}

                                </button>

                            </form>

                        )}


                        {/* =================================================
                        HOTEL RESULT
                    ================================================= */}
                        {hotel && (

                            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                                {/* RESULT HEADER */}
                                <div className="p-5 bg-gray-50 border-b border-gray-100">

                                    <div className="flex items-center justify-between gap-3">

                                        <div>

                                            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400">
                                                Application Result
                                            </p>

                                            <h2 className="text-lg font-extrabold text-gray-900 mt-1">
                                                Hotel Details
                                            </h2>

                                        </div>


                                        <span
                                            className={`
                                            px-3 py-1.5
                                            rounded-full
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            border
                                            ${STATUS_STYLES[status] ||
                                                "bg-gray-100 text-gray-700 border-gray-200"
                                                }
                                        `}
                                        >
                                            {status}
                                        </span>

                                    </div>

                                </div>


                                {/* DETAILS */}
                                <div className="p-5">

                                    {/* Hotel icon */}
                                    <div className="flex items-center gap-4 mb-5">

                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">

                                            <Building2
                                                size={25}
                                                className="text-blue-600"
                                            />

                                        </div>

                                        <div>

                                            <h3 className="font-bold text-gray-900">
                                                {hotel.hotelName}
                                            </h3>

                                            <p className="text-xs text-gray-400 mt-1">
                                                Hotel Application
                                            </p>

                                        </div>

                                    </div>


                                    {/* INFO GRID */}
                                    <div className="rounded-xl border border-gray-100 overflow-hidden">

                                        <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100 flex justify-between gap-4">

                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                Owner
                                            </span>

                                            <span className="text-xs font-semibold text-gray-900">
                                                {hotel.ownerName}
                                            </span>

                                        </div>


                                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between gap-4">

                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                Email
                                            </span>

                                            <span className="text-xs font-semibold text-gray-900 break-all text-right">
                                                {hotel.hotelEmail}
                                            </span>

                                        </div>


                                        <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100 flex justify-between items-center gap-4">

                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                Tracking ID
                                            </span>

                                            <div className="flex items-center gap-2">

                                                <span className="text-xs font-bold text-blue-600 font-mono">
                                                    {hotel.trackingId}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCopyTrackingId(
                                                            hotel.trackingId
                                                        )
                                                    }
                                                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 transition"
                                                    title="Copy Tracking ID"
                                                >

                                                    {copied ? (
                                                        <Check
                                                            size={13}
                                                            className="text-emerald-600"
                                                        />
                                                    ) : (
                                                        <Copy size={13} />
                                                    )}

                                                </button>

                                            </div>

                                        </div>


                                        <div className="px-4 py-3 flex justify-between gap-4">

                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                Submitted On
                                            </span>

                                            <span className="text-xs font-semibold text-gray-900">
                                                {new Date(
                                                    hotel.createdAt
                                                ).toLocaleDateString()}
                                            </span>

                                        </div>

                                    </div>


                                    {/* REJECTED */}
                                    {status === "Rejected" &&
                                        hotel.remark && (

                                            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-4">

                                                <div className="flex items-start gap-3">

                                                    <AlertCircle
                                                        size={17}
                                                        className="text-rose-600 mt-0.5 shrink-0"
                                                    />

                                                    <p className="text-xs leading-5 text-rose-700">

                                                        <span className="font-bold">
                                                            Rejection Remark:
                                                        </span>{" "}

                                                        {hotel.remark}

                                                    </p>

                                                </div>

                                            </div>

                                        )}


                                    {/* STATUS MESSAGE */}
                                    {status === "Approved" && (

                                        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">

                                            <div className="flex items-center gap-3">

                                                <CheckCircle2
                                                    size={18}
                                                    className="text-emerald-600"
                                                />

                                                <p className="text-xs font-semibold text-emerald-700">
                                                    Your hotel application has been approved.
                                                </p>

                                            </div>

                                        </div>

                                    )}


                                    {status === "Pending" && (

                                        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">

                                            <div className="flex items-center gap-3">

                                                <ShieldCheck
                                                    size={18}
                                                    className="text-amber-600"
                                                />

                                                <p className="text-xs font-semibold text-amber-700">
                                                    Your application is currently under review.
                                                </p>

                                            </div>

                                        </div>

                                    )}


                                    {/* CHECK ANOTHER */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHotel(null);
                                            setTrackingId("");
                                            setError("");
                                        }}
                                        className="
                                        w-full
                                        mt-5
                                        h-[48px]
                                        rounded-xl
                                        bg-gray-900
                                        hover:bg-gray-800
                                        text-white
                                        text-sm
                                        font-bold
                                        transition-all
                                    "
                                    >
                                        Check Another Tracking ID
                                    </button>

                                </div>

                            </div>

                        )}


                        {/* FOOTER */}
                        <div className="mt-7 pt-6 border-t border-gray-100 text-center">

                            <p className="text-[13px] text-gray-500">

                                Already have an account?{" "}

                                <Link
                                    to="/login"
                                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4"
                                >
                                    Log in
                                </Link>

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CheckHotelStatus;