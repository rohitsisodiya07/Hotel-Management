import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signupApi } from "../api";

const STATUS_STYLES = {
    Approved: "bg-[#E9F1E4] text-[#3F6B2E]",
    Rejected: "bg-[#FBF0EE] text-[#8E3B30]",
    Pending: "bg-[#FBF6E9] text-[#7A5A1E]",
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

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!trackingId.trim()) {
            setError("Please enter your Tracking ID");
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

    const fieldClass =
        "w-full border pl-10 pr-3.5 h-11 rounded text-[13px] outline-none transition-colors duration-150 ease-in-out bg-[#FCFBF7] text-[#232320] border-[#DEDBCF] focus:border-[#A2782E]";

    return (
        <div className="min-h-screen bg-[#F5F4EF] bg-[radial-gradient(900px_420px_at_100%_-10%,rgba(31,42,68,0.05),transparent_60%)] font-['Inter',sans-serif] text-[#232320] flex items-center justify-center px-4 py-10">
            {/* Note: prefer moving this @import into a global stylesheet/index.html
                so it isn't re-injected on every mount. Left inline to preserve
                the original single-file structure. */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

            <div className="w-full max-w-lg bg-white border border-[#E1DECF] rounded-md p-8 shadow-[0_1px_2px_rgba(30,28,20,0.03),0_12px_26px_-18px_rgba(30,28,20,0.18)]">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-[#8C8676] hover:text-[#1B2537] transition-colors duration-150 mb-6 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <div className="text-center mb-8">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.22em] text-[#A2782E] mt-0 mb-2.5">
                        REQUEST STATUS
                    </p>
                    <h1 className="font-['Space_Grotesk',sans-serif] font-semibold text-[26px] tracking-[-0.01em] m-0 text-[#1B2537]">
                        Check request status
                    </h1>
                    <p className="text-[#8C8676] text-[13px] mt-2 mb-0">
                        Enter your tracking ID to check your request.
                    </p>
                </div>

                {infoMessage && (
                    <div
                        role="status"
                        className="mb-4 rounded border border-[#E4D2A0] bg-[#FBF6E9] text-[#7A5A1E] text-[13px] px-3.5 py-2.5 flex items-start gap-2"
                    >
                        <svg className="mt-[1px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {infoMessage}
                    </div>
                )}

                {otpSentMessage && showOtp && !admin && (
                    <div
                        role="status"
                        className="mb-4 rounded border border-[#E4D2A0] bg-[#FBF6E9] text-[#7A5A1E] text-[13px] px-3.5 py-2.5 flex items-start gap-2"
                    >
                        <svg className="mt-[1px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {otpSentMessage}
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-4 rounded border border-[#E7C9C3] bg-[#FBF0EE] text-[#8E3B30] text-[13px] px-3.5 py-2.5 flex items-start gap-2"
                    >
                        <svg className="mt-[1px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v5" />
                            <path d="M12 16h.01" />
                        </svg>
                        {error}
                    </div>
                )}

                {!showOtp && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label htmlFor="tracking-id" className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">
                                Tracking ID
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39C89" strokeWidth="1.8">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="M7 9h6M7 13h10" />
                                </svg>
                                <input
                                    id="tracking-id"
                                    type="text"
                                    placeholder="Enter tracking ID"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    className={fieldClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-[3px] font-['Inter',sans-serif] font-semibold text-[13.5px] bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 12a9 9 0 1 1-9-9" />
                                </svg>
                            )}
                            {loading ? "Sending…" : "Send OTP"}
                        </button>
                    </form>
                )}

                {showOtp && !admin && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label htmlFor="otp" className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">
                                OTP
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39C89" strokeWidth="1.8">
                                    <rect x="3" y="11" width="18" height="10" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className={fieldClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-[3px] font-['Inter',sans-serif] font-semibold text-[13.5px] bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 12a9 9 0 1 1-9-9" />
                                </svg>
                            )}
                            {loading ? "Verifying…" : "Verify OTP"}
                        </button>
                    </form>
                )}

                {admin && (
                    <div className="mt-2 border border-[#E1DECF] rounded p-5 bg-[#FCFBF7]">
                        <h2 className="font-['Space_Grotesk',sans-serif] font-semibold text-[16px] text-[#1B2537] mb-4">
                            Request details
                        </h2>

                        {admin.profileImage && (
                            <img
                                src={admin.profileImage}
                                alt={`${admin.name}'s profile`}
                                className="w-20 h-20 rounded-full object-cover mx-auto mb-5 border border-[#DEDBCF]"
                            />
                        )}

                        <div className="space-y-2.5 text-[13.5px]">
                            <p>
                                <span className="text-[#8C8676]">Name: </span>
                                <span className="text-[#232320] font-medium">{admin.name}</span>
                            </p>

                            <p>
                                <span className="text-[#8C8676]">Email: </span>
                                <span className="text-[#232320] font-medium">{admin.email}</span>
                            </p>

                            <p>
                                <span className="text-[#8C8676]">Mobile: </span>
                                <span className="text-[#232320] font-medium">{admin.mobile}</span>
                            </p>

                            <p>
                                <span className="text-[#8C8676]">Tracking ID: </span>
                                <span className="text-[#232320] font-medium">{admin.trackingId}</span>
                            </p>

                            <p className="flex items-center gap-2">
                                <span className="text-[#8C8676]">Status:</span>
                                <span
                                    className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${STATUS_STYLES[admin.status] || "bg-[#F0EEE4] text-[#8C8676]"
                                        }`}
                                >
                                    {admin.status}
                                </span>
                            </p>

                            {admin.status === "Rejected" && admin.remark && (
                                <p>
                                    <span className="text-[#8C8676]">Remark: </span>
                                    <span className="text-[#232320] font-medium">{admin.remark}</span>
                                </p>
                            )}

                            {admin.status === "Pending" && (
                                <button
                                    onClick={() => navigate(`/adminSignup/${admin._id}`)}
                                    className="w-full mt-3 h-11 rounded-[3px] font-['Inter',sans-serif] font-semibold text-[13.5px] bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A] transition-colors duration-150 ease-in-out cursor-pointer"
                                >
                                    Edit request
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-6 border-t border-[#DEDBCF] pt-4 space-y-2">
                    <p className="text-center text-[13px] text-[#8C8676]">
                        New user?{" "}
                        <Link to="/" className="font-medium text-[#1B2537] hover:text-[#A2782E]">
                            Sign up as User
                        </Link>
                    </p>

                    <p className="text-center text-[13px] text-[#8C8676]">
                        Want to create an admin account?{" "}
                        <Link to="/adminSignup" className="font-medium text-[#1B2537] hover:text-[#A2782E]">
                            Sign up as Admin
                        </Link>
                    </p>

                    <p className="text-center text-[13px] text-[#8C8676]">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-[#1B2537] hover:text-[#A2782E]">
                            Log in
                        </Link>
                    </p>

                    <p className="text-center text-[13px] text-[#8C8676]">
                        Want to check a hotel request?{" "}
                        <Link to="/hotelStatus" className="font-medium text-[#1B2537] hover:text-[#A2782E]">
                            Check Hotel Status
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckStatus;