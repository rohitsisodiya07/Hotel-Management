import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { signupApi } from "../api";

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  profileImage: null,
};

const MAX_IMAGE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SignupAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(isEdit);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!id) return;

    const getAdmin = async () => {
      try {
        setLoadingAdmin(true);
        const response = await axios.get(`${signupApi}admin/${id}`);
        const admin = response.data.admin;

        setFormData({
          name: admin.name || "",
          email: admin.email || "",
          mobile: admin.mobile || "",
          profileImage: null,
        });

        if (admin.profileImage) {
          setImagePreview(admin.profileImage);
        }
      } catch (error) {
        setFormError(
          error.response?.data?.message || "Could not load the admin request."
        );
      } finally {
        setLoadingAdmin(false);
      }
    };

    getAdmin();
  }, [id]);

  // Revoke object URLs created for local file previews to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validateFile = (file) => {
    if (!file) return "";

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, PNG and WEBP files are allowed";
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return `File size should be less than ${MAX_IMAGE_MB} MB`;
    }

    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (!/^[A-Za-z\s.]+$/.test(value.trim())) return "Only letters are allowed";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email";
        return "";

      case "mobile":
        if (!value.trim()) return "Mobile number is required";
        if (!/^[6-9]\d{9}$/.test(value.trim())) return "Enter a valid mobile number";
        return "";

      case "profileImage":
        if (!value && !isEdit) return "Profile image is required";
        return validateFile(value);

      default:
        return "";
    }
  };

  const validateAll = (data) => {
    const newErrors = {};
    Object.keys(data).forEach((key) => {
      const error = validateField(key, data[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
      if (touched.mobile) {
        setErrors((prev) => ({ ...prev, mobile: validateField("mobile", digitsOnly) }));
      }
      return;
    }

    if (name === "profileImage") {
      const file = files[0] || null;
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setImagePreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return file ? URL.createObjectURL(file) : null;
      });
      if (touched.profileImage) {
        setErrors((prev) => ({ ...prev, profileImage: validateField("profileImage", file) }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
    if (formError) setFormError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const allErrors = validateAll(formData);
    setTouched(
      Object.keys(initialForm).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) return;

    try {
      setSubmitting(true);

      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== "") data.append(key, val);
      });

      const response = isEdit
        ? await axios.patch(`${signupApi}admin/updateRequest/${id}`, data)
        : await axios.post(`${signupApi}admin/create`, data);

      if (isEdit) {
        navigate("/checkStatus", { state: { statusMessage: response.data.message } });
      } else {
        setFormSuccess(response.data.message || "Request submitted successfully.");
        setFormData(initialForm);
        setErrors({});
        setTouched({});
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      setFormError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (name) =>
    `w-full border pl-10 pr-3.5 h-11 rounded text-[13px] outline-none transition-colors duration-150 ease-in-out bg-[#FCFBF7] text-[#232320] ${errors[name] && touched[name]
      ? "border-[#8E3B30] focus:border-[#8E3B30]"
      : "border-[#DEDBCF] focus:border-[#A2782E]"
    }`;

  const FieldError = ({ name }) =>
    errors[name] && touched[name] ? (
      <p id={`${name}-error`} role="alert" className="text-[12px] text-[#8E3B30] mt-1.5 flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        </svg>
        {errors[name]}
      </p>
    ) : null;

  if (loadingAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F4EF] flex items-center justify-center px-4 py-10">
        <p className="text-[#8C8676] text-[13px] font-['Inter',sans-serif]">Loading request…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4EF] bg-[radial-gradient(900px_420px_at_100%_-10%,rgba(31,42,68,0.05),transparent_60%)] font-['Inter',sans-serif] text-[#232320] flex items-center justify-center px-4 py-10">
      {/* Note: prefer moving this @import into a global stylesheet/index.html
                so it isn't re-injected on every mount. Left inline to preserve
                the original single-file structure. */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

      <div className="w-full max-w-2xl bg-white border border-[#E1DECF] rounded-md p-8 shadow-[0_1px_2px_rgba(30,28,20,0.03),0_12px_26px_-18px_rgba(30,28,20,0.18)]">
        <div className="text-center mb-8">
          <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.22em] text-[#A2782E] mt-0 mb-2.5">
            {isEdit ? "UPDATE REQUEST" : "ADMIN REGISTRATION"}
          </p>
          <h1 className="font-['Space_Grotesk',sans-serif] font-semibold text-[26px] tracking-[-0.01em] m-0 text-[#1B2537]">
            {isEdit ? "Update admin request" : "Admin registration"}
          </h1>
          <p className="text-[#8C8676] text-[13px] mt-2 mb-0">
            Submit your admin registration request. Once approved, login credentials
            will be sent to your email.
          </p>
        </div>

        {formSuccess && (
          <div
            role="status"
            className="mb-4 rounded border border-[#E4D2A0] bg-[#FBF6E9] text-[#7A5A1E] text-[13px] px-3.5 py-2.5 flex items-start gap-2"
          >
            <svg className="mt-[1px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {formSuccess}
          </div>
        )}

        {formError && (
          <div
            role="alert"
            className="mb-4 rounded border border-[#E7C9C3] bg-[#FBF0EE] text-[#8E3B30] text-[13px] px-3.5 py-2.5 flex items-start gap-2"
          >
            <svg className="mt-[1px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="admin-name" className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">
              Name
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39C89" strokeWidth="1.8">
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="admin-name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!(errors.name && touched.name)}
                aria-describedby={errors.name && touched.name ? "name-error" : undefined}
                className={fieldClass("name")}
              />
            </div>
            <FieldError name="name" />
          </div>

          <div>
            <label htmlFor="admin-email" className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">
              Email
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39C89" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 6 10-6" />
              </svg>
              <input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!(errors.email && touched.email)}
                aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                className={fieldClass("email")}
              />
            </div>
            <FieldError name="email" />
          </div>

          <div>
            <label htmlFor="admin-mobile" className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">
              Mobile number
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39C89" strokeWidth="1.8">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
              <input
                id="admin-mobile"
                type="tel"
                inputMode="numeric"
                name="mobile"
                maxLength={10}
                autoComplete="tel"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!(errors.mobile && touched.mobile)}
                aria-describedby={errors.mobile && touched.mobile ? "mobile-error" : undefined}
                className={fieldClass("mobile")}
              />
            </div>
            <FieldError name="mobile" />
          </div>

          <div>
            <label htmlFor="admin-image" className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">
              Profile image
            </label>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-[#DEDBCF] bg-[#FCFBF7] shrink-0 overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A39C89" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M21 16l-4.5-4.5a2 2 0 0 0-2.8 0L7 18" />
                  </svg>
                )}
              </div>

              <label
                htmlFor="admin-image"
                className="cursor-pointer text-[13px] font-medium text-[#1B2537] border border-[#DEDBCF] bg-[#FCFBF7] hover:border-[#A2782E] hover:text-[#A2782E] transition-colors duration-150 rounded px-3.5 h-11 flex items-center"
              >
                {formData.profileImage ? "Change file" : "Choose file"}
              </label>
              <input
                ref={fileInputRef}
                id="admin-image"
                type="file"
                name="profileImage"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!(errors.profileImage && touched.profileImage)}
                aria-describedby={errors.profileImage && touched.profileImage ? "profileImage-error" : undefined}
                className="sr-only"
              />

              {formData.profileImage && (
                <span className="text-[12.5px] text-[#8C8676] truncate">
                  {formData.profileImage.name}
                </span>
              )}
            </div>

            <p className="text-[11.5px] text-[#8C8676] mt-1.5">
              JPG, PNG or WEBP, up to {MAX_IMAGE_MB}MB.
            </p>
            <FieldError name="profileImage" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-[3px] font-['Inter',sans-serif] font-semibold text-[13.5px] bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {submitting && (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-9-9" />
              </svg>
            )}
            {submitting
              ? isEdit
                ? "Updating…"
                : "Submitting…"
              : isEdit
                ? "Update request"
                : "Submit request"}
          </button>
        </form>

        <div className="mt-6 border-t border-[#DEDBCF] pt-4 space-y-2">
          <p className="text-center text-[13px] text-[#8C8676]">
            New user?{" "}
            <Link to="/" className="text-[#1B2537] font-medium hover:text-[#A2782E]">
              Sign up as User
            </Link>
          </p>

          <p className="text-center text-[13px] text-[#8C8676]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#1B2537] font-medium hover:text-[#A2782E]">
              Log in
            </Link>
          </p>

          <p className="text-center text-[13px] text-[#8C8676]">
            Already submitted an admin request?{" "}
            <Link to="/checkStatus" className="text-[#1B2537] font-medium hover:text-[#A2782E]">
              Check Admin Status
            </Link>
          </p>

          <p className="text-center text-[13px] text-[#8C8676]">
            Already submitted a hotel request?{" "}
            <Link to="/hotelStatus" className="text-[#1B2537] font-medium hover:text-[#A2782E]">
              Check Hotel Status
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupAdmin;