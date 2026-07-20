import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";

const PendingHotels = () => {
    const [activeTab, setActiveTab] = useState("pending");
    const [pendingHotels, setPendingHotels] = useState([]);
    const [rejectedHotels, setRejectedHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showApprove, setShowApprove] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showView, setShowView] = useState(false);

    const [selectedHotel, setSelectedHotel] = useState(null);
    const [viewHotel, setViewHotel] = useState(null);

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remark, setRemark] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        getPendingHotels();
        getRejectedHotels();
    }, []);

    const getPendingHotels = async () => {
        try {
            const response = await axios.get(`${signupApi}hotel/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingHotels(response.data.hotels || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const getRejectedHotels = async () => {
        try {
            const response = await axios.get(`${signupApi}hotel/rejected`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRejectedHotels(response.data.hotels || []);
        } catch (error) {
            console.log(error);
        }
    };

    const handleApprove = async () => {
        if (!password.trim()) {
            return alert("Password is required");
        }
        if (password.trim().length < 6) {
            return alert("Password must be at least 6 characters");
        }

        try {
            // Backend endpoint execution trigger path
            const response = await axios.patch(
                `${signupApi}hotel/approve/${selectedHotel._id}`,
                { password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(response.data.message || "Hotel approved and user credentials synchronised.");

            setPassword("");
            setShowApprove(false);
            setSelectedHotel(null);

            // Fetch dynamic records mapping updates from database servers instant loop reload
            getPendingHotels();
            getRejectedHotels();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong during data configuration sync.");
        }
    };

    const handleReject = async () => {
        if (!remark.trim()) {
            return alert("Remark is required");
        }

        try {
            const response = await axios.patch(
                `${signupApi}hotel/reject/${selectedHotel._id}`,
                { remark },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(response.data.message);

            setRemark("");
            setShowReject(false);
            setSelectedHotel(null);

            getPendingHotels();
            getRejectedHotels();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const hotels = activeTab === "pending" ? pendingHotels : rejectedHotels;

    const locationOf = (hotel) =>
        [
            hotel.city?.cityName,
            hotel.city?.districtId?.districtName,
            hotel.city?.districtId?.stateId?.stateName,
        ]
            .filter(Boolean)
            .join(", ");

    const initials = (name) =>
        (name || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join("");

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>
                <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-[#1B2537] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[#8C8676] font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider">Opening the registry…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="text-[#232320]">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

            <div className="max-w-[1200px] mx-auto">
                {/* Header Sub-Bar */}
                <div className="flex justify-between items-end gap-5 flex-wrap mb-8 pb-5 border-b border-[#E5E2D5]">
                    <div>
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.24em] text-[#A2782E] mt-0 mb-2 uppercase font-medium">
                            PARTNER ONBOARDING AUDIT
                        </p>
                        <h1 className="font-['Space_Grotesk',sans-serif] font-bold text-[26px] tracking-tight m-0 text-[#1B2537]">
                            Hotel Verification Requests
                        </h1>
                        <p className="text-[#8C8676] text-[13.5px] mt-1.5 mb-0 font-medium">
                            Review, validate credentials, and authorize hotel partner registration profiles.
                        </p>
                    </div>

                    <div className="border border-[#E5E2D5] bg-[#FCFBF9] rounded-[3px] px-5 py-3 text-right shadow-sm">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.14em] text-[#8C8676] uppercase font-medium mt-0 mb-1">
                            Total Submissions
                        </p>
                        <p className="font-['Space_Grotesk',sans-serif] text-[24px] font-bold text-[#A2782E] m-0 leading-none">
                            {pendingHotels.length + rejectedHotels.length}
                        </p>
                    </div>
                </div>

                {/* Status Navigation Tabs */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`font-['Space_Grotesk',sans-serif] text-[13.5px] font-semibold border border-transparent py-2 px-[18px] rounded-full cursor-pointer flex items-center gap-2 transition-all duration-150 ${activeTab === "pending"
                            ? "text-[#FFF9EC] bg-[#1B2537] shadow"
                            : "text-[#8C8676] bg-transparent hover:text-[#1B2537] hover:bg-[#FAF9F5]"
                            }`}
                    >
                        Pending Audit
                        <span className="font-['IBM_Plex_Mono',monospace] text-[11px] px-1.5 py-0.5 bg-[rgba(255,249,236,0.15)] rounded-[2px]">{pendingHotels.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("rejected")}
                        className={`font-['Space_Grotesk',sans-serif] text-[13.5px] font-semibold border border-transparent py-2 px-[18px] rounded-full cursor-pointer flex items-center gap-2 transition-all duration-150 ${activeTab === "rejected"
                            ? "text-[#FDF3F1] bg-[#8E3B30] shadow"
                            : "text-[#8C8676] bg-transparent hover:text-[#8E3B30] hover:bg-[#FFF8F7]"
                            }`}
                    >
                        Rejected List
                        <span className="font-['IBM_Plex_Mono',monospace] text-[11px] px-1.5 py-0.5 bg-[rgba(253,243,241,0.15)] rounded-[2px]">{rejectedHotels.length}</span>
                    </button>
                </div>

                {/* Hotels Matrix Cards Display */}
                {hotels.length === 0 ? (
                    <div className="border border-dashed border-[#E5E2D5] rounded-[3px] py-16 px-5 text-center text-[#8C8676] text-[13.5px] bg-[#FCFBF9]">
                        <p className="m-0 font-medium">No hotel submission entries discovered inside this module loop.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {hotels.map((hotel) => (
                            <div
                                key={hotel._id}
                                className="border border-[#E5E2D5] rounded-[3px] overflow-hidden bg-white shadow-[0_1px_3px_rgba(30,28,20,0.01)] hover:shadow-[0_4px_16px_rgba(30,28,20,0.04)] transition duration-200 flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="relative h-44 border-b border-[#E5E2D5] bg-[#FCFBF9] overflow-hidden">
                                        {hotel.hotelImages?.[0] ? (
                                            <img
                                                src={hotel.hotelImages[0]}
                                                alt={hotel.hotelName}
                                                className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#A2782E] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider">
                                                No Media Blueprint Attached
                                            </div>
                                        )}

                                        <span
                                            className={`absolute top-3.5 right-3.5 font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.14em] font-bold px-2.5 py-1 rounded-[2px] border ${activeTab === "rejected"
                                                ? "text-[#8E3B30] border-[#8E3B30]/30 bg-[#FFF8F7]"
                                                : "text-[#A2782E] border-[#A2782E]/30 bg-[#FFFDF9]"
                                                }`}
                                        >
                                            {activeTab === "pending" ? "PENDING" : "REJECTED"}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full border border-[#E5E2D5] flex-shrink-0 flex items-center justify-center bg-[#FCFBF9] text-[#1B2537] font-['Space_Grotesk',sans-serif] font-bold text-xs shadow-sm">
                                                {initials(hotel.adminId?.name) || "AD"}
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="text-[16px] font-bold text-[#1B2537] truncate m-0 font-['Space_Grotesk',sans-serif]">
                                                    {hotel.hotelName}
                                                </h2>
                                                <p className="text-[#8C8676] text-[12px] font-medium truncate mt-0.5 mb-0">
                                                    Admin · {hotel.adminId?.name || "System Manager"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-[13px] text-[#4A473D] border-t pt-3 border-[#FAF9F5]">
                                            <div className="flex justify-between truncate gap-2"><span className="text-[#8C8676]">Hotel Contact:</span> <span className="font-medium text-[#1B2537] truncate">{hotel.hotelEmail}</span></div>
                                            <div className="flex justify-between truncate gap-2"><span className="text-[#8C8676]">Admin Login:</span> <span className="font-medium text-[#1B2537] truncate">{hotel.adminId?.email}</span></div>
                                            <div className="flex justify-between items-start gap-4"><span className="text-[#8C8676] shrink-0">Region Mapping:</span> <span className="font-medium text-[#1B2537] text-right line-clamp-1">{locationOf(hotel) || "Not Mapped"}</span></div>
                                            <div className="flex justify-between"><span className="text-[#8C8676]">Class Specification:</span> <span className="font-['IBM_Plex_Mono',monospace] text-[11px] font-semibold text-[#A2782E] uppercase">{hotel.hotelType} · {hotel.totalRooms} Rooms</span></div>
                                        </div>

                                        <div className="mt-4 bg-[#FCFBF9] p-3 rounded-[2px] border border-[#FAF9F5]">
                                            <p className="text-[12.5px] text-[#8C8676] italic line-clamp-2 m-0 leading-relaxed">
                                                "{hotel.description || "No descriptions detailed."}"
                                            </p>
                                        </div>

                                        {activeTab === "rejected" && hotel.remark && (
                                            <div className="mt-3 text-[12.5px] text-[#8E3B30] bg-[#FFF8F7] border-l-2 border-[#8E3B30] py-2.5 px-3 rounded-r-[2px]">
                                                <span className="block font-['IBM_Plex_Mono',monospace] text-[9px] font-bold uppercase tracking-wider text-[#8E3B30] mb-0.5">
                                                    Audit Dismissal Reason
                                                </span>
                                                <p className="m-0 font-medium leading-normal">{hotel.remark}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 pt-0 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setViewHotel(hotel);
                                            setShowView(true);
                                        }}
                                        className="flex-1 font-medium py-2 rounded-[3px] text-xs border border-[#E5E2D5] bg-white text-[#4A473D] hover:bg-[#FCFBF9] transition"
                                    >
                                        Inspect
                                    </button>

                                    {activeTab === "pending" && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedHotel(hotel);
                                                    setShowApprove(true);
                                                }}
                                                className="flex-1 font-bold py-2 rounded-[3px] text-xs bg-[rgba(59,110,74,0.06)] border border-[rgba(59,110,74,0.25)] text-[#2F6F4E] hover:bg-[#2F6F4E] hover:text-white transition"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedHotel(hotel);
                                                    setShowReject(true);
                                                }}
                                                className="flex-1 font-bold py-2 rounded-[3px] text-xs bg-[rgba(142,59,48,0.06)] border border-[rgba(142,59,48,0.25)] text-[#8E3B30] hover:bg-[#8E3B30] hover:text-white transition"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approve Modal Frame */}
            {showApprove && (
                <div className="fixed inset-0 bg-[#1B2537]/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-[#E5E2D5] rounded-[3px] p-7 w-full max-w-[440px] shadow-[0_20px_40px_rgba(30,28,20,0.15)] animate-in fade-in zoom-in-95 duration-150">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.18em] text-[#A2782E] uppercase font-bold mt-0 mb-2">
                            AUTHORIZE PLATFORM CREDENTIALS
                        </p>
                        <h2 className="font-['Space_Grotesk',sans-serif] text-[20px] font-bold text-[#1B2537] mt-0 mb-1.5">
                            Approve {selectedHotel?.hotelName}
                        </h2>
                        <p className="text-[#8C8676] text-[13px] font-medium mt-0 mb-5 leading-normal">
                            Generate a system access security password to sync and register this admin credential payload.
                        </p>

                        <label className="block text-[11.5px] font-['IBM_Plex_Mono',monospace] text-[#8C8676] uppercase tracking-wide mb-1.5">Security Password</label>
                        <div className="relative mb-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 alphanumeric characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                className="w-full bg-white border border-[#E5E2D5] text-[#232320] text-[13.5px] rounded-[3px] outline-none pr-10 h-11 pl-3.5 focus:border-[#A2782E] font-medium transition"
                            />
                            <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8676] cursor-pointer hover:text-[#1B2537]"
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? (
                                    <svg width="15" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66" /><path d="M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" /></svg>
                                ) : (
                                    <svg width="15" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </span>
                        </div>

                        <div className="flex gap-2.5 mt-6 pt-4 border-t border-[#FCFBF9]">
                            <button
                                onClick={() => {
                                    setShowApprove(false);
                                    setPassword("");
                                }}
                                className="flex-1 font-medium rounded-[3px] border border-[#E5E2D5] bg-white text-[#4A473D] hover:bg-[#FCFBF9] text-xs py-2.5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex-1 font-bold rounded-[3px] bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A] text-xs py-2.5 transition"
                            >
                                Confirm Approval
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal Frame */}
            {showReject && (
                <div className="fixed inset-0 bg-[#1B2537]/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-[#E5E2D5] rounded-[3px] p-7 w-full max-w-[440px] shadow-[0_20px_40px_rgba(30,28,20,0.15)] animate-in fade-in zoom-in-95 duration-150">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.18em] text-[#8E3B30] uppercase font-bold mt-0 mb-2">
                            DISMISS REGISTRATION TASK
                        </p>
                        <h2 className="font-['Space_Grotesk',sans-serif] text-[20px] font-bold text-[#1B2537] mt-0 mb-1.5">
                            Reject {selectedHotel?.hotelName}
                        </h2>
                        <p className="text-[#8C8676] text-[13px] font-medium mt-0 mb-5 leading-normal">
                            Specify the technical or regulatory audit reason regarding why this partner is being denied.
                        </p>

                        <label className="block text-[11.5px] font-['IBM_Plex_Mono',monospace] text-[#8C8676] uppercase tracking-wide mb-1.5">Audit Remark Reason</label>
                        <textarea
                            rows={4}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="State detailed reason..."
                            autoFocus
                            className="w-full bg-white border border-[#E5E2D5] text-[#232320] text-[13.5px] rounded-[3px] outline-none p-3.5 resize-none transition focus:border-[#A2782E] font-medium font-sans"
                        />

                        <div className="flex gap-2.5 mt-6 pt-4 border-t border-[#FCFBF9]">
                            <button
                                onClick={() => {
                                    setShowReject(false);
                                    setRemark("");
                                }}
                                className="flex-1 font-medium rounded-[3px] border border-[#E5E2D5] bg-white text-[#4A473D] hover:bg-[#FCFBF9] text-xs py-2.5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 font-bold rounded-[3px] bg-[#8E3B30] text-[#FDF3F1] hover:bg-[#a14335] text-xs py-2.5 transition"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Inspection View Modal */}
            {showView && viewHotel && (
                <div className="fixed inset-0 bg-[#1B2537]/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-[#E5E2D5] rounded-[3px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_24px_48px_-12px_rgba(30,28,20,0.2)] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-[#E5E2D5] p-5 sticky top-0 bg-white/95 backdrop-blur z-10">
                            <div>
                                <h2 className="font-['Space_Grotesk',sans-serif] text-[18px] font-bold text-[#1B2537]">Listing Inspection Profile</h2>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#A2782E] mt-0.5 uppercase tracking-wider">MAPPED ADMIN LOG TRACK: {viewHotel.trackingId || "N/A"}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowView(false);
                                    setViewHotel(null);
                                }}
                                className="text-[#8C8676] hover:text-[#1B2537] text-[16px] w-7 h-7 bg-[#FCFBF9] rounded-[3px] border border-[#E5E2D5] flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        {viewHotel.hotelImages?.[0] && (
                            <img
                                src={viewHotel.hotelImages[0]}
                                alt={viewHotel.hotelName}
                                className="w-full h-64 object-cover border-b border-[#E5E2D5]"
                            />
                        )}

                        <div className="p-6 space-y-6 text-[13.5px]">
                            {/* Parameters Grid */}
                            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 bg-[#FCFBF9] rounded-[3px] border border-[#E5E2D5] p-5">
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Hotel Identity</p>
                                    <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-[#1B2537] text-[15px] mt-0.5">{viewHotel.hotelName}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Registered By (Admin)</p>
                                    <h3 className="font-semibold text-[#1B2537] mt-0.5">{viewHotel.adminId?.name || "System Manager"}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Hotel Email Link</p>
                                    <h3 className="font-medium text-[#4A473D] break-all mt-0.5">{viewHotel.hotelEmail}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Admin User Account Link</p>
                                    <h3 className="font-medium text-[#4A473D] break-all mt-0.5">{viewHotel.adminId?.email}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Accommodation Class</p>
                                    <h3 className="font-medium text-[#1B2537] mt-0.5">{viewHotel.hotelType}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Total Active Vault Rooms</p>
                                    <h3 className="font-bold text-[#A2782E] mt-0.5">{viewHotel.totalRooms} Rooms</h3>
                                </div>
                            </div>

                            {/* Regions Block */}
                            <div className="space-y-3.5">
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Geographic Region Mapping</p>
                                    <h3 className="font-medium text-[#1B2537] text-sm mt-0.5">{locationOf(viewHotel) || "No Region Connected"}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Physical Street Address</p>
                                    <h3 className="font-medium text-[#4A473D] bg-[#FCFBF9] rounded-[3px] p-3 border border-[#E5E2D5] mt-1 font-sans">{viewHotel.address}</h3>
                                </div>
                            </div>

                            {/* Infrastructure Amenities Tags */}
                            {viewHotel.amenities?.length > 0 && (
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider mb-2">Infrastructure Amenities Blueprint</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewHotel.amenities.map((item, idx) => (
                                            <span key={idx} className="bg-[rgba(162,120,46,0.05)] text-[#A2782E] text-[12px] px-2.5 py-1 rounded-[2px] border border-[rgba(162,120,46,0.12)] font-medium">
                                                ✓ {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Audit Rejection Layer Case */}
                            {viewHotel.remark && (
                                <div className="bg-[#FFF8F7] border border-[#8E3B30]/20 p-4 rounded-[3px]">
                                    <p className="text-[#8E3B30] font-['IBM_Plex_Mono',monospace] text-[10px] font-bold uppercase tracking-wider m-0">Audit Dismissal Log Remark</p>
                                    <p className="text-[#232320] font-medium text-[13px] mt-1.5 m-0 leading-relaxed">{viewHotel.remark}</p>
                                </div>
                            )}

                            {/* Description block layout */}
                            <div>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Establishment Overview Summary</p>
                                <p className="leading-relaxed text-[#4A473D] mt-1 bg-[#FCFBF9] p-4 rounded-[3px] border border-[#E5E2D5] italic m-0">
                                    "{viewHotel.description || "No descriptions specified."}"
                                </p>
                            </div>

                            <div className="mt-8 flex justify-end pt-4 border-t border-[#E5E2D5]">
                                <button
                                    onClick={() => {
                                        setShowView(false);
                                        setViewHotel(null);
                                    }}
                                    className="bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] px-6 py-2.5 text-xs font-semibold rounded-[3px] transition"
                                >
                                    Close Inspection Window
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingHotels;