import React, { useState } from "react";
import { User, Mail, ShieldCheck, Fingerprint, Edit2, Save, X, Info, BadgeCheck } from "lucide-react";
import { Toaster, toast } from "sonner";

const Profile = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Profile payload parsing error:", error);
  }

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "Administrator",
    email: user?.email || "admin@system.com",
    role: user?.role || "admin",
  });

  const initials = (name) => (name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile details updated successfully.");
  };

  return (
    <div className="max-w-[1200px] mx-auto text-gray-800 font-['Inter',sans-serif] pb-12">
      <Toaster position="top-right" richColors />

      {/* Header Container */}
      <div className="mb-8">
        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold tracking-[0.2em] text-blue-600 mt-0 mb-2 uppercase">
          Identity Profile
        </p>
        <h2 className="font-['Space_Grotesk',sans-serif] text-2xl font-bold text-gray-900 m-0 tracking-tight">
          Account Specifications
        </h2>
        <p className="text-gray-500 text-xs mt-1.5 mb-0 font-medium">
          View your registered details and security authorization status.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">

        {/* Left Side: Avatar Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-2xs flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-['Space_Grotesk',sans-serif] font-bold shadow-sm border-4 border-white ring-1 ring-gray-200 select-none">
              {initials(formData.name) || "AD"}
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-2xs" title="Verified Account">
              <BadgeCheck size={16} />
            </div>
          </div>

          <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-lg text-gray-900 mt-5 mb-0 line-clamp-1">
            {formData.name}
          </h3>
          <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-blue-600 mt-1.5 mb-0 uppercase tracking-widest font-bold">
            {formData.role} account
          </p>

          <div className="w-full mt-8 pt-6 border-t border-gray-100 text-left space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <ShieldCheck size={16} className="text-gray-400" /> Auth Level
              </span>
              <span className="font-bold text-gray-900 bg-gray-50 px-2.5 py-1 border border-gray-200 rounded-md text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-wider">
                Level 1 Admin
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <BadgeCheck size={16} className="text-gray-400" /> Platform Status
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded-md text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Account Details Form Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-6 sm:p-8">
              <h4 className="font-['Space_Grotesk',sans-serif] text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> Personal Information
              </h4>

              <div className="grid sm:grid-cols-2 gap-6 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full border px-4 py-3 rounded-xl outline-none font-medium transition-all ${isEditing
                        ? "bg-white border-gray-200 text-gray-900 focus:border-blue-500 shadow-2xs"
                        : "bg-gray-50/50 border-transparent text-gray-600 cursor-not-allowed"
                      }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full bg-gray-50/50 border border-transparent px-4 py-3 rounded-xl outline-none text-gray-600 font-medium cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    System Role Access
                  </label>
                  <div className="w-full bg-gray-50/50 px-4 py-3 rounded-xl text-gray-700 font-['IBM_Plex_Mono',monospace] font-bold tracking-wider text-xs uppercase select-none border border-gray-200">
                    {formData.role}
                  </div>
                </div>

                {/* ID */}
                <div>
                  <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Session Identity ID
                  </label>
                  <div className="w-full bg-gray-50/50 px-4 py-3 rounded-xl text-gray-600 font-mono text-xs truncate select-none flex items-center gap-2 border border-gray-200">
                    <Fingerprint size={16} className="text-gray-400 shrink-0" />
                    {user?._id || "Unavailable node hash string"}
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Action Section */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
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
                    className="flex items-center gap-1.5 h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition shadow-2xs cursor-pointer"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-2xs cursor-pointer"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white h-10 px-6 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-2xs cursor-pointer"
                >
                  <Edit2 size={14} /> Modify Information
                </button>
              )}
            </div>
          </div>

          {/* Guidelines info card for system administrators */}
          <div className="bg-white border-l-4 border-l-blue-600 border border-gray-200 rounded-2xl p-6 flex gap-4 shadow-2xs">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h5 className="font-['Space_Grotesk',sans-serif] font-bold text-sm text-gray-900 m-0 mb-1">
                System Guidelines Notice
              </h5>
              <p className="text-gray-500 text-xs leading-relaxed m-0 font-medium">
                Security credentials and primary login routing strings are dynamically allocated by the Super Admin authority. To alter core account variables like your registered email or global authority roles, please generate a ticket directly matching your tracking console protocol keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;