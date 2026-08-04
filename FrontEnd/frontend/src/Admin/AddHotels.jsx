import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupApi } from "../api";
import { UploadCloud, Loader2, ArrowLeft, Hotel, CheckSquare, CheckCircle2, X, Trash2 } from "lucide-react";

const AddHotels = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "{}");
  const isSuperAdmin = currentUser?.role === "superAdmin";

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [form, setForm] = useState({
    hotelName: "",
    hotelEmail: "",
    city: "",
    adminId: "",
    address: "",
    hotelType: "Hotel",
    totalRooms: "",
    description: "",
    amenities: [],
    hotelImages: [],
  });

  const amenitiesList = [
    "Free Wi-Fi",
    "Free Parking",
    "Valet Parking",
    "24/7 Front Desk",
    "Express Check-in",
    "Express Check-out",
    "Elevator/Lift",
    "Airport Shuttle",
    "Railway Station Pickup",
    "Taxi Service",
    "Car Rental",
    "Swimming Pool",
    "Indoor Pool",
    "Outdoor Pool",
    "Kids Pool",
    "Gym / Fitness Center",
    "Spa & Wellness Center",
    "Steam Room",
    "Sauna",
    "Yoga Center",
    "Restaurant",
    "Multi-Cuisine Restaurant",
    "Cafe",
    "Bar / Lounge",
    "Rooftop Restaurant",
    "Buffet Breakfast",
    "Complimentary Breakfast",
    "24/7 Room Service",
    "Laundry Service",
    "Dry Cleaning",
    "Ironing Service",
    "Business Center",
    "Conference Room",
    "Meeting Room",
    "Banquet Hall",
    "Wedding Venue",
    "Garden",
    "Terrace",
    "Kids Play Area",
    "Game Room",
    "Library",
    "BBQ Area",
    "Pet Friendly",
    "Wheelchair Accessible",
    "Family Friendly",
    "Non-Smoking Property",
    "Smoking Area",
    "Luggage Storage",
    "Concierge Service",
    "Travel Desk",
    "Tour Assistance",
    "Currency Exchange",
    "ATM",
    "Gift Shop",
    "Beauty Salon",
    "Medical Assistance",
    "Doctor On Call",
    "First Aid",
    "Power Backup",
    "CCTV Security",
    "Fire Safety",
    "Smoke Detectors",
    "24/7 Security",
    "EV Charging Station"
  ];

  const getApprovedAdmins = async () => {
    try {
      const response = await axios.get(`${signupApi}admin/approved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data.admins || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCities();
    if (isSuperAdmin) getApprovedAdmins();
    if (id) getHotelById();
  }, [id]);

  const getCities = async () => {
    try {
      const response = await axios.get(`${signupApi}city/active`);
      setCities(response.data.result || []);
    } catch (error) {
      console.error("Cities fetching error:", error);
    }
  };

  const getHotelById = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}hotel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const hotel = response.data.hotel;

      setForm({
        hotelName: hotel.hotelName || "",
        hotelEmail: hotel.hotelEmail || "",
        city: hotel.city?._id || hotel.city || "",
        adminId: hotel.adminId?._id || hotel.adminId || "",
        address: hotel.address || "",
        hotelType: hotel.hotelType || "Hotel",
        totalRooms: hotel.totalRooms || "",
        description: hotel.description || "",
        amenities: hotel.amenities || [],
        hotelImages: [],
      });

      if (hotel.hotelImages) {
        setPreviewImages(hotel.hotelImages);
      }
    } catch (error) {
      console.error("Fetch hotel error:", error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!form.hotelName.trim()) newErrors.hotelName = "Hotel Name is required";
    else if (form.hotelName.trim().length < 3) newErrors.hotelName = "Minimum 3 characters required";

    if (!form.hotelEmail.trim()) newErrors.hotelEmail = "Hotel Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.hotelEmail)) newErrors.hotelEmail = "Invalid Email format";

    if (!form.city) newErrors.city = "City selection is required";
    if (isSuperAdmin && !form.adminId) newErrors.adminId = "Admin assignment is required";

    if (!form.address.trim()) newErrors.address = "Address is required";
    else if (form.address.trim().length < 10) newErrors.address = "Provide a detailed address (min 10 chars)";

    if (!form.totalRooms) newErrors.totalRooms = "Total Rooms is required";
    else if (Number(form.totalRooms) <= 0) newErrors.totalRooms = "Must be a valid positive number";

    if (!form.description.trim()) newErrors.description = "Description is required";
    else if (form.description.trim().length < 20) newErrors.description = "Provide a meaningful description (min 20 chars)";

    if (form.amenities.length === 0) newErrors.amenities = "Select at least one amenity";

    if (!id && form.hotelImages.length < 3) newErrors.hotelImages = "Upload at least 3 property images";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAmenities = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setForm((prev) => ({ ...prev, amenities: [...prev.amenities, value] }));
    } else {
      setForm((prev) => ({ ...prev, amenities: prev.amenities.filter((item) => item !== value) }));
    }
    setErrors((prev) => ({ ...prev, amenities: "" }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (!id && files.length < 3) {
      setErrors((prev) => ({ ...prev, hotelImages: "Upload at least 3 property images" }));
      return;
    }

    setErrors((prev) => ({ ...prev, hotelImages: "" }));
    setForm((prev) => ({ ...prev, hotelImages: files }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index) => {
    const updatedImages = form.hotelImages.filter((_, i) => i !== index);
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, hotelImages: updatedImages }));
    setPreviewImages(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("hotelName", form.hotelName);
      formData.append("hotelEmail", form.hotelEmail);
      formData.append("city", form.city);
      if (isSuperAdmin) formData.append("adminId", form.adminId);
      formData.append("address", form.address);
      formData.append("hotelType", form.hotelType);
      formData.append("totalRooms", form.totalRooms);
      formData.append("description", form.description);

      form.amenities.forEach((item) => formData.append("amenities", item));
      form.hotelImages.forEach((image) => formData.append("hotelImages", image));

      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };
      let response;

      if (id) {
        response = await axios.patch(`${signupApi}hotel/update/${id}`, formData, { headers });
        setModalMessage(response.data.message || "Property updated successfully.");
      } else {
        response = await axios.post(`${signupApi}hotel/create`, formData, { headers });
        setModalMessage(response.data.message || "Property registered successfully.");
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate(isSuperAdmin ? "/superAdmin/dashboard" : "/admin/dashboard");
  };

  if (loading && id && !form.hotelName) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <h2 className="text-gray-500 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider font-semibold">
          Fetching Property Specifications...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto text-gray-800 font-['Inter',sans-serif] pb-12">
      <style>{`
        .custom-checkbox:checked {
          background-color: #2563EB;
          border-color: #2563EB;
        }
      `}</style>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-semibold text-xs transition cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 px-8 py-6 bg-gray-50/50">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Hotel size={18} className="text-blue-600" />
            <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest text-blue-600 uppercase m-0">
              {id ? "Edit Registered Profile" : "New Property Registration"}
            </p>
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-gray-900 m-0 tracking-tight">
            {id ? "Modify Property Details" : "Register Property Blueprint"}
          </h2>
          <p className="text-gray-500 text-xs mt-1 m-0 font-medium">
            Ensure all geographical and infrastructure parameters are accurately configured.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Hotel Name */}
            <div>
              <label className="block mb-2 text-xs font-bold text-gray-900">Property Name</label>
              <input
                type="text"
                name="hotelName"
                value={form.hotelName}
                onChange={handleChange}
                placeholder="e.g. Grand Vintage Resort"
                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs font-medium"
              />
              {errors.hotelName && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.hotelName}</p>}
            </div>

            {/* Hotel Email */}
            <div>
              <label className="block mb-2 text-xs font-bold text-gray-900">Contact Email</label>
              <input
                type="email"
                name="hotelEmail"
                value={form.hotelEmail}
                onChange={handleChange}
                placeholder="e.g. reservations@hotel.com"
                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs font-medium"
              />
              {errors.hotelEmail && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.hotelEmail}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block mb-2 text-xs font-bold text-gray-900">Jurisdiction City</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs text-gray-700 font-semibold cursor-pointer"
              >
                <option value="">Select Target City</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>{city.cityName}</option>
                ))}
              </select>
              {errors.city && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.city}</p>}
            </div>

            {/* Admin Assignment (SuperAdmin Only) */}
            {isSuperAdmin && (
              <div>
                <label className="block mb-2 text-xs font-bold text-gray-900">System Admin Assignment</label>
                <select
                  name="adminId"
                  value={form.adminId}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs text-gray-700 font-semibold cursor-pointer"
                >
                  <option value="">Select Target Admin</option>
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>{admin.name}</option>
                  ))}
                </select>
                {errors.adminId && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.adminId}</p>}
              </div>
            )}

            {/* Hotel Type */}
            <div>
              <label className="block mb-2 text-xs font-bold text-gray-900">Establishment Class</label>
              <select
                name="hotelType"
                value={form.hotelType}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs text-gray-700 font-semibold cursor-pointer"
              >
                <option value="Hotel">Hotel</option>
                <option value="Resort">Resort</option>
                <option value="Guest House">Guest House</option>
                <option value="Hostel">Hostel</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            {/* Total Rooms */}
            <div>
              <label className="block mb-2 text-xs font-bold text-gray-900">Total Rooms</label>
              <input
                type="number"
                name="totalRooms"
                value={form.totalRooms}
                onChange={handleChange}
                placeholder="e.g. 50"
                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs font-medium"
              />
              {errors.totalRooms && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.totalRooms}</p>}
            </div>

            {/* Physical Address */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-xs font-bold text-gray-900">Physical Geographic Address</label>
              <textarea
                rows="2"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Complete street, landmarks, zip location..."
                className="w-full bg-white border border-gray-200 text-xs rounded-xl p-4 outline-none resize-none focus:border-blue-500 transition shadow-2xs font-medium"
              />
              {errors.address && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.address}</p>}
            </div>
          </div>

          <hr className="my-8 border-gray-100" />

          {/* Infrastructure Amenities Checklist */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare size={16} className="text-blue-600" />
              <label className="font-['Space_Grotesk'] font-bold text-base text-gray-900">
                Infrastructure Amenities
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-gray-50/50 border border-gray-200 p-6 rounded-xl shadow-2xs">
              {amenitiesList.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 text-xs font-medium text-gray-700 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    value={item}
                    checked={form.amenities.includes(item)}
                    onChange={handleAmenities}
                    className="custom-checkbox w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                  />
                  <span className="group-hover:text-gray-900 transition-colors">{item}</span>
                </label>
              ))}
            </div>
            {errors.amenities && <p className="text-rose-500 text-[11px] font-medium mt-2">✕ {errors.amenities}</p>}
          </div>

          <hr className="my-8 border-gray-100" />

          {/* Description Overview */}
          <div>
            <label className="block mb-2 text-xs font-bold text-gray-900">Establishment Profile Description</label>
            <textarea
              rows="4"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Provide a narrative brief regarding room standards, surroundings or architectural specialties..."
              className="w-full bg-white border border-gray-200 text-xs rounded-xl p-4 outline-none resize-none focus:border-blue-500 transition shadow-2xs leading-relaxed font-medium"
            />
            {errors.description && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.description}</p>}
          </div>

          <hr className="my-8 border-gray-100" />

          {/* Media Attachments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="font-['Space_Grotesk'] font-bold text-base text-gray-900">
                Media Gallery Attachments
              </label>
              {id && <span className="font-['IBM_Plex_Mono'] text-[10px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-bold tracking-wider">LEAVE EMPTY TO RETAIN EXISTING</span>}
            </div>

            <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-8 text-center hover:bg-gray-50 transition cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-xs font-bold text-gray-900">Click to browse or drag and drop images</p>
              <p className="text-[11px] text-gray-500 mt-1">Minimum 3 high-resolution property photos required</p>
            </div>
            {errors.hotelImages && <p className="text-rose-500 text-[11px] font-medium mt-2">✕ {errors.hotelImages}</p>}

            {/* Image Preview Grid */}
            {previewImages.length > 0 && (
              <div className="mt-6">
                <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-3">
                  Upload Blueprint Preview
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {previewImages.map((image, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-2xs bg-white relative group">
                      <img src={image} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      {!id && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto h-11 px-8 text-xs font-bold uppercase tracking-wider rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 transition shadow-2xs cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {id ? "Save Modifications" : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[400px] shadow-2xl text-center relative animate-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <CheckCircle2 size={28} />
            </div>

            <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.2em] text-blue-600 uppercase font-bold mb-1">
              SYSTEM NOTIFICATION
            </p>

            <h3 className="font-['Space_Grotesk',sans-serif] text-lg font-bold text-gray-900 mb-2">
              Successfully Synchronized!
            </h3>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed font-medium">
              {modalMessage}
            </p>

            <button
              onClick={handleCloseModal}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-2xs cursor-pointer"
            >
              Okay, Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddHotels;