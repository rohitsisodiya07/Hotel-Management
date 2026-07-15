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
        <div
            className="min-h-screen flex font-sans"
            style={{
                background:
                    "radial-gradient(1400px 560px at 4% -12%, #F3F1EA 0%, #ECE9DF 45%, #E6E2D5 100%)",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Inter:wght@400;500;600&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .reg-card {
          background: #FFFEFB;
          box-shadow: 0 1px 2px rgba(30,28,20,0.04), 0 10px 30px -14px rgba(30,28,20,0.10);
        }
      `}</style>

            {/* Sidebar */}
            <div className="w-72 reg-card border-r border-[#E3E0D4] flex flex-col justify-between">
                <div>
                    <div className="px-7 pt-8 pb-7 border-b border-[#E3E0D4]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#201F19] flex items-center justify-center">
                                <span className="font-mono text-[13px] font-medium text-[#F3EFE3]">A</span>
                            </div>
                            <div>
                                <h1 className="text-[16px] font-medium text-[#201F19] tracking-tight">
                                    Super Admin
                                </h1>
                                <p className="font-mono text-[10px] tracking-[0.16em] text-[#9A927D] mt-0.5">
                                    HOTEL MANAGEMENT
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hierarchy Nav */}
                    <div className="px-7 pt-8 pb-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-[#9A927D] mb-5">
                            LOCATION HIERARCHY
                        </p>
                        <div className="relative">
                            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#E3E0D4]" />
                            <div className="space-y-1">
                                {menu.map((item) => {
                                    const active = location.pathname === `/superAdmin/${item.path}`;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`relative flex items-center gap-4 pl-0 pr-4 py-3.5 rounded-r-lg group transition-all duration-150 ${active
                                                    ? "bg-[#FAF8F2] border-l-2 border-[#201F19]"
                                                    : "border-l-2 border-transparent hover:bg-[#FAF8F2]"
                                                }`}
                                        >
                                            <span
                                                className={`relative z-10 ml-0.75 rounded-full shrink-0 transition-colors ${dotSize[item.scale]} ${active ? "bg-[#201F19]" : "bg-[#D8D1C2] group-hover:bg-[#B8AF9C]"
                                                    }`}
                                            />
                                            <span
                                                className={`text-[14px] tracking-wide transition-colors ${active ? "text-[#201F19] font-medium" : "text-[#8B8474] group-hover:text-[#201F19]"
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

                <div className="p-6 border-t border-[#E3E0D4]">
                    <button
                        onClick={handleLogout}
                        className="w-full h-11 rounded-lg font-medium text-[13px] tracking-wide bg-[#201F19] text-[#F3EFE3] hover:bg-[#332F26] transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
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
            <div className="flex-1 p-9">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.16em] text-[#9A927D] mb-1.5">
                            OVERVIEW
                        </p>
                        <h1 className="text-[24px] font-medium text-[#201F19] tracking-tight">
                            Welcome, Super Admin
                        </h1>
                        <p className="text-[#8B8474] mt-1 text-[14px]">
                            Manage states, districts and cities from one place.
                        </p>
                    </div>

                    <div className="w-11 h-11 rounded-lg bg-[#201F19] text-[#F3EFE3] font-mono flex items-center justify-center text-[13px] font-medium border border-[#332F26]">
                        A
                    </div>
                </div>

                {/* Outlet Container */}
                <div className="reg-card rounded-2xl border border-[#E3E0D4] p-7 min-h-[500px]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
