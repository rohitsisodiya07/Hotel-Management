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

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  // Integrated Coupon Management options matching your structural layout routing blueprint
  const menu = [
    { name: "Dashboard", path: "dashboard" },
    { name: "Add Hotel", path: "addHotel" },
    { name: "Add Coupon", path: "addCoupon" },
    { name: "My Coupon", path: "myCoupon" },
    { name: "Profile", path: "profile" },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const initials = (name) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");

  return (
    <div className="min-h-screen flex bg-[#F7F6F0] bg-[radial-gradient(1000px_450px_at_100%_0%,rgba(162,120,46,0.04),transparent_60%)] font-['Inter',sans-serif] text-[#232320] antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

      {/* Sidebar - Premium Minimal Architecture */}
      <aside className="w-72 bg-white border-r border-[#E5E2D5] flex flex-col justify-between sticky top-0 h-screen shrink-0 shadow-[4px_0_24px_rgba(30,28,20,0.015)]">
        <div>
          {/* Logo Section */}
          <div className="p-8 border-b border-[#E5E2D5]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[3px] bg-[#1B2537] text-[#FFF9EC] flex items-center justify-center text-[15px] font-['Space_Grotesk',sans-serif] font-bold tracking-tight shadow-md select-none transform hover:scale-[1.02] transition duration-200">
                {initials(user?.name) || "A"}
              </div>

              <div>
                <h1 className="font-['Space_Grotesk',sans-serif] text-[16px] font-bold text-[#1B2537] leading-tight tracking-tight m-0">
                  Admin Core
                </h1>
                <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] font-medium tracking-[0.24em] text-[#A2782E] mt-0.5 mb-0 uppercase">
                  Management Console
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links Payload */}
          <div className="p-6 space-y-1">
            <p className="px-4 text-[10.5px] font-['IBM_Plex_Mono',monospace] text-[#8C8676] uppercase tracking-widest mb-3 select-none">Navigation</p>
            {menu.map((item) => {
              const active =
                location.pathname === `/admin/${item.path}` ||
                location.pathname.startsWith(`/admin/${item.path}/`);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block text-[13.5px] rounded-[3px] px-4 py-3 font-medium transition-all duration-200 ease-in-out border-l-2 ${active
                      ? "bg-[rgba(162,120,46,0.06)] text-[#1B2537] border-[#A2782E] pl-[14px]"
                      : "border-transparent text-[#8C8676] hover:bg-[#FAF9F5] hover:text-[#1B2537]"
                    }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Panel Settings Utility */}
        <div className="border-t border-[#E5E2D5] p-6 space-y-2 bg-[#FCFBF9]">
          <Link
            to="/reset"
            className="block text-[13.5px] rounded-[3px] px-4 py-2.5 font-medium text-[#4A473D] hover:bg-white hover:text-[#A2782E] hover:shadow-sm border border-transparent hover:border-[#E5E2D5] text-center transition-all duration-200"
          >
            Security & Password
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-[13px] font-bold tracking-wide rounded-[3px] bg-[#1B2537] py-3 text-[#FFF9EC] hover:bg-[#26314A] shadow-sm hover:shadow active:scale-[0.99] transition-all duration-150 text-center uppercase"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Container Viewport */}
      <main className="flex-1 p-8 lg:p-10 max-h-screen overflow-y-auto">
        {/* Universal Top Header Frame */}
        <div className="mb-8 flex items-center justify-between rounded-[3px] border border-[#E5E2D5] bg-white p-6 shadow-[0_2px_8px_rgba(30,28,20,0.02),0_16px_32px_-20px_rgba(30,28,20,0.12)]">
          <div>
            <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.24em] text-[#A2782E] font-medium mt-0 mb-2 uppercase">
              System Control Node
            </p>
            <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-[28px] tracking-tight text-[#1B2537] m-0">
              Welcome Back, {user?.name || "Administrator"}
            </h2>
            <p className="text-[#8C8676] text-[13.5px] mt-1.5 mb-0 font-medium">
              Monitor, audit entries, modify marketing configurations, and configure target business modules seamlessly.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-[3px] bg-[#1B2537] text-[15px] font-['Space_Grotesk',sans-serif] font-bold text-[#FFF9EC] shrink-0 shadow-md border border-[rgba(255,249,236,0.1)] select-none">
            {initials(user?.name) || "AD"}
          </div>
        </div>

        {/* Dynamic Nested Component Page Router Layer */}
        <div className="min-h-[calc(100vh-210px)] rounded-[3px] border border-[#E5E2D5] bg-white p-6 lg:p-8 shadow-[0_1px_4px_rgba(30,28,20,0.01)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;