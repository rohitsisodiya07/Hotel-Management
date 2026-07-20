import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "../api";

const STATUS_STYLES = {
    Approved: "bg-[#E9F1E4] text-[#3F6B2E]",
    Rejected: "bg-[#FBF0EE] text-[#8E3B30]",
    Pending: "bg-[#FBF6E9] text-[#7A5A1E]",
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

    const fieldClass =
        "w-full border pl-10 pr-3.5 h-11 rounded text-[13px] outline-none transition-colors duration-150 ease-in-out bg-[#FCFBF7] text-[#232320] border-[#DEDBCF] focus:border-[#A2782E]";

    const handleCheckStatus = async (e) => {
        e.preventDefault();

        if (!trackingId.trim()) {
            setError("Please enter your Tracking ID");
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

    const status = normalizeStatus(hotel?.status);

    return (
        <div className="min-h-screen bg-[#F5F4EF] bg-[radial-gradient(900px_420px_at_100%_-10%,rgba(31,42,68,0.05),transparent_60%)] font-['Inter',sans-serif] text-[#232320] flex items-center justify-center px-4 py-10">
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
                        Check hotel request status
                    </h1>
                    <p className="text-[#8C8676] text-[13px] mt-2 mb-0">
                        Enter your tracking ID to check your hotel request.
                    </p>
                </div>

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

                {!hotel && (
                    <form onSubmit={handleCheckStatus} className="space-y-4">
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
                                    onChange={(e) => {
                                        setTrackingId(e.target.value);
                                        setError("");
                                    }}
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
                            {loading ? "Checking…" : "Check Status"}
                        </button>
                    </form>
                )}

                {hotel && (
                    <div className="mt-2 border border-[#E1DECF] rounded p-5 bg-[#FCFBF7]">
                        <h2 className="font-['Space_Grotesk',sans-serif] font-semibold text-[16px] text-[#1B2537] mb-4">
                            Hotel details
                        </h2>

                        <div className="space-y-2.5 text-[13.5px]">
                            <p>
                                <span className="text-[#8C8676]">Hotel Name: </span>
                                <span className="text-[#232320] font-medium">{hotel.hotelName}</span>
                            </p>

                            <p>
                                <span className="text-[#8C8676]">Owner: </span>
                                <span className="text-[#232320] font-medium">{hotel.ownerName}</span>
                            </p>

                            <p>
                                <span className="text-[#8C8676]">Email: </span>
                                <span className="text-[#232320] font-medium">{hotel.hotelEmail}</span>
                            </p>

                            <p>
                                <span className="text-[#8C8676]">Tracking ID: </span>
                                <span className="text-[#232320] font-medium">{hotel.trackingId}</span>
                            </p>

                            <p>
                                <span className="text-[#8C8676]">Created: </span>
                                <span className="text-[#232320] font-medium">
                                    {new Date(hotel.createdAt).toLocaleDateString()}
                                </span>
                            </p>

                            <p className="flex items-center gap-2">
                                <span className="text-[#8C8676]">Status:</span>
                                <span
                                    className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${STATUS_STYLES[status] || "bg-[#F0EEE4] text-[#8C8676]"
                                        }`}
                                >
                                    {status}
                                </span>
                            </p>

                            {status === "Rejected" && hotel.remark && (
                                <p>
                                    <span className="text-[#8C8676]">Remark: </span>
                                    <span className="text-[#232320] font-medium">{hotel.remark}</span>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setHotel(null);
                                setTrackingId("");
                            }}
                            className="w-full mt-5 h-11 rounded-[3px] font-['Inter',sans-serif] font-semibold text-[13.5px] bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A] transition-colors duration-150 ease-in-out cursor-pointer"
                        >
                            Check another Tracking ID
                        </button>
                    </div>
                )}

                <div className="mt-6 border-t border-[#DEDBCF] pt-4 space-y-2">
                    <p className="text-center text-[13px] text-[#8C8676]">
                        Want to check a user/admin request?{" "}
                        <Link to="/adminStatus" className="font-medium text-[#1B2537] hover:text-[#A2782E]">
                            Check Status
                        </Link>
                    </p>

                    <p className="text-center text-[13px] text-[#8C8676]">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-[#1B2537] hover:text-[#A2782E]">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckHotelStatus;