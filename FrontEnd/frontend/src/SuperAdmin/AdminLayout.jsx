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
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const dotSize = { lg: "w-3 h-3", md: "w-2.5 h-2.5", sm: "w-2 h-2" };

    return (
        <div className="min-h-screen flex bg-[#F6F3EC]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&display=swap');
                .font-display { font-family: 'Fraunces', serif; }
                .font-body { font-family: 'Inter', sans-serif; }
            `}</style>

            {/* Sidebar */}
            <div className="w-72 bg-white border-r border-[#EFEAE0] flex flex-col justify-between font-body">
                <div>
                    <div className="px-7 pt-8 pb-7 border-b border-[#EFEAE0]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1A1815] flex items-center justify-center">
                                <span className="text-[#C6A15B] font-display text-lg">A</span>
                            </div>
                            <div>
                                <h1 className="font-display text-xl tracking-wide text-[#26221D]">
                                    Super Admin
                                </h1>
                                <p className="text-[11px] uppercase tracking-[0.15em] text-[#A39B8B] mt-0.5">
                                    Hotel Management
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hierarchy Nav */}
                    <div className="px-7 pt-8 pb-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#A39B8B] mb-5">
                            Location Hierarchy
                        </p>
                        <div className="relative">
                            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#EFEAE0]" />
                            <div className="space-y-1">
                                {menu.map((item) => {
                                    const active = location.pathname === `/superAdmin/${item.path}`;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`relative flex items-center gap-4 pl-0 pr-4 py-3.5 rounded-r-lg group transition-all duration-200 ${active
                                                ? "bg-[#FAF8F3] border-l-2 border-[#C6A15B]"
                                                : "border-l-2 border-transparent hover:bg-[#FAF8F3]"
                                                }`}
                                        >
                                            <span
                                                className={`relative z-10 ml-[3px] rounded-full flex-shrink-0 transition-colors ${dotSize[item.scale]} ${active ? "bg-[#C6A15B]" : "bg-[#D8D1C2] group-hover:bg-[#B8AF9C]"
                                                    }`}
                                            />
                                            <span
                                                className={`text-[15px] tracking-wide transition-colors ${active ? "text-[#26221D] font-medium" : "text-[#8C8478] group-hover:text-[#26221D]"
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

                <div className="p-6 border-t border-[#EFEAE0]">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-lg font-medium text-sm tracking-wide bg-[#1A1815] text-[#C6A15B] hover:bg-[#26221D] transition-all duration-300 cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-9 font-body">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="font-display text-[28px] text-[#26221D]">
                            Welcome, Super Admin
                        </h1>
                        <p className="text-[#8C8478] mt-1 text-[15px]">
                            Manage states, districts and cities from one place.
                        </p>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-[#1A1815] text-[#C6A15B] font-display flex items-center justify-center text-lg border border-[#C6A15B]/30">
                        A
                    </div>
                </div>

                {/* Outlet Container */}
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(26,24,21,0.08)] border-t-2 border-[#C6A15B] p-7 min-h-[500px]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;