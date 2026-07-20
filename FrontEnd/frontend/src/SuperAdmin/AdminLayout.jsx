import React from "react";
import {
    Link,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menu = [
        { name: "State", path: "state", scale: "lg" },
        { name: "District", path: "district", scale: "md" },
        { name: "City", path: "city", scale: "sm" },
        { name: "Hotels Request", path: "PendingHotels", scale: "sm" },
        { name: "Admin Request", path: "pendingAdmin", scale: "sm" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // dot size classes based on hierarchy scale
    const dotSize = { lg: "w-3 h-3", md: "w-2.5 h-2.5", sm: "w-2 h-2" };

    return (
        <div className="min-h-screen flex font-['Inter',sans-serif] bg-[#F5F4EF] bg-[radial-gradient(900px_420px_at_100%_-10%,rgba(31,42,68,0.05),transparent_60%)] text-[#232320]">
            {/* Google Fonts import (Tailwind has no built-in @import mechanism, so keep this) */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

            {/* Sidebar */}
            <div className="w-[288px] bg-white border-r border-[#E1DECF] flex flex-col justify-between flex-shrink-0 max-[900px]:w-full max-[900px]:flex-row max-[900px]:items-center max-[900px]:justify-between">
                <div>
                    {/* Brand */}
                    <div className="px-7 pt-8 pb-[26px] border-b border-[#E1DECF]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-[#1B2537] text-[#FFF9EC] font-['Space_Grotesk',sans-serif] text-base flex items-center justify-center">
                                A
                            </div>
                            <div>
                                <h1 className="font-['Space_Grotesk',sans-serif] text-[16.5px] font-semibold text-[#1B2537] m-0 tracking-[-0.01em]">
                                    Super Admin
                                </h1>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.18em] text-[#A2782E] mt-[3px] mb-0">
                                    HOTEL MANAGEMENT
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hierarchy Nav */}
                    <div className="px-7 pt-[30px] pb-4 max-[900px]:hidden">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.2em] text-[#A39C89] mb-[18px] mt-0">
                            LOCATION HIERARCHY
                        </p>
                        <div className="relative">
                            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#E1DECF]" />
                            <div className="flex flex-col gap-0.5">
                                {menu.map((item) => {
                                    const active = location.pathname === `/superAdmin/${item.path}`;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`relative flex items-center gap-4 py-[13px] pr-4 pl-0 border-l-2 rounded-r-md no-underline transition-all duration-150 ease-in-out hover:bg-[#FBFAF6] group ${active
                                                    ? "bg-[#FBF6E9] border-l-[#A2782E]"
                                                    : "border-l-transparent"
                                                }`}
                                        >
                                            <span
                                                className={`relative z-10 ml-[3px] rounded-full flex-shrink-0 transition-colors duration-150 ease-in-out ${dotSize[item.scale]} ${active
                                                        ? "!bg-[#A2782E]"
                                                        : "bg-[#D8D1C2] group-hover:bg-[#B8AF9C]"
                                                    }`}
                                            />
                                            <span
                                                className={`text-sm tracking-[0.01em] transition-colors duration-150 ease-in-out group-hover:text-[#1B2537] ${active
                                                        ? "text-[#1B2537] font-medium"
                                                        : "text-[#8C8676]"
                                                    }`}
                                            >
                                                {item.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[#E1DECF] max-[900px]:border-t-0 max-[900px]:p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full h-11 rounded-md text-[13px] font-medium tracking-[0.01em] bg-[#1B2537] text-[#FFF9EC] border-none cursor-pointer flex items-center justify-center gap-2 transition-colors duration-150 ease-in-out hover:bg-[#26314A]"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <path d="M16 17l5-5-5-5" />
                            <path d="M21 12H9" />
                        </svg>
                        Log out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-9 overflow-x-hidden">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.2em] text-[#A2782E] mb-2 mt-0">
                            OVERVIEW
                        </p>
                        <h1 className="font-['Space_Grotesk',sans-serif] text-[25px] font-semibold text-[#1B2537] m-0 tracking-[-0.01em]">
                            Welcome, Super Admin
                        </h1>
                        <p className="text-[#8C8676] mt-[6px] mb-0 text-[13.5px]">
                            Manage states, districts and cities from one place.
                        </p>
                    </div>

                    <div className="w-11 h-11 rounded-md bg-[#1B2537] text-[#FFF9EC] font-['IBM_Plex_Mono',monospace] text-[13px] font-medium border border-[#26314A] flex items-center justify-center">
                        A
                    </div>
                </div>

                {/* Outlet Container */}
                <div className="bg-white border border-[#E1DECF] rounded-[10px] p-7 min-h-[500px] shadow-[0_1px_2px_rgba(30,28,20,0.03),0_16px_34px_-22px_rgba(30,28,20,0.18)]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;