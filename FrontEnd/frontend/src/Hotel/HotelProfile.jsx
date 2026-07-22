import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { Building2, Mail, Phone, MapPin, Edit3, Save, Info, Image as ImageIcon } from "lucide-react";

const HotelProfile = () => {
  const token = localStorage.getItem("token");

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile Data State
  const [profileData, setProfileData] = useState({
    hotelName: "",
    hotelEmail: "",
    phone: "",
    address: "",
    city: "",
    state: "",
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
     
      const response = await axios.get(`${signupApi}hotel/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        const data = response.data.hotel;
        setProfileData({
          hotelName: data.hotelName || "",
          hotelEmail: data.hotelEmail || "", 
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          description: data.description || "",
          status: data.status || "Pending"
        });
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
     
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      
      const response = await axios.put(`${signupApi}hotel/update-profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setMessage({ type: "success", text: "Hotel profile updated successfully!" });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#A2782E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#8C8676] font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider">Loading Profile Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-[#232320] max-w-5xl mx-auto">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>

      {/* Header & Status Banner */}
      <div className="bg-white border border-[#E5E2D5] rounded-[3px] p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[rgba(162,120,46,0.05)] to-transparent pointer-events-none"></div>

        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 bg-[#FCFBF9] border border-[#E5E2D5] rounded-[2px] flex items-center justify-center text-[#A2782E]">
            <Building2 size={32} strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-['Space_Grotesk',sans-serif] font-bold text-2xl text-[#1B2537] m-0">
                {profileData.hotelName || "Your Hotel Name"}
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-wider rounded-[2px] border ${profileData.status === "Approved" ? "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]" :
                  profileData.status === "Rejected" ? "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]" :
                    "bg-[#FFF8E1] text-[#F57F17] border-[#FFECB3]"
                }`}>
                {profileData.status}
              </span>
            </div>
            <p className="text-[#8C8676] text-[13px] font-medium m-0 flex items-center gap-1.5">
              <MapPin size={14} /> {profileData.city ? `${profileData.city}, ${profileData.state}` : "Location not updated"}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setMessage({ type: "", text: "" }); // Clear messages on toggle
          }}
          className={`z-10 px-5 py-2.5 rounded-[2px] text-[12px] font-bold uppercase tracking-wider transition flex items-center gap-2 ${isEditing
              ? "bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#616161] border border-[#E0E0E0]"
              : "bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC]"
            }`}
        >
          {isEditing ? "Cancel Edit" : <><Edit3 size={16} /> Edit Profile</>}
        </button>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 text-[13px] font-medium rounded-[2px] border ${message.type === "success" ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]" : "bg-[#FFF8F7] border-[#E7C9C3] text-[#8E3B30]"
          }`}>
          {message.type === "success" ? "✓" : "✕"} {message.text}
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E5E2D5] rounded-[3px] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#FAF9F5] bg-[#FCFBF9]/50">
          <span className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.2em] text-[#8C8676] font-bold uppercase block mb-1">
            Configuration Matrix
          </span>
          <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-lg text-[#1B2537] m-0">
            Primary Identity & Contact
          </h2>
        </div>

        <div className="p-8 space-y-6 text-[13px] font-medium">
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#4A473D] mb-1.5 flex items-center gap-1.5"><Building2 size={14} /> Hotel Name</label>
              <input
                type="text" name="hotelName" value={profileData.hotelName} onChange={handleChange} disabled={!isEditing}
                className="w-full border border-[#E1DECF] px-3 h-11 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] disabled:bg-[#FCFBF9] disabled:text-[#8C8676]"
              />
            </div>
            <div>
              <label className="block text-[#4A473D] mb-1.5 flex items-center gap-1.5"><Mail size={14} /> Registered Email</label>
              <input
                type="email" name="hotelEmail" value={profileData.hotelEmail} disabled={true} // Email usually shouldn't be changed directly
                className="w-full border border-[#E1DECF] px-3 h-11 rounded-[2px] outline-none bg-[#FCFBF9] text-[#8C8676] cursor-not-allowed"
                title="Email address cannot be changed"
              />
            </div>
          </div>

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#4A473D] mb-1.5 flex items-center gap-1.5"><Phone size={14} /> Phone Number</label>
              <input
                type="text" name="phone" value={profileData.phone} onChange={handleChange} disabled={!isEditing}
                className="w-full border border-[#E1DECF] px-3 h-11 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] disabled:bg-[#FCFBF9] disabled:text-[#8C8676]"
              />
            </div>
            <div>
              <label className="block text-[#4A473D] mb-1.5 flex items-center gap-1.5"><MapPin size={14} /> Full Address</label>
              <input
                type="text" name="address" value={profileData.address} onChange={handleChange} disabled={!isEditing}
                className="w-full border border-[#E1DECF] px-3 h-11 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] disabled:bg-[#FCFBF9] disabled:text-[#8C8676]"
              />
            </div>
          </div>

          {/* Geography Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-[#4A473D] mb-1.5">City</label>
              <input
                type="text" name="city" value={profileData.city} onChange={handleChange} disabled={!isEditing}
                className="w-full border border-[#E1DECF] px-3 h-11 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] disabled:bg-[#FCFBF9] disabled:text-[#8C8676]"
              />
            </div>
            <div>
              <label className="block text-[#4A473D] mb-1.5">State</label>
              <input
                type="text" name="state" value={profileData.state} onChange={handleChange} disabled={!isEditing}
                className="w-full border border-[#E1DECF] px-3 h-11 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] disabled:bg-[#FCFBF9] disabled:text-[#8C8676]"
              />
            </div>
            <div>
              <label className="block text-[#4A473D] mb-1.5">Zip / Postal Code</label>
              <input
                type="text" name="zipCode" value={profileData.zipCode} onChange={handleChange} disabled={!isEditing}
                className="w-full border border-[#E1DECF] px-3 h-11 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] disabled:bg-[#FCFBF9] disabled:text-[#8C8676]"
              />
            </div>
          </div>

          {/* Description Area */}
          <div>
            <label className="block text-[#4A473D] mb-1.5 flex items-center gap-1.5"><Info size={14} /> Property Overview / Description</label>
            <textarea
              name="description" rows="4" value={profileData.description} onChange={handleChange} disabled={!isEditing}
              placeholder="Write a brief description about your hotel facilities, nearby attractions, etc..."
              className="w-full border border-[#E1DECF] p-4 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] disabled:bg-[#FCFBF9] disabled:text-[#8C8676] resize-none"
            />
          </div>
        </div>

        {/* Footer Action Area (Only visible when editing) */}
        {isEditing && (
          <div className="p-6 bg-[#FCFBF9] border-t border-[#E5E2D5] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-white border border-[#E1DECF] text-[#4A473D] text-[13px] font-bold rounded-[2px] transition hover:bg-gray-50 uppercase tracking-wider"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-w-[160px] h-11 bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] text-[13px] font-['Space_Grotesk',sans-serif] font-bold uppercase rounded-[2px] tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-[#FFF9EC] border-t-transparent rounded-full animate-spin"></div> : <Save size={16} />}
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default HotelProfile;