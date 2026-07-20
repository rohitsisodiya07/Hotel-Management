import React, { useState } from "react";

const Profile = () => {
  // Local storage se current login user details extract kiye
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Profile payload parsing error:", error);
  }

  // Edit fields placeholder handler (Agar future me modify krna ho)
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "Administrator",
    email: user?.email || "admin@system.com",
    role: user?.role || "admin",
  });

  const initials = (name) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");

  return (
    <div className="max-w-4xl mx-auto text-[#232320]">
      {/* Header Container */}
      <div className="border-b border-[#E1DECF] pb-5 mb-8">
        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.22em] text-[#A2782E] mt-0 mb-2.5 uppercase">
          Identity Profile
        </p>
        <h2 className="font-['Space_Grotesk',sans-serif] text-[24px] font-semibold text-[#1B2537] m-0">
          Account Specifications
        </h2>
        <p className="text-[#8C8676] text-[13.5px] mt-1.5 mb-0">
          View your registered details and security authorization status.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Left Side: Avatar Panel */}
        <div className="bg-[#FCFBF7] border border-[#E1DECF] rounded-[3px] p-6 text-center shadow-[0_1px_2px_rgba(30,28,20,0.01)]">
          <div className="w-24 h-24 rounded-[3px] bg-[#1B2537] text-[#FFF9EC] flex items-center justify-center text-[26px] font-['Space_Grotesk',sans-serif] font-bold mx-auto shadow-md border border-[rgba(255,249,236,0.15)] select-none">
            {initials(formData.name) || "AD"}
          </div>

          <h3 className="font-['Space_Grotesk',sans-serif] font-semibold text-[17px] text-[#1B2537] mt-4 mb-0 line-clamp-1">
            {formData.name}
          </h3>

          <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] text-[#A2782E] mt-1 mb-0 uppercase tracking-wider font-semibold">
            {formData.role} account
          </p>

          <div className="mt-6 pt-5 border-t border-[#E1DECF] text-left space-y-3 text-[12.5px]">
            <div className="flex justify-between">
              <span className="text-[#8C8676]">Auth Level</span>
              <span className="font-medium text-[#1B2537] bg-white px-2 py-0.5 border border-[#E1DECF] rounded-[2px] text-[11px] font-['IBM_Plex_Mono',monospace]">Level 1 Admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8C8676]">Platform Status</span>
              <span className="font-medium text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 border border-[#C8E6C9] rounded-[2px] text-[11px] font-semibold">● Verified</span>
            </div>
          </div>
        </div>

        {/* Right Side: Account Details Form Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-[#E1DECF] rounded-[3px] p-6 shadow-[0_1px_2px_rgba(30,28,20,0.01)]">
            <h4 className="font-['Space_Grotesk',sans-serif] text-[15px] font-semibold text-[#1B2537] mb-5 border-b border-[#FCFBF7] pb-2">
              Personal Information
            </h4>

            <div className="grid sm:grid-cols-2 gap-5 text-[13.5px]">
              <div>
                <label className="block text-[12px] font-['IBM_Plex_Mono',monospace] text-[#8C8676] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FCFBF7] disabled:bg-[#FAF9F5] border border-[#E1DECF] px-3.5 py-2.5 rounded-[3px] outline-none text-[#232320] font-medium transition focus:border-[#A2782E] disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[12px] font-['IBM_Plex_Mono',monospace] text-[#8C8676] uppercase tracking-wider mb-1.5">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full bg-[#FAF9F5] border border-[#E1DECF] px-3.5 py-2.5 rounded-[3px] outline-none text-[#8C8676] font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[12px] font-['IBM_Plex_Mono',monospace] text-[#8C8676] uppercase tracking-wider mb-1.5">
                  System Role Access
                </label>
                <div className="w-full bg-[#FAF9F5] border border-[#E1DECF] px-3.5 py-2.5 rounded-[3px] text-[#8C8676] font-['IBM_Plex_Mono',monospace] tracking-wide text-[12.5px] uppercase select-none">
                  {formData.role}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-['IBM_Plex_Mono',monospace] text-[#8C8676] uppercase tracking-wider mb-1.5">
                  Session Identity ID
                </label>
                <div className="w-full bg-[#FAF9F5] border border-[#E1DECF] px-3.5 py-2.5 rounded-[3px] text-[#8C8676] font-mono text-[11.5px] truncate select-none">
                  {user?._id || "Unavailable node hash string"}
                </div>
              </div>
            </div>

            {/* Toggle Action Section */}
            <div className="mt-8 pt-5 border-t border-[#E1DECF] flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "Administrator",
                        email: user?.email || "admin@system.com",
                        role: user?.role || "admin",
                      });
                    }}
                    className="px-4 py-2 text-[13px] font-medium border border-[#E1DECF] rounded-[3px] text-[#4A473D] hover:bg-[#FCFBF7] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Yahan aap future me API calling laga sakte hain name update ke liye
                      setIsEditing(false);
                      alert("Changes saved locally. Syncing will occur on re-authentication.");
                    }}
                    className="bg-[#1B2537] text-[#FFF9EC] px-5 py-2 text-[13px] font-medium rounded-[3px] hover:bg-[#26314A] transition"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-white hover:bg-[#FCFBF7] border border-[#E1DECF] text-[#4A473D] px-5 py-2 text-[13px] font-medium rounded-[3px] transition"
                >
                  Modify Information
                </button>
              )}
            </div>
          </div>

          {/* Guidelines info card for system administrators */}
          <div className="bg-[#FCFBF7] border border-l-4 border-l-[#A2782E] border-[#E1DECF] rounded-[3px] p-5">
            <h5 className="font-['Space_Grotesk',sans-serif] font-semibold text-[14px] text-[#1B2537] m-0">
              System Guidelines Notice
            </h5>
            <p className="text-[#8C8676] text-[12.5px] leading-relaxed mt-1.5 mb-0">
              Security credentials and primary login routing strings are dynamically allocated by the Super Admin authority. To alter core account variables like your registered email or global authority roles, please generate a ticket directly matching your Tracking console protocol keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;