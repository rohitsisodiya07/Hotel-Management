import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const initialForm = {
  hotelName: "",
  ownerName: "",
  email: "",
  mobile: "",
  city: "",
  address: "",
  totalRooms: "",
  hotelType: "Hotel",
  description: "",
  hotelImage: null,
  ownerImage: null,
};

const MAX_IMAGE_MB = 5;

const SignupAdmin = () => {
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState(initialForm);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const isEdit = !!id;

  const fetchCities = async () => {
    try {
      const response = await axios.get(
        `${signupApi}city/active`
      );

      setCities(
        response.data.result || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getHotel = async () => {
    try {
      const response =
        await axios.get(
          `${signupApi}hotel/${id}`
        );

      const hotel =
        response.data.hotel;

      setFormData({
        hotelName:
          hotel.hotelName || "",
        ownerName:
          hotel.ownerName || "",
        email:
          hotel.email || "",
        mobile:
          hotel.mobile || "",
        city:
          hotel.city?._id ||
          hotel.city ||
          "",
        address:
          hotel.address || "",
        totalRooms:
          hotel.totalRooms || "",
        hotelType:
          hotel.hotelType ||
          "Hotel",
        description:
          hotel.description ||
          "",
        hotelImage: null,
        ownerImage: null,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (id) {
      getHotel();
    }
  }, [id]);

  //Validations
  const validateField = (name, value) => {
    switch (name) {
      case "hotelName":
        if (!value.trim()) return "Hotel name is required";
        if (value.trim().length < 3) return "Must be at least 3 characters";
        return "";

      case "ownerName":
        if (!value.trim()) return "Owner name is required";
        if (!/^[A-Za-z\s.]+$/.test(value.trim()))
          return "Only letters and spaces are allowed";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          return "Enter a valid email address";
        return "";

      case "mobile":
        if (!value.trim()) return "Mobile number is required";
        if (!/^[6-9]\d{9}$/.test(value.trim()))
          return "Enter a valid 10-digit mobile number";
        return "";

      case "city":
        if (!value) return "Please select a city";
        return "";

      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 8) return "Enter a more complete address";
        return "";

      case "totalRooms":
        if (!value) return "Total rooms is required";
        if (!Number.isInteger(Number(value)) || Number(value) <= 0)
          return "Enter a whole number greater than 0";
        return "";

      case "description":
        if (!value.trim()) return "A short description helps guests";
        if (value.trim().length < 20) return "At least 20 characters";
        return "";

      case "hotelImage":
        if (
          !value &&
          !isEdit
        )
          return "Hotel image is required";
        return "";

      case "ownerImage":
        if (
          !value &&
          !isEdit
        )
          return "Owner image is required";
        return "";
    }
  };

  const validateFile = (file) => {
    if (!file) return "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return "Use a JPG, PNG or WEBP file";
    if (file.size > MAX_IMAGE_MB * 1024 * 1024)
      return `File must be under ${MAX_IMAGE_MB}MB`;
    return "";
  };

  const validateAll = (data) => {
    const errors = {};

    Object.keys(initialForm).forEach(
      (key) => {
        const error = validateField(
          key,
          data[key]
        );

        if (error) {
          errors[key] = error;
        }
      }
    );

    const hotelImageError =
      validateFile(data.hotelImage);

    const ownerImageError =
      validateFile(data.ownerImage);

    if (hotelImageError) {
      errors.hotelImage =
        hotelImageError;
    }

    if (ownerImageError) {
      errors.ownerImage =
        ownerImageError;
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    const fieldValue = files
      ? files[0]
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (touched[name]) {
      let error = validateField(
        name,
        fieldValue
      );

      if (!error && files) {
        error = validateFile(
          fieldValue
        );
      }

      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } =
      e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    let error = validateField(
      name,
      value
    );

    if (
      !error &&
      (name === "hotelImage" ||
        name === "ownerImage")
    ) {
      error = validateFile(
        formData[name]
      );
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors =
      validateAll(formData);

    setErrors(allErrors);

    const touchedFields = {};

    Object.keys(initialForm).forEach(
      (key) => {
        touchedFields[key] = true;
      }
    );

    setTouched(touchedFields);

    if (
      Object.keys(allErrors)
        .length > 0
    ) {
      const firstErrorField =
        document.querySelector(
          '[data-invalid="true"]'
        );

      firstErrorField?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    try {
      setSubmitting(true);

      const data =
        new FormData();

      Object.keys(formData).forEach(
        (key) => {
          if (
            formData[key] !==
            null
          ) {
            data.append(
              key,
              formData[key]
            );
          }
        }
      );

      let response;

      if (isEdit) {
        response =
          await axios.patch(
            `${signupApi}hotel/updateRequest/${id}`,
            data
          );
      } else {
        response =
          await axios.post(
            `${signupApi}hotel/create`,
            data
          );
      }

      alert(
        response.data.message
      );

      if (isEdit) {
        navigate(
          "/checkStatus"
        );
      } else {
        setFormData(
          initialForm
        );
        setErrors({});
        setTouched({});
        setSubmitted(true);
      }
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data
          ?.message ||
        "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (name) => {
    const hasError =
      errors[name] &&
      touched[name];

    return `
    w-full
    border
    px-3.5
    h-11
    rounded-lg
    text-[13px]
    outline-none
    transition-all
    duration-150
    bg-white
    ${hasError
        ? "border-[#C6564A] focus:border-[#C6564A] focus:ring-2 focus:ring-[#C6564A]/12"
        : "border-[#E3E0D4] focus:border-[#B3AC97] focus:ring-2 focus:ring-[#B3AC97]/15"
      }
  `;
  };

  const FieldError = ({
    name,
  }) => {
    if (
      !errors[name] ||
      !touched[name]
    ) {
      return null;
    }
    return (
      <p className="text-[12px] text-[#C6564A] mt-1.5 flex items-center gap-1">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        </svg>

        {errors[name]}
      </p>
    );
  };
  errors[name] && touched[name] ? (
    <p className="text-[12px] text-[#C6564A] mt-1.5 flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </svg>
      {errors[name]}
    </p>
  ) : null;

  return (
    <div
      className="min-h-screen font-sans py-12 px-4"
      style={{
        background:
          "radial-gradient(1200px 480px at 8% -10%, #F3F1EA 0%, #ECE9DF 42%, #E6E2D5 100%)",
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
        .file-drop {
          border: 1px dashed #D8D1C2; border-radius: 10px;
          padding: 14px; display: flex; align-items: center; gap: 10px;
          background: #FAF8F2; cursor: pointer; transition: border-color .15s ease;
        }
        .file-drop:hover { border-color: #B3AC97; }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-7">
          <p className="font-mono text-[11px] tracking-[0.16em] text-[#9A927D] mb-1.5">
            PARTNER ONBOARDING
          </p>
          <h1 className="text-[24px] font-medium text-[#201F19] tracking-tight">
            {isEdit
              ? "Update Hotel Request"
              : "Hotel Registration"}
          </h1>
          <p className="text-[#8B8474] text-[13px] mt-1.5">
            Tell us about your property — our team reviews every request within 48 hours.
          </p>
        </div>

        {submitted && (
          <div className="reg-card border border-[#CFE3D3] bg-[#F3F8F4] rounded-xl px-4 py-3 mb-6 flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E6E4A" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <p className="text-[13px] text-[#3E6E4A]">
              Request submitted. We'll email you once it's reviewed.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="reg-card border border-[#E3E0D4] rounded-2xl p-7">
          {/* Hotel details */}
          <p className="font-mono text-[11px] tracking-[0.14em] text-[#9A927D] mb-4">
            HOTEL DETAILS
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div data-invalid={!!(errors.hotelName && touched.hotelName)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Hotel name
              </label>
              <input
                type="text"
                name="hotelName"
                placeholder="e.g. The Zenith Palace"
                value={formData.hotelName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("hotelName")}
              />
              <FieldError name="hotelName" />
            </div>

            <div data-invalid={!!(errors.hotelType && touched.hotelType)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Property type
              </label>
              <select
                name="hotelType"
                value={formData.hotelType}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("hotelType") + " cursor-pointer"}
              >
                <option value="Hotel">Hotel</option>
                <option value="Resort">Resort</option>
                <option value="Hostel">Hostel</option>
                <option value="Guest House">Guest House</option>
              </select>
            </div>

            <div data-invalid={!!(errors.city && touched.city)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("city") + " cursor-pointer"}
              >
                <option value="">Select city</option>
                {cities.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.cityName}
                  </option>
                ))}
              </select>
              <FieldError name="city" />
            </div>

            <div data-invalid={!!(errors.totalRooms && touched.totalRooms)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Total rooms
              </label>
              <input
                type="number"
                name="totalRooms"
                placeholder="e.g. 24"
                min="1"
                value={formData.totalRooms}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("totalRooms")}
              />
              <FieldError name="totalRooms" />
            </div>

            <div className="md:col-span-2" data-invalid={!!(errors.address && touched.address)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="Street, area, landmark"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("address")}
              />
              <FieldError name="address" />
            </div>

            <div className="md:col-span-2" data-invalid={!!(errors.description && touched.description)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5 flex justify-between">
                <span>Description</span>
                <span className="font-mono text-[11px] text-[#B3AC97]">
                  {formData.description.trim().length} chars
                </span>
              </label>
              <textarea
                name="description"
                placeholder="What makes your property worth staying at?"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="4"
                className={fieldClass("description") + " h-auto py-2.5 resize-none"}
              />
              <FieldError name="description" />
            </div>
          </div>

          {/* Owner details */}
          <p className="font-mono text-[11px] tracking-[0.14em] text-[#9A927D] mb-4">
            OWNER DETAILS
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div data-invalid={!!(errors.ownerName && touched.ownerName)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Owner name
              </label>
              <input
                type="text"
                name="ownerName"
                placeholder="Full name"
                value={formData.ownerName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("ownerName")}
              />
              <FieldError name="ownerName" />
            </div>

            <div data-invalid={!!(errors.mobile && touched.mobile)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Mobile number
              </label>
              <input
                type="text"
                name="mobile"
                placeholder="10-digit number"
                maxLength={10}
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("mobile")}
              />
              <FieldError name="mobile" />
            </div>

            <div className="md:col-span-2" data-invalid={!!(errors.email && touched.email)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("email")}
              />
              <FieldError name="email" />
            </div>
          </div>

          {/* Media */}
          <p className="font-mono text-[11px] tracking-[0.14em] text-[#9A927D] mb-4">
            PHOTOS
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-7">
            <div data-invalid={!!(errors.hotelImage && touched.hotelImage)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Hotel image
              </label>
              <label className="file-drop">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B8474" strokeWidth="1.6" className="shrink-0">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M17 8l-5-5-5 5" />
                  <path d="M12 3v12" />
                </svg>
                <span className="text-[13px] text-[#5A554C] truncate">
                  {formData.hotelImage ? formData.hotelImage.name : "Upload JPG, PNG or WEBP"}
                </span>
                <input
                  type="file"
                  name="hotelImage"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="hidden"
                />
              </label>
              <FieldError name="hotelImage" />
            </div>

            <div data-invalid={!!(errors.ownerImage && touched.ownerImage)}>
              <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                Owner image
              </label>
              <label className="file-drop">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B8474" strokeWidth="1.6" className="shrink-0">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M17 8l-5-5-5 5" />
                  <path d="M12 3v12" />
                </svg>
                <span className="text-[13px] text-[#5A554C] truncate">
                  {formData.ownerImage ? formData.ownerImage.name : "Upload JPG, PNG or WEBP"}
                </span>
                <input
                  type="file"
                  name="ownerImage"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="hidden"
                />
              </label>
              <FieldError name="ownerImage" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-lg font-medium text-[14px] bg-[#201F19] text-[#F3EFE3] hover:bg-[#332F26] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-9-9" />
                </svg>

                {isEdit
                  ? "Updating..."
                  : "Submitting..."}
              </>
            ) : (
              isEdit
                ? "Update Request"
                : "Submit Request"
            )}
          </button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <p className="text-[13px] text-[#8B8474]">
            Want to create a normal account?{" "}
            <Link
              to="/"
              className="text-[#201F19] font-medium hover:underline"
            >
              Signup as User
            </Link>
          </p>

          <p className="text-[13px] text-[#8B8474]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#201F19] font-medium hover:underline"
            >
              Login
            </Link>
          </p>

          <p className="text-[13px] text-[#8B8474]">
            Want to track your request?{" "}
            <Link
              to="/checkStatus"
              className="text-[#201F19] font-medium hover:underline"
            >
              Check Request Status
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupAdmin;
