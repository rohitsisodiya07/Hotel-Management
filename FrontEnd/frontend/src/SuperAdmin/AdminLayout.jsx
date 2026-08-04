import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Map,
    MapPin,
    Building,
    Building2,
    UserCog,
    ShieldCheck,
    LogOut,
    Bell,
    ChevronRight
} from "lucide-react";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuGroups = [
        {
            title: "GENERAL",
            items: [{ name: "Dashboard", path: "dashboard", icon: LayoutDashboard }]
        },
        {
            title: "LOCATION HIERARCHY",
            items: [
                { name: "State", path: "state", icon: Map },
                { name: "District", path: "district", icon: MapPin },
                { name: "City", path: "city", icon: Building },
            ]
        },
        {
            title: "REQUESTS",
            items: [
                { name: "Hotels Request", path: "pendingHotels", icon: Building2 },
                { name: "Admin Request", path: "pendingAdmin", icon: UserCog },
            ]
        }
    ];

    const handleLogout = () => {
        if (!window.confirm("Are you sure you want to end your session?")) return;
        localStorage.clear();
        navigate("/login");
    };

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        console.error("Error parsing user data:", error);
    }

    const initials = (name) => (name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

    const getPageTitle = () => {
        if (location.pathname.includes("dashboard")) return "Dashboard Overview";
        if (location.pathname.includes("state")) return "State Management";
        if (location.pathname.includes("district")) return "District Management";
        if (location.pathname.includes("city")) return "City Management";
        if (location.pathname.includes("pendingHotels")) return "Hotel Approvals";
        if (location.pathname.includes("pendingAdmin")) return "Admin Verification";
        return "Control Center";
    };

    return (
        <div className="min-h-screen flex font-['Inter',sans-serif] bg-gray-50 text-gray-800 selection:bg-blue-600 selection:text-white">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between flex-shrink-0 z-10 sticky top-0 h-screen shadow-2xs">
                <div>
                    {/* Brand */}
                    <div className="px-6 py-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center shadow-2xs">
                                {initials(user?.name) || "SA"}
                            </div>
                            <div>
                                <h1 className="font-['Space_Grotesk'] text-base font-bold text-gray-900 tracking-tight m-0">
                                    Super Admin
                                </h1>
                                <p className="font-['IBM_Plex_Mono'] text-[9px] font-bold tracking-[0.2em] text-blue-600 mt-0.5 m-0 uppercase">
                                    WORKSPACE
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Groups */}
                    <nav className="px-5 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-hide">
                        {menuGroups.map((group, idx) => (
                            <div key={idx}>
                                <p className="font-['IBM_Plex_Mono'] text-[10px] tracking-[0.15em] text-gray-400 mb-2.5 px-2 font-bold uppercase">
                                    {group.title}
                                </p>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const active = location.pathname.includes(item.path);
                                        const IconComponent = item.icon;

                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`relative flex items-center justify-between px-3 py-2.5 transition-all duration-200 rounded-xl group ${active
                                                        ? "bg-blue-600 text-white font-semibold shadow-2xs"
                                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconComponent size={17} className={`transition-colors ${active ? "text-white" : "text-gray-400 group-hover:text-gray-900"}`} />
                                                    <span className="text-xs font-semibold">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                {active && <ChevronRight size={14} className="text-white" />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100 flex flex-col gap-2.5 bg-gray-50/50">
                    <button
                        onClick={() => navigate("reset-password")}
                        className="w-full h-9 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer uppercase tracking-wider"
                    >
                        <ShieldCheck size={15} className="text-blue-600" />
                        Reset Password
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full h-9 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer uppercase tracking-wider"
                    >
                        <LogOut size={15} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-10 overflow-x-hidden flex flex-col bg-gray-50/50">
                {/* Header */}
                <header className="flex justify-between items-center mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs">
                    <div>
                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[0.2em] text-blue-600 mb-1 uppercase">
                            SYSTEM CONTROL NODE
                        </p>
                        <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-gray-900 tracking-tight m-0">
                            {getPageTitle()}
                        </h1>
                        <p className="text-gray-500 mt-1 text-xs m-0 font-medium">
                            Manage platform regions, review hotel submissions, and authorize admins.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 text-gray-500 hover:text-gray-900 transition rounded-xl bg-gray-50 border border-gray-200 hover:bg-white cursor-pointer shadow-2xs">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-900 m-0">
                                    {user?.name || "Super Admin"}
                                </p>
                                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">
                                    Super Workspace
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-['Space_Grotesk'] font-bold text-sm border border-gray-200 shadow-2xs flex items-center justify-center">
                                {initials(user?.name) || "SA"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Outlet */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 min-h-[500px] flex-1 shadow-2xs">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;