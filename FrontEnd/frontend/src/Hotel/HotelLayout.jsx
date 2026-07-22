import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const HotelLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        console.error(error);
    }

    // Menu
    const menuItems = [
        { name: "Dashboard", path: "hotelDashboard" },
        { name: "All Rooms", path: "allRooms" },
        { name: "Profile", path: "hotelProfile" },
    ];

    // Logout
    const handleLogout = () => {
        if (window.confirm("Logout?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    // Initials
    const initials = (text) => {
        return (text || "").split(" ").filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join("");
    };

    return (
        <div className="min-h-screen flex bg-[#F7F6F0] font-['Inter',sans-serif]">

            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-[#E5E2D5] flex flex-col justify-between">

                {/* Top */}
                <div>
                    {/* Brand */}
                    <div className="p-8 border-b border-[#E5E2D5]">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#A2782E] rounded flex items-center justify-center text-white font-bold">
                                {initials(user?.name) || "H"}
                            </div>
                            <div>
                                <h2 className="font-bold text-[#1B2537]">{user?.name || "Hotel"}</h2>
                                <p className="text-[11px] uppercase tracking-widest text-[#A2782E]">Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="p-5">
                        <p className="text-[11px] uppercase text-gray-500 mb-3 px-4">Menu</p>
                        {menuItems.map((item) => {
                            const active = location.pathname.includes(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`block px-4 py-3 rounded mb-2 transition ${active ? "bg-[#A2782E] text-white" : "hover:bg-gray-100 text-gray-700"}`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-[#E5E2D5] p-5">
                    <Link to="/reset" className="block text-center border rounded py-2 mb-3 hover:bg-gray-50 text-sm">
                        Change Password
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-[#1B2537] hover:bg-red-700 text-white py-3 rounded cursor-pointer text-sm"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto p-8">

                {/* Header */}
                <div className="bg-white border border-[#E5E2D5] rounded p-6 mb-8">
                    <p className="text-xs uppercase tracking-widest text-[#A2782E]">Overview</p>
                    <h1 className="text-3xl font-bold mt-2">Welcome, {user?.name || "Hotel"}</h1>
                    <p className="text-gray-500 mt-2">Manage your hotel operations.</p>
                </div>

                {/* Outlet */}
                <div className="bg-white border border-[#E5E2D5] rounded p-6 min-h-[600px]">
                    <Outlet />
                </div>

            </main>
        </div>
    );
};

export default HotelLayout;