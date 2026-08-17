import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import {
    ShieldCheck,
    KeyRound,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Loader2,
    FileText,
    Copy,
    Check
} from "lucide-react";
import logo from '../assets/logo.png'

const STATUS_STYLES = {
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
};

const CheckStatus = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [trackingId, setTrackingId] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [error, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState(location.state?.statusMessage || "");
    const [otpSentMessage, setOtpSentMessage] = useState("");
    const [copied, setCopied] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!trackingId.trim()) {
            setError("Please enter your tracking ID");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setInfoMessage("");

            const response = await axios.post(`${signupApi}admin/sendOtp`, { trackingId });

            setOtpSentMessage(response.data.message || "OTP sent successfully.");
            setShowOtp(true);
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otp.trim()) {
            setError("Please enter the OTP");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axios.post(`${signupApi}admin/verifyOtp`, {
                trackingId,
                otp,
            });

            setAdmin(response.data.admin);
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyTrackingId = (id) => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 sm:p-6">

            {/* ================= MAIN CARD ================= */}
            <div className="w-full max-w-[1100px] min-h-[550px] lg:min-h-[650px] bg-white rounded-[24px] lg:rounded-[30px] overflow-hidden shadow-[0_25px_70px_rgba(15,23,42,0.12)] flex relative">

                {/* =====================================================
                LEFT BRAND SECTION (Desktop Only)
            ===================================================== */}
                <div className="hidden lg:flex w-[43%] relative bg-blue-600 text-white flex-col items-center justify-center px-12 overflow-hidden z-10">

                    {/* Background glow */}
                    <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-10 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl" />

                    {/* Decorative dots */}
                    <div className="absolute top-24 right-20 w-3 h-3 rounded-full bg-white/30" />
                    <div className="absolute top-36 right-32 w-2 h-2 rounded-full bg-white/20" />
                    <div className="absolute bottom-28 left-20 w-2 h-2 rounded-full bg-white/20" />


                    {/* ================= BRAND ================= */}
                    <div className="relative z-20 flex flex-col items-center text-center">

                        <p className="text-[13px] uppercase tracking-[0.25em] font-semibold text-white/70 mb-7">
                            Welcome to
                        </p>

                        {/* LOGO */}
                        <div className="w-[250px] mb-9 flex justify-center">
                            <img
                                src={logo}
                                alt="AuraStay Logo"
                                className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
                            />
                        </div>

                        <h2 className="text-2xl font-bold mb-3">
                            Track your application.
                        </h2>

                        <p className="text-[14px] leading-6 max-w-[280px] text-white/80">
                            Check your administrator application status
                            securely using your tracking ID.
                        </p>

                        {/* Steps */}
                        <div className="mt-10 space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <FileText size={15} />
                                </div>
                                <span className="text-xs text-white/80">Enter your tracking ID</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <KeyRound size={15} />
                                </div>
                                <span className="text-xs text-white/80">Verify with OTP</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <ShieldCheck size={15} />
                                </div>
                                <span className="text-xs text-white/80">View application status</span>
                            </div>
                        </div>

                    </div>

                    {/* ================= CURVED EDGE ================= */}
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
                <div className="w-full lg:w-[57%] flex items-center justify-center bg-white z-0">

                    <div className="w-full max-w-[470px] px-6 py-8 sm:px-10 lg:px-12 lg:py-10">

                        {/* ================= MOBILE BRANDING (Mobile Only) ================= */}
                        <div className="lg:hidden flex flex-col items-center justify-center mb-8">
                            <div className="bg-blue-600 p-4 rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] flex items-center justify-center w-[180px]">
                                <img
                                    src={logo}
                                    alt="AuraStay Logo"
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        </div>

                        {/* ================= BACK ================= */}
                        {!admin && (
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-blue-600 transition mb-6 cursor-pointer w-fit"
                            >
                                <ArrowLeft size={15} />
                                Back
                            </button>
                        )}


                        {/* ================= HEADER ================= */}
                        <div className="mb-7 text-center lg:text-left">

                            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-2">
                                Application Tracker
                            </p>

                            <h1 className="text-[28px] sm:text-[32px] lg:text-[36px] font-extrabold tracking-tight text-gray-900">
                                Check your status.
                            </h1>

                            <p className="text-sm text-gray-500 mt-2 leading-6">
                                Verify your application to securely view
                                the latest approval status.
                            </p>

                        </div>


                        {/* =================================================
                        STEP INDICATOR
                    ================================================= */}
                        {!admin && (

                            <div className="flex items-center justify-center lg:justify-start mb-7">

                                {/* Step 1 */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${!showOtp ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}
                                    >
                                        {showOtp ? "✓" : "1"}
                                    </div>
                                    <span className={`text-[11px] font-bold ${!showOtp ? "text-blue-600" : "text-gray-400"}`}>
                                        Tracking ID
                                    </span>
                                </div>

                                {/* Connector */}
                                <div className="mx-3 h-1 w-12 sm:w-16 rounded-full bg-gray-100 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${showOtp ? "w-full bg-blue-600" : "w-0"}`} />
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${showOtp ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
                                    >
                                        2
                                    </div>
                                    <span className={`text-[11px] font-bold ${showOtp ? "text-blue-600" : "text-gray-400"}`}>
                                        Verify
                                    </span>
                                </div>

                            </div>

                        )}


                        {/* =================================================
                        INFO MESSAGE
                    ================================================= */}
                        {infoMessage && (
                            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={15} className="text-amber-600" />
                                </div>
                                <p className="text-xs leading-5 text-amber-800 font-medium">
                                    {infoMessage}
                                </p>
                            </div>
                        )}


                        {/* =================================================
                        OTP SENT MESSAGE
                    ================================================= */}
                        {otpSentMessage && showOtp && !admin && (
                            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={15} className="text-emerald-600" />
                                </div>
                                <p className="text-xs leading-5 text-emerald-800 font-medium">
                                    {otpSentMessage}
                                </p>
                            </div>
                        )}


                        {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}
                        {error && (
                            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                    <AlertCircle size={15} className="text-rose-600" />
                                </div>
                                <p className="text-xs leading-5 text-rose-700 font-medium">
                                    {error}
                                </p>
                            </div>
                        )}


                        {/* =================================================
                        STEP 1 — TRACKING ID
                    ================================================= */}
                        {!showOtp && !admin && (
                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div>
                                    <label htmlFor="tracking-id" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                                        Tracking ID
                                    </label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            id="tracking-id"
                                            type="text"
                                            placeholder="Enter your tracking ID"
                                            value={trackingId}
                                            onChange={(e) => setTrackingId(e.target.value)}
                                            className="w-full h-[52px] rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none bg-gray-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                                    <p className="text-xs leading-5 text-blue-700">
                                        Enter the tracking ID you received
                                        after submitting your administrator
                                        application.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {loading && <Loader2 className="animate-spin" size={17} />}
                                    {loading ? "Sending OTP..." : "Send Verification OTP"}
                                </button>
                            </form>
                        )}


                        {/* =================================================
                        STEP 2 — OTP
                    ================================================= */}
                        {showOtp && !admin && (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div className="rounded-2xl bg-[#f7f8fc] border border-gray-100 p-6">
                                    <div className="flex justify-center mb-5">
                                        <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center">
                                            <KeyRound size={26} className="text-blue-600" />
                                        </div>
                                    </div>

                                    <p className="text-center text-sm font-bold text-gray-800">
                                        Verify your application
                                    </p>
                                    <p className="text-center text-xs text-gray-400 mt-1 mb-6">
                                        Enter the 6-digit OTP sent to your registered email.
                                    </p>

                                    <label htmlFor="otp" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                                        Verification Code
                                    </label>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            id="otp"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full h-[54px] rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {loading && <Loader2 className="animate-spin" size={17} />}
                                    {loading ? "Verifying..." : "Verify & View Status"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowOtp(false);
                                        setOtp("");
                                        setError("");
                                        setOtpSentMessage("");
                                    }}
                                    className="w-full h-11 rounded-xl text-sm font-semibold text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all"
                                >
                                    ← Change Tracking ID
                                </button>
                            </form>
                        )}


                        {/* =================================================
                        ADMIN STATUS VIEW
                    ================================================= */}
                        {admin && (
                            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                                {/* Status Header */}
                                <div className="px-5 py-5 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400">
                                            Application
                                        </p>
                                        <h2 className="text-lg font-extrabold text-gray-900 mt-1">
                                            Request Details
                                        </h2>
                                    </div>
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit ${STATUS_STYLES[admin.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                                    >
                                        {admin.status}
                                    </span>
                                </div>

                                <div className="p-5">
                                    {/* Profile */}
                                    <div className="flex items-center gap-4 mb-5">
                                        {admin.profileImage ? (
                                            <img
                                                src={admin.profileImage}
                                                alt={`${admin.name}'s profile`}
                                                className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                                                <ShieldCheck size={24} className="text-blue-600" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {admin.name}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Administrator Application
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-0 rounded-xl border border-gray-100 overflow-hidden text-sm">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 bg-gray-50/60 border-b border-gray-100 gap-1 sm:gap-0">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                Email
                                            </span>
                                            <span className="text-xs font-semibold text-gray-900 truncate">
                                                {admin.email}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 border-b border-gray-100 gap-1 sm:gap-0">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                Mobile
                                            </span>
                                            <span className="text-xs font-semibold text-gray-900">
                                                {admin.mobile}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 bg-gray-50/60 gap-1 sm:gap-0">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                Tracking ID
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-blue-600 font-mono truncate max-w-[150px] sm:max-w-none">
                                                    {admin.trackingId}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyTrackingId(admin.trackingId)}
                                                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 transition shrink-0"
                                                    title="Copy Tracking ID"
                                                >
                                                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rejected Remark */}
                                    {admin.status === "Rejected" && admin.remark && (
                                        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
                                            <p className="text-xs text-rose-700 leading-5">
                                                <span className="font-bold">Remark:</span> {admin.remark}
                                            </p>
                                        </div>
                                    )}

                                    {/* Pending Edit */}
                                    {admin.status === "Pending" && (
                                        <button
                                            onClick={() => navigate(`/adminSignup/${admin._id}`)}
                                            className="w-full mt-5 h-[48px] rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-bold tracking-wide transition-all shadow-md"
                                        >
                                            Edit Application
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}


                        {/* ================= FOOTER ================= */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-[13px] text-gray-500">
                                Already verified or have credentials?{" "}
                                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4">
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

export default CheckStatus;