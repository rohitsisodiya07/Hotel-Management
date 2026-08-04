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

    const fieldClass =
        "w-full border pl-10 pr-3.5 h-11 rounded-xl text-xs font-medium outline-none transition-all bg-gray-50/50 text-gray-900 border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 shadow-2xs";

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-['Inter',sans-serif] flex items-center justify-center px-4 py-12 relative overflow-hidden">

            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors mb-6 cursor-pointer font-['IBM_Plex_Mono'] uppercase tracking-wider"
                >
                    <ArrowLeft size={15} /> Back
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-2xs">
                        <FileText size={22} />
                    </div>
                    <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
                        Application Tracker
                    </span>
                    <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 m-0 tracking-tight">
                        Check Request Status
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-medium">
                        Enter your tracking ID to securely view your approval status.
                    </p>
                </div>

                {/* Info Message */}
                {infoMessage && (
                    <div role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs">
                        <CheckCircle2 className="mt-0.5 shrink-0" size={14} />
                        <span>{infoMessage}</span>
                    </div>
                )}

                {/* OTP Sent Message */}
                {otpSentMessage && showOtp && !admin && (
                    <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs">
                        <CheckCircle2 className="mt-0.5 shrink-0" size={14} />
                        <span>{otpSentMessage}</span>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs">
                        <AlertCircle className="mt-0.5 shrink-0" size={14} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Send OTP Step */}
                {!showOtp && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label htmlFor="tracking-id" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                Tracking ID
                            </label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    id="tracking-id"
                                    type="text"
                                    placeholder="Enter your tracking ID"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    className={fieldClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                        >
                            {loading && <Loader2 className="animate-spin" size={15} />}
                            {loading ? "Sending OTP..." : "Send Verification OTP"}
                        </button>
                    </form>
                )}

                {/* Verify OTP Step */}
                {showOtp && !admin && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label htmlFor="otp" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                Enter OTP
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className={fieldClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                        >
                            {loading && <Loader2 className="animate-spin" size={15} />}
                            {loading ? "Verifying..." : "Verify & View Status"}
                        </button>
                    </form>
                )}

                {/* Admin Status Details Card */}
                {admin && (
                    <div className="mt-4 border border-gray-200 rounded-2xl p-6 bg-gray-50/60 shadow-2xs">
                        <h2 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 mb-4 text-center">
                            Request Details
                        </h2>

                        {admin.profileImage && (
                            <img
                                src={admin.profileImage}
                                alt={`${admin.name}'s profile`}
                                className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 border border-gray-200 shadow-2xs"
                            />
                        )}

                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                <span className="text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Name</span>
                                <span className="font-bold text-gray-900">{admin.name}</span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                <span className="text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Email</span>
                                <span className="font-semibold text-gray-900">{admin.email}</span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                <span className="text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Mobile</span>
                                <span className="font-semibold text-gray-900">{admin.mobile}</span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                <span className="text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Tracking ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-['IBM_Plex_Mono',monospace] font-bold text-blue-600">{admin.trackingId}</span>
                                    <button
                                        onClick={() => handleCopyTrackingId(admin.trackingId)}
                                        className="p-1 text-gray-400 hover:text-blue-600 bg-white rounded-md border border-gray-200 shadow-2xs cursor-pointer"
                                        title="Copy ID"
                                    >
                                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                                <span className="text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">Status</span>
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${STATUS_STYLES[admin.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                    {admin.status}
                                </span>
                            </div>

                            {admin.status === "Rejected" && admin.remark && (
                                <div className="pt-2 text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                                    <span className="font-bold">Remark: </span> {admin.remark}
                                </div>
                            )}

                            {admin.status === "Pending" && (
                                <button
                                    onClick={() => navigate(`/adminSignup/${admin._id}`)}
                                    className="w-full mt-3 h-10 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 transition shadow-2xs cursor-pointer"
                                >
                                    Edit Request
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Streamlined Footer */}
                <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col items-center justify-center text-xs text-center">
                    <p className="text-gray-500 font-medium">
                        Already verified or have credentials?{" "}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default CheckStatus;