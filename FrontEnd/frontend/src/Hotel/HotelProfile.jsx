import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { Building2, Mail, Phone, MapPin, Edit3, Save, Info, Loader2, X, CheckSquare } from "lucide-react";
import { Toaster, toast } from "sonner";

const HotelProfile = () => {
  const token = localStorage.getItem("token");

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Data State
  const [profileData, setProfileData] = useState({
    hotelName: "",
    hotelEmail: "",
    phone: "",
    address: "",
    city: "",      // Yeh backend update ke liye ID store karega
    state: "",      // Display ke liye state name
    cityName: "",   // Display ke liye city name
    zipCode: "",
    description: "",
    status: "Pending"
  });

  useEffect(() => {
    fetchHotelProfile();
  }, []);

  const fetchHotelProfile = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${signupApi}hotel/particular-dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        const data = response.data.hotel;

        // Safely extract city and state details from the nested object
        const cityObj = data.city || {};
        const cityName = cityObj.cityName || "";
        const stateName = cityObj.districtId?.stateId?.stateName || "";
        const cityId = cityObj._id || "";

        setProfileData({
          hotelName: data.hotelName || "",
          hotelEmail: data.hotelEmail || "",
          phone: data.phone || "",
          address: data.address || "",
          city: cityId,
          cityName: cityName,
          state: stateName,
          zipCode: data.zipCode || "",
          description: data.description || "",
          status: data.status || "Pending"
        });
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      toast.error(error.response?.data?.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put(`${signupApi}hotel/update-profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        toast.success("Hotel profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-3 bg-gray-50/50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="font-['IBM_Plex_Mono',monospace] text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
          Loading Profile Identity...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-gray-800 font-['Inter',sans-serif] max-w-[1200px] mx-auto pb-12">
      <Toaster position="top-right" richColors />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>

      {/* Header & Status Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none"></div>

        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
            <Building2 size={30} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="font-['Space_Grotesk',sans-serif] font-bold text-xl sm:text-2xl text-gray-900 m-0 tracking-tight">
                {profileData.hotelName || "Your Hotel Name"}
              </h1>
              <span className={`px-2.5 py-1 text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-wider rounded-md border shadow-2xs ${profileData.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  profileData.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                {profileData.status}
              </span>
            </div>
            <p className="text-gray-500 text-xs font-medium m-0 flex items-center gap-1.5 capitalize">
              <MapPin size={13} className="text-blue-600" /> {profileData.cityName ? `${profileData.cityName}, ${profileData.state}` : "Location not updated"}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
          }}
          className={`z-10 h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs flex items-center gap-2 cursor-pointer ${isEditing
              ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
              : "bg-gray-900 hover:bg-gray-800 text-white"
            }`}
        >
          {isEditing ? <><X size={15} /> Cancel Edit</> : <><Edit3 size={15} /> Edit Profile</>}
        </button>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-6 sm:px-8 border-b border-gray-100 bg-gray-50/60">
          <span className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
            Configuration Matrix
          </span>
          <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-lg text-gray-900 m-0">
            Primary Identity & Contact
          </h2>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs">
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 flex items-center gap-1.5"><Building2 size={14} className="text-gray-400" /> Hotel Name</label>
              <input
                type="text" name="hotelName" value={profileData.hotelName} onChange={handleChange} disabled={!isEditing}
                className={`w-full border px-4 h-11 rounded-xl outline-none font-medium transition shadow-2xs ${isEditing ? "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" : "bg-gray-50/50 border-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> Registered Email</label>
              <input
                type="email" name="hotelEmail" value={profileData.hotelEmail} disabled={true}
                className="w-full bg-gray-50/50 border border-gray-200 px-4 h-11 rounded-xl outline-none text-gray-500 font-medium cursor-not-allowed shadow-2xs"
                title="Email address cannot be changed"
              />
            </div>
          </div>

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 flex items-center gap-1.5"><Phone size={14} className="text-gray-400" /> Phone Number</label>
              <input
                type="text" name="phone" value={profileData.phone} onChange={handleChange} disabled={!isEditing}
                className={`w-full border px-4 h-11 rounded-xl outline-none font-medium transition shadow-2xs ${isEditing ? "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" : "bg-gray-50/50 border-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5 flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> Full Address</label>
              <input
                type="text" name="address" value={profileData.address} onChange={handleChange} disabled={!isEditing}
                className={`w-full border px-4 h-11 rounded-xl outline-none font-medium transition shadow-2xs ${isEditing ? "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" : "bg-gray-50/50 border-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              />
            </div>
          </div>

          {/* Geography Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5">City</label>
              <input
                type="text" value={profileData.cityName} disabled={true}
                className="w-full bg-gray-50/50 border border-gray-200 px-4 h-11 rounded-xl outline-none text-gray-500 font-medium cursor-not-allowed shadow-2xs capitalize"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5">State</label>
              <input
                type="text" value={profileData.state} disabled={true}
                className="w-full bg-gray-50/50 border border-gray-200 px-4 h-11 rounded-xl outline-none text-gray-500 font-medium cursor-not-allowed shadow-2xs capitalize"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1.5">Zip / Postal Code</label>
              <input
                type="text" name="zipCode" value={profileData.zipCode} onChange={handleChange} disabled={!isEditing}
                className={`w-full border px-4 h-11 rounded-xl outline-none font-medium transition shadow-2xs ${isEditing ? "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" : "bg-gray-50/50 border-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              />
            </div>
          </div>

          {/* Description Area */}
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5 flex items-center gap-1.5"><Info size={14} className="text-gray-400" /> Property Overview / Description</label>
            <textarea
              name="description" rows="4" value={profileData.description} onChange={handleChange} disabled={!isEditing}
              placeholder="Write a brief description about your hotel facilities, nearby attractions, etc..."
              className={`w-full border p-4 rounded-xl outline-none font-medium transition shadow-2xs resize-none leading-relaxed ${isEditing ? "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" : "bg-gray-50/50 border-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            />
          </div>
        </div>

        {/* Footer Action Area (Only visible when editing) */}
        {isEditing && (
          <div className="p-5 sm:px-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-11 px-5 bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition hover:bg-gray-100 shadow-2xs cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-7 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-2xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default HotelProfile;