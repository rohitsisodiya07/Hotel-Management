import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { signupApi } from "../api";
import {
  Hotel,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  FileText,
  Building2,
  KeyRound
} from "lucide-react";

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
  const [step, setStep] = useState(1); // Step 1: Details & Upload, Step 2: OTP Verification
  const [adminId, setAdminId] = useState("");
  const [otp, setOtp] = useState("");
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

  // Step 1: Send OTP to Email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (isEdit) {
      try {
        setSubmitting(true);
        const data = new FormData();
        Object.entries(formData).forEach(([key, val]) => {
          if (val !== null && val !== "") data.append(key, val);
        });
        const response = await axios.patch(`${signupApi}admin/updateRequest/${id}`, data);
        navigate("/checkStatus", { state: { statusMessage: response.data.message } });
      } catch (error) {
        setFormError(error.response?.data?.message || "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const allErrors = validateAll(formData);
    setTouched(
      Object.keys(initialForm).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) return;

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
      };

      const response = await axios.post(`${signupApi}admin/sendAdminSignupOtp`, payload);

      setAdminId(response.data.tempId);
      setFormSuccess(response.data.message || "OTP sent successfully to your email.");
      setStep(2); // Move to Step 2 (OTP Verification)
    } catch (error) {
      setFormError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Finalize Request (with Image upload)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!otp.trim()) {
      setFormError("Please enter the verification OTP");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append("adminId", adminId);
      data.append("otp", otp.trim());
      if (formData.profileImage) {
        data.append("profileImage", formData.profileImage);
      }

      const response = await axios.post(`${signupApi}admin/verifyAndCreateAdmin`, data);

      navigate("/checkStatus", { state: { statusMessage: response.data.message || "Request submitted successfully. Tracking ID sent to email." } });
    } catch (error) {
      setFormError(error.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (name) =>
    `w-full border pl-10 pr-3.5 h-11 rounded-xl text-xs font-medium outline-none transition-all bg-gray-50/50 text-gray-900 shadow-2xs ${errors[name] && touched[name]
      ? "border-rose-300 focus:border-rose-500 bg-rose-50/20"
      : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
    }`;

  const FieldError = ({ name }) =>
    errors[name] && touched[name] ? (
      <p id={`${name}-error`} role="alert" className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
        <AlertCircle size={12} />
        {errors[name]}
      </p>
    ) : null;

  if (loadingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={28} />
          <p className="text-gray-400 text-xs font-['IBM_Plex_Mono',monospace] uppercase tracking-wider font-semibold">Loading request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-['Inter',sans-serif] flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
            {step === 1 ? (isEdit ? "Update Request" : "Executive Access") : "Verification Required"}
          </span>
          <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 m-0 tracking-tight">
            {step === 1 ? (isEdit ? "Update Admin Request" : "Admin Registration") : "Verify Application OTP"}
          </h1>
          <p className="text-gray-500 text-xs mt-1 max-w-md mx-auto font-medium">
            {step === 1
              ? "Submit your management registration request. Once verified, credentials will be dispatched to your email."
              : `Enter the 6-digit verification code sent to ${formData.email} to generate your Tracking ID.`}
          </p>
        </div>

        {/* Success Alert */}
        {formSuccess && (
          <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs">
            <CheckCircle2 className="mt-0.5 shrink-0" size={14} />
            <span>{formSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {formError && (
          <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs">
            <AlertCircle className="mt-0.5 shrink-0" size={14} />
            <span>{formError}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name Field */}
            <div>
              <label htmlFor="admin-name" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="admin-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Enter your full name"
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

            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="name@example.com"
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

            {/* Mobile Field */}
            <div>
              <label htmlFor="admin-mobile" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="admin-mobile"
                  type="tel"
                  inputMode="numeric"
                  name="mobile"
                  maxLength={10}
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
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

            {/* Profile Image Field */}
            <div>
              <label htmlFor="admin-image" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                Profile Verification Image
              </label>

              <div className="flex items-center gap-3.5 p-2 bg-gray-50/60 border border-gray-200 rounded-2xl">
                <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={18} className="text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="admin-image"
                    className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all px-3.5 py-2 rounded-xl shadow-2xs"
                  >
                    <Upload size={13} />
                    {formData.profileImage ? "Change photo" : "Upload photo"}
                  </label>
                  {formData.profileImage && (
                    <p className="text-[11px] text-gray-500 truncate mt-1 font-medium">
                      {formData.profileImage.name}
                    </p>
                  )}
                </div>

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
              </div>

              <p className="text-[11px] text-gray-400 mt-1 pl-1 font-medium">
                JPG, PNG or WEBP format. Maximum file size {MAX_IMAGE_MB}MB.
              </p>
              <FieldError name="profileImage" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {submitting && <Loader2 className="animate-spin" size={15} />}
              {submitting
                ? isEdit
                  ? "Updating..."
                  : "Sending OTP..."
                : isEdit
                  ? "Update Request"
                  : "Continue & Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="admin-otp" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                Verification Code (OTP)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="admin-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border pl-10 pr-3.5 h-11 rounded-xl text-xs font-bold outline-none transition-all bg-gray-50/50 text-gray-900 border-gray-200 focus:border-blue-500 focus:bg-white tracking-widest shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {submitting && <Loader2 className="animate-spin" size={15} />}
              {submitting ? "Verifying..." : "Verify & Generate Tracking ID"}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtp(""); setFormError(""); }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-900 mt-3 font-medium transition cursor-pointer"
            >
              ← Back to application details
            </button>
          </form>
        )}

        {/* Simplified User & Login Navigation Footer */}
        <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col items-center justify-center gap-2 text-xs text-center">
          <p className="text-gray-500 font-medium">
            Looking for regular user account?{" "}
            <Link to="/signup" className="text-gray-900 font-bold hover:text-blue-600 underline underline-offset-4">
              Sign up as user
            </Link>
          </p>
          <p className="text-gray-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-gray-900 font-bold hover:text-blue-600 underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>

        {/* Sleek Vertical Status Tabs */}
        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/checkStatus"
            className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition shadow-2xs">
                <FileText size={15} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase font-bold">Tracker</p>
                <p className="text-xs font-bold text-gray-900">Check Admin Status</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            to="/hotelStatus"
            className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition shadow-2xs">
                <Building2 size={15} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase font-bold">Tracker</p>
                <p className="text-xs font-bold text-gray-900">Check Hotel Status</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignupAdmin;