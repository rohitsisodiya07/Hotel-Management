import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signupApi } from "../api";

const HotelDashboard = () => {
    const navigate = useNavigate();
    const [hotelData, setHotelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchParticularHotel = async () => {
            try {
                setLoading(true);
                setErrorMsg("");
                const token = localStorage.getItem("token");

                if (!token) {
                    setErrorMsg("Session expired. Please log in again.");
                    return;
                }

                const response = await axios.get(`${signupApi}hotel/particular-dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data?.success && response.data?.hotel) {
                    setHotelData(response.data.hotel);
                } else {
                    setErrorMsg("Failed to parse hotel profile metadata.");
                }
            } catch (err) {
                console.error("Dashboard API Fetch Error:", err);
                setErrorMsg(err.response?.data?.message || "Could not synchronize with database clusters.");
            } finally {
                setLoading(false);
            }
        };

        fetchParticularHotel();
    }, []);

    // Fallback safe array agar cloud storage images link ready na ho
    const sampleImages = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=400&auto=format&fit=crop"
    ];

    const finalImages = hotelData?.hotelImages?.length >= 3 ? hotelData.hotelImages : sampleImages;

    if (loading) {
        return (
            <div className="min-h-[350px] flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#1B2537] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#8C8676] font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider">Loading dashboard node…</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="border border-dashed border-[#8E3B30]/30 rounded-[3px] py-12 px-6 text-center text-[#8E3B30] bg-[#FFF8F7] max-w-lg mx-auto my-6">
                <h3 className="m-0 font-['Space_Grotesk',sans-serif] font-bold text-[16px] uppercase tracking-wide">Sync Interrupted</h3>
                <p className="m-0 mt-2 text-[13px] opacity-90">{errorMsg}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#1B2537] text-[#FFF9EC] text-[12px] font-bold uppercase rounded-[2px] cursor-pointer hover:bg-[#26314A]">
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-200 text-[#232320]">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>

            {/* Header Identity Row with Add Room Action Control */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E2D5] p-6 rounded-[3px] shadow-xs">
                <div>
                    <span className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.2em] text-[#A2782E] font-semibold uppercase block mb-1">
                        Active Workspace Node
                    </span>
                    <h1 className="font-['Space_Grotesk',sans-serif] font-bold text-2xl tracking-tight m-0 text-[#1B2537]">
                        {hotelData?.hotelName || "Hotel Console"}
                    </h1>
                </div>

                <button
                    onClick={() => navigate("/hotel/room")}
                    className="bg-[#A2782E] hover:bg-[#855F1E] active:scale-[0.98] text-[#FFF9EC] px-6 h-11 text-[13px] font-['Space_Grotesk',sans-serif] font-bold rounded-[3px] transition duration-150 uppercase tracking-wider whitespace-nowrap shadow-sm cursor-pointer self-stretch sm:self-auto text-center"
                >
                    + Add New Room
                </button>
            </div>

            {/* =========================================================================
                💥 SLEEK SIDE-BY-SIDE TRIPLE IMAGE GALLERY (Chhoti aur compact design)
               ========================================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {finalImages.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="h-44 rounded-[3px] overflow-hidden border border-[#E5E2D5] bg-[#FCFBF9] shadow-xs">
                        <img
                            src={img}
                            alt={`Asset view frame ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                ))}
            </div>

            {/* Core Blueprint & Data Grid Split */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Metrics Indicator Box: Total Capacity */}
                <div className="border border-[#E5E2D5] bg-white rounded-[3px] p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase font-bold tracking-wider m-0">Total Asset Rooms</p>
                        <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-[36px] tracking-tight text-[#1B2537] mt-2 m-0 leading-none">
                            {hotelData?.totalRooms || "0"}
                        </h3>
                    </div>
                    <span className="text-[11.5px] text-[#8C8676] mt-4 pt-3 border-t border-[#FAF9F5] block">
                        Registered platform allocation metrics.
                    </span>
                </div>

                {/* Secure Communication Endpoint Card */}
                <div className="border border-[#E5E2D5] bg-white rounded-[3px] p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase font-bold tracking-wider m-0">Contact Email Handle</p>
                        <h3 className="font-sans font-semibold text-[14.5px] text-[#1B2537] mt-3.5 m-0 break-all select-all selection:bg-[#E5E2D5]">
                            {hotelData?.hotelEmail || "No Email Bound"}
                        </h3>
                    </div>
                    <span className="text-[11.5px] text-[#A2782E] font-['IBM_Plex_Mono',monospace] uppercase text-[9.5px] tracking-wider font-bold mt-4 pt-3 border-t border-[#FAF9F5] block">
                        Verified Primary Contact
                    </span>
                </div>

                {/* Absolute Street Location Block */}
                <div className="border border-[#E5E2D5] bg-white rounded-[3px] p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase font-bold tracking-wider m-0">Physical Asset Street Address</p>
                        <p className="font-medium text-[#4A473D] text-[13px] mt-2 m-0 leading-relaxed font-sans line-clamp-3">
                            {hotelData?.address || "No target coordinates specifications defined."}
                        </p>
                    </div>
                </div>

            </div>

            {/* =========================================================================
                💥 ACTIVE AMENITIES DATA CHIPS BLOCK (Dynamic Render)
               ========================================================================= */}
            <div className="border border-[#E5E2D5] bg-white rounded-[3px] p-6 shadow-xs">
                <span className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase font-bold tracking-wider block mb-4 select-none">
                    Live Verified Amenities
                </span>

                {hotelData?.amenities?.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                        {hotelData.amenities.map((amenity, idx) => (
                            <span
                                key={idx}
                                className="bg-[rgba(162,120,46,0.04)] text-[#A2782E] text-[12.5px] font-medium px-3.5 py-1.5 rounded-[2px] border border-[rgba(162,120,46,0.12)] shadow-xs"
                            >
                                ✓ {amenity}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-[#8C8676] text-[13px] italic m-0">No specific features attached to this deployment node.</p>
                )}
            </div>

            {/* Infrastructure Property Description */}
            {hotelData?.description && (
                <div className="border border-[#E5E2D5] bg-white rounded-[3px] p-6 shadow-xs">
                    <span className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase font-bold tracking-wider block mb-2">Establishment Summary Specifications</span>
                    <p className="leading-relaxed text-[#4A473D] text-[13px] bg-[#FCFBF9] p-4 rounded-[3px] border border-[#E5E2D5] italic m-0">
                        "{hotelData.description}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default HotelDashboard;