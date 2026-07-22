import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupApi } from "../api";

const AddHotels = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  console.log(">>>>id", id);
  

  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    hotelName: "",
    hotelEmail: "",
    city: "",
    address: "",
    hotelType: "Hotel",
    totalRooms: "",
    description: "",
    amenities: [],
    hotelImages: [],
  });

  const amenitiesList = [
    "Free WiFi", "Parking", "Elevator/Lift", "Airport Shuttle",
    "Swimming Pool", "Gym", "Spa", "Pet Friendly",
    "Restaurant", "Bar / Lounge", "Breakfast", "Room Service",
    "Laundry", "Air Conditioning", "Banquet Hall",
    "CCTV Security", "Power Backup"
  ];

  useEffect(() => {
    getCities();
    if (id) {
      getHotelById();
    }
  }, [id]);

  // Active Cities Data Fetching
  const getCities = async () => {
    try {
      const response = await axios.get(`${signupApi}city/active`);
      setCities(response.data.result || []);
    } catch (error) {
      console.error("Cities fetching error:", error);
    }
  };

  // Profile data fetch based on dynamic identity checking
  const getHotelById = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}hotel/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const hotel = response.data.hotel;

      setForm({
        hotelName: hotel.hotelName || "",
        hotelEmail: hotel.hotelEmail || "",
        
        city: hotel.city?._id || hotel.city || "",
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

    if (!form.hotelName.trim()) {
      newErrors.hotelName = "Hotel Name is required";
    } else if (form.hotelName.trim().length < 3) {
      newErrors.hotelName = "Minimum 3 characters required";
    }

    if (!form.hotelEmail.trim()) {
      newErrors.hotelEmail = "Hotel Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.hotelEmail)) {
      newErrors.hotelEmail = "Invalid Email";
    }

    if (!form.city) {
      newErrors.city = "City is required";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    } else if (form.address.trim().length < 10) {
      newErrors.address = "Minimum 10 characters required";
    }

    if (!form.totalRooms) {
      newErrors.totalRooms = "Total Rooms is required";
    } else if (Number(form.totalRooms) <= 0) {
      newErrors.totalRooms = "Total Rooms must be greater than 0";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 20) {
      newErrors.description = "Minimum 20 characters required";
    }

    if (form.amenities.length === 0) {
      newErrors.amenities = "Select at least one amenity";
    }

    
    if (!id && form.hotelImages.length < 3) {
      newErrors.hotelImages = "Please upload at least 3 hotel images";
    }

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
      setForm((prev) => ({
        ...prev,
        amenities: prev.amenities.filter((item) => item !== value),
      }));
    }
    setErrors((prev) => ({ ...prev, amenities: "" }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (!id && files.length < 3) {
      setErrors((prev) => ({
        ...prev,
        hotelImages: "Please upload at least 3 hotel images",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, hotelImages: "" }));
    setForm((prev) => ({ ...prev, hotelImages: files }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
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
      formData.append("address", form.address);
      formData.append("hotelType", form.hotelType);
      formData.append("totalRooms", form.totalRooms);
      formData.append("description", form.description);

      form.amenities.forEach((item) => formData.append("amenities", item));
      form.hotelImages.forEach((image) => formData.append("hotelImages", image));

      let response;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      if (id) {
        response = await axios.patch(`${signupApi}hotel/update/${id}`, formData, { headers });
        alert(response.data.message || "Hotel updated successfully.");
      } else {
        response = await axios.post(`${signupApi}hotel/create`, formData, { headers });
        alert(response.data.message || "Hotel created successfully.");
      }

      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && !form.hotelName) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#1B2537] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8C8676] uppercase tracking-wider">
            Fetching Specifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto text-[#232320]">
      <div className="bg-white rounded-[3px] border border-[#E1DECF] shadow-[0_1px_2px_rgba(30,28,20,0.02)]">
        <div className="border-b border-[#E1DECF] px-6 py-5">
          <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.22em] text-[#A2782E] mt-0 mb-2.5 uppercase">
            {id ? "EDIT REGISTERED RECORD" : "NEW PROPERTY REGISTRATION"}
          </p>
          <h2 className="font-['Space_Grotesk',sans-serif] text-[24px] font-semibold text-[#1B2537] m-0">
            {id ? "Modify Hotel Specifications" : "Register New Hotel Profile"}
          </h2>
          <p className="text-[#8C8676] text-[13.5px] mt-2 mb-0">
            Ensure all legal property configurations are correct before compilation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hotel Name */}
            <div>
              <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Hotel Name</label>
              <input
                type="text"
                name="hotelName"
                value={form.hotelName}
                onChange={handleChange}
                placeholder="e.g. Grand Vintage Resort"
                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition"
              />
              {errors.hotelName && (
                <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                  ✕ {errors.hotelName}
                </p>
              )}
            </div>

            {/* Hotel Email */}
            <div>
              <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Hotel Email Address</label>
              <input
                type="email"
                name="hotelEmail"
                value={form.hotelEmail}
                onChange={handleChange}
                placeholder="e.g. registration@hoteldomain.com"
                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition"
              />
              {errors.hotelEmail && (
                <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                  ✕ {errors.hotelEmail}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Jurisdiction City</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition text-[#4A473D]"
              >
                <option value="">Select Target City</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.cityName}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                  ✕ {errors.city}
                </p>
              )}
            </div>

            {/* Hotel Type */}
            <div>
              <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Establishment Class</label>
              <select
                name="hotelType"
                value={form.hotelType}
                onChange={handleChange}
                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition text-[#4A473D]"
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
              <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Total Vault Rooms</label>
              <input
                type="number"
                name="totalRooms"
                value={form.totalRooms}
                onChange={handleChange}
                placeholder="Number of rooms available"
                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition"
              />
              {errors.totalRooms && (
                <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                  ✕ {errors.totalRooms}
                </p>
              )}
            </div>

            {/* Physical Address */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Physical Geographic Address</label>
              <textarea
                rows="2"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Complete street, landmarks, zip location..."
                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none resize-none focus:border-[#A2782E] transition"
              />
              {errors.address && (
                <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                  ✕ {errors.address}
                </p>
              )}
            </div>
          </div>

          {/* Infrastructure Amenities Checklist */}
          <div>
            <label className="block mb-3 font-['Space_Grotesk',sans-serif] font-medium text-[14px] text-[#1B2537]">
              Available Infrastructure Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-[#FCFBF7] border border-[#E1DECF] p-4 rounded-[3px]">
              {amenitiesList.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2.5 text-[13px] text-[#4A473D] p-1.5 cursor-pointer select-none hover:text-[#A2782E] transition"
                >
                  <input
                    type="checkbox"
                    value={item}
                    checked={form.amenities.includes(item)}
                    onChange={handleAmenities}
                    className="w-4 h-4 accent-[#A2782E] border-[#E1DECF] rounded-[2px]"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            {errors.amenities && (
              <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-2">
                ✕ {errors.amenities}
              </p>
            )}
          </div>

          {/* Description Overview */}
          <div>
            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Establishment Profile Description</label>
            <textarea
              rows="4"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Narrative brief regarding room standards, surroundings or architectural specialties..."
              className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none resize-none focus:border-[#A2782E] transition"
            />
            {errors.description && (
              <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                ✕ {errors.description}
              </p>
            )}
          </div>

          {/* Media Attachments */}
          <div>
            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">
              Media Attachments {id && <span className="text-[#8C8676] text-xs font-normal">(Leave empty to retain existing)</span>}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="w-full bg-white border border-[#E1DECF] text-[13px] rounded-[3px] px-4 py-2.5 file:mr-4 file:py-1.5 file:px-3 file:rounded-[2px] file:border-0 file:bg-[#1B2537] file:text-[#FFF9EC] file:text-xs file:font-medium hover:file:bg-[#26314A] file:transition file:cursor-pointer"
            />
            {errors.hotelImages && (
              <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                ✕ {errors.hotelImages}
              </p>
            )}
          </div>

          {/* Preview Container Layer */}
          {previewImages.length > 0 && (
            <div className="pt-2">
              <label className="block mb-3 text-[12px] font-['IBM_Plex_Mono',monospace] text-[#8C8676] uppercase tracking-wider">
                Active Graphics Blueprint Preview
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {previewImages.map((image, index) => (
                  <div
                    key={index}
                    className="border border-[#E1DECF] rounded-[2px] overflow-hidden bg-[#FCFBF7] shadow-sm h-28"
                  >
                    <img
                      src={image}
                      alt="Blueprint Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layout Controls Submissions Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[#E1DECF]">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-2.5 text-[13px] font-medium rounded-[3px] border border-[#E1DECF] text-[#4A473D] hover:bg-[#FCFBF7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1B2537] text-[#FFF9EC] px-8 py-2.5 text-[13px] font-medium rounded-[3px] hover:bg-[#26314A] disabled:opacity-40 transition-colors"
            >
              {loading ? (id ? "Updating..." : "Submitting...") : id ? "Update Metadata" : "Compile Submission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHotels;