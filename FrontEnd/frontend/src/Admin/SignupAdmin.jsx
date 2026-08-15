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
import logo from '../assets/logo.png'

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  profileImage: null,
};

const MAX_IMAGE_MB = 1;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png"
];

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
      return "Only JPG, JPEG and PNG files are allowed";
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return "Image size should be less than 1 MB";
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
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 sm:p-6">

      {/* ================= MAIN CARD ================= */}
      <div className="w-full max-w-[1150px] min-h-[680px] bg-white rounded-[30px] overflow-hidden shadow-[0_25px_70px_rgba(15,23,42,0.12)] flex relative">

        {/* =====================================================
                LEFT BRAND SECTION
            ===================================================== */}
        <div className="hidden lg:flex w-[43%] relative bg-blue-600 text-white flex-col items-center justify-center px-12 overflow-hidden">

          {/* Decorative background */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-10 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl" />

          {/* Decorative dots */}
          <div className="absolute top-24 right-20 w-3 h-3 rounded-full bg-white/30" />
          <div className="absolute top-36 right-32 w-2 h-2 rounded-full bg-white/20" />
          <div className="absolute bottom-28 left-20 w-2 h-2 rounded-full bg-white/20" />

          {/* ================= BRAND CONTENT ================= */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center">

            <p className="text-[13px] uppercase tracking-[0.25em] font-semibold text-white/70 mb-7">
              Welcome to
            </p>

            {/* LOGO */}
            <div className="w-[250px] mb-9">
              <img
                src={logo}
                alt="AuraStay Logo"
                className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
              />
            </div>

            <h2 className="text-2xl font-bold mb-3">
              Manage with confidence.
            </h2>

            <p className="text-[14px] leading-6 max-w-[280px] text-white/80">
              Join AuraStay as a property administrator
              and manage your hotel with ease.
            </p>

            {/* Feature points */}
            <div className="mt-10 space-y-3 text-left">

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <ShieldCheck size={14} />
                </div>

                <span className="text-xs text-white/80">
                  Secure administrator access
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <Hotel size={14} />
                </div>

                <span className="text-xs text-white/80">
                  Manage your properties
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
                    CURVED RIGHT EDGE
                ================================================= */}
          <div className="absolute top-[3%] -right-5 w-14 h-24 bg-blue-600 rounded-full" />
          <div className="absolute top-[18%] -right-9 w-24 h-36 bg-blue-600 rounded-full" />
          <div className="absolute top-[40%] -right-7 w-20 h-32 bg-blue-600 rounded-full" />
          <div className="absolute top-[61%] -right-12 w-28 h-40 bg-blue-600 rounded-full" />
          <div className="absolute top-[82%] -right-5 w-16 h-24 bg-blue-600 rounded-full" />
          <div className="absolute -bottom-5 -right-4 w-20 h-28 bg-blue-600 rounded-full" />

        </div>


        {/* =====================================================
                RIGHT FORM SECTION
            ===================================================== */}
        <div className="w-full lg:w-[57%] flex items-center justify-center bg-white">

          <div className="w-full max-w-[470px] px-6 py-10 sm:px-10 lg:px-12">

            {/* ================= HEADER ================= */}
            <div className="mb-7">

              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-5">

                <div
                  className={`h-1.5 w-10 rounded-full ${step >= 1
                      ? "bg-blue-600"
                      : "bg-gray-200"
                    }`}
                />

                <div
                  className={`h-1.5 w-10 rounded-full ${step >= 2
                      ? "bg-blue-600"
                      : "bg-gray-200"
                    }`}
                />

                <span className="ml-1 text-[11px] font-semibold text-gray-400">
                  Step {step} of 2
                </span>

              </div>


              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-2">
                {step === 1
                  ? isEdit
                    ? "Update Request"
                    : "Property Management"
                  : "Email Verification"}
              </p>


              <h1 className="text-[32px] sm:text-[36px] font-extrabold tracking-tight text-gray-900">
                {step === 1
                  ? isEdit
                    ? "Update your request."
                    : "Become a partner."
                  : "Verify your email."}
              </h1>


              <p className="text-sm text-gray-500 mt-2 leading-6">
                {step === 1
                  ? "Submit your details to request administrator access to AuraStay."
                  : `Enter the 6-digit verification code sent to ${formData.email}.`}
              </p>

            </div>


            {/* =================================================
                        SUCCESS
                    ================================================= */}
            {formSuccess && (

              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 flex items-start gap-3">

                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">

                  <CheckCircle2
                    size={15}
                    className="text-emerald-600"
                  />

                </div>

                <p className="text-xs leading-5 text-emerald-800 font-medium">
                  {formSuccess}
                </p>

              </div>

            )}


            {/* =================================================
                        ERROR
                    ================================================= */}
            {formError && (

              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 flex items-start gap-3">

                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">

                  <AlertCircle
                    size={15}
                    className="text-rose-600"
                  />

                </div>

                <p className="text-xs leading-5 text-rose-700 font-medium">
                  {formError}
                </p>

              </div>

            )}


            {/* =================================================
                        STEP 1
                    ================================================= */}
            {step === 1 && (

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4"
              >

                {/* ================= NAME ================= */}
                <div>

                  <label
                    htmlFor="admin-name"
                    className="block text-xs font-bold text-gray-600 mb-2"
                  >
                    Full Name
                  </label>

                  <div className="relative">

                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={17}
                    />

                    <input
                      id="admin-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldClass("name")}
                    />

                  </div>

                  <FieldError name="name" />

                </div>


                {/* ================= EMAIL ================= */}
                <div>

                  <label
                    htmlFor="admin-email"
                    className="block text-xs font-bold text-gray-600 mb-2"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={17}
                    />

                    <input
                      id="admin-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldClass("email")}
                    />

                  </div>

                  <FieldError name="email" />

                </div>


                {/* ================= MOBILE ================= */}
                <div>

                  <label
                    htmlFor="admin-mobile"
                    className="block text-xs font-bold text-gray-600 mb-2"
                  >
                    Mobile Number
                  </label>

                  <div className="relative">

                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={17}
                    />

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
                      className={fieldClass("mobile")}
                    />

                  </div>

                  <FieldError name="mobile" />

                </div>


                {/* ================= PROFILE IMAGE ================= */}
                <div>

                  <label className="block text-xs font-bold text-gray-600 mb-2">
                    Profile Verification Image
                  </label>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">

                    <div className="flex items-center gap-4">

                      {/* Preview */}
                      <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">

                        {imagePreview ? (

                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <User
                            size={24}
                            className="text-gray-300"
                          />

                        )}

                      </div>


                      <div className="flex-1 min-w-0">

                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Upload your profile photo
                        </p>

                        <label
                          htmlFor="admin-image"
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-blue-600 hover:border-blue-400 transition cursor-pointer shadow-sm"
                        >

                          <Upload size={14} />

                          {formData.profileImage
                            ? "Change Photo"
                            : "Choose Photo"}

                        </label>

                        {formData.profileImage && (

                          <p className="text-[10px] text-gray-400 truncate mt-1.5">
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
                        className="sr-only"
                      />

                    </div>

                    <p className="text-[10px] text-gray-400 mt-2 ml-20">
                      JPG, JPEG or PNG • Maximum 1 MB
                    </p>

                  </div>

                  <FieldError name="profileImage" />

                </div>


                {/* ================= INFO ================= */}
                <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">

                  <div className="flex items-start gap-3">

                    <ShieldCheck
                      size={17}
                      className="text-blue-600 mt-0.5 shrink-0"
                    />

                    <p className="text-[11px] leading-5 text-blue-700">
                      Your request will be reviewed by the
                      Super Admin before administrator access
                      is granted.
                    </p>

                  </div>

                </div>


                {/* ================= BUTTON ================= */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="
                                    w-full
                                    h-[52px]
                                    rounded-xl
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    text-sm
                                    font-bold
                                    transition-all
                                    duration-300
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    shadow-[0_8px_20px_rgba(37,99,235,0.25)]
                                    hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)]
                                    hover:-translate-y-[1px]
                                    disabled:opacity-60
                                    disabled:cursor-not-allowed
                                    disabled:hover:translate-y-0
                                "
                >

                  {submitting && (
                    <Loader2
                      className="animate-spin"
                      size={17}
                    />
                  )}

                  {submitting
                    ? isEdit
                      ? "Updating..."
                      : "Sending OTP..."
                    : isEdit
                      ? "Update Request"
                      : "Continue & Send OTP"}

                  {!submitting && !isEdit && (
                    <ArrowRight size={17} />
                  )}

                </button>

              </form>

            )}


            {/* =================================================
                        STEP 2 — OTP
                    ================================================= */}
            {step === 2 && (

              <form
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >

                <div className="rounded-2xl bg-[#f7f8fc] border border-gray-100 p-6">

                  {/* OTP Icon */}
                  <div className="flex justify-center mb-5">

                    <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center">

                      <KeyRound
                        size={26}
                        className="text-blue-600"
                      />

                    </div>

                  </div>


                  <p className="text-center text-sm font-bold text-gray-800">
                    Verify your email
                  </p>

                  <p className="text-center text-xs text-gray-400 mt-1 mb-6">
                    We've sent a 6-digit code to
                    <br />
                    <span className="font-semibold text-gray-600">
                      {formData.email}
                    </span>
                  </p>


                  <label
                    htmlFor="admin-otp"
                    className="block text-xs font-bold text-gray-600 mb-2"
                  >
                    Verification Code
                  </label>

                  <div className="relative">

                    <KeyRound
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={17}
                    />

                    <input
                      id="admin-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value
                        )
                      }
                      className="
                                            w-full
                                            h-[54px]
                                            rounded-xl
                                            border
                                            border-gray-200
                                            bg-white
                                            pl-11
                                            pr-4
                                            text-center
                                            text-xl
                                            font-bold
                                            tracking-[0.5em]
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-500/10
                                        "
                    />

                  </div>

                </div>


                <button
                  type="submit"
                  disabled={submitting}
                  className="
                                    w-full
                                    h-[52px]
                                    rounded-xl
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    text-sm
                                    font-bold
                                    transition-all
                                    duration-300
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    shadow-[0_8px_20px_rgba(37,99,235,0.25)]
                                    hover:-translate-y-[1px]
                                    disabled:opacity-60
                                    disabled:cursor-not-allowed
                                "
                >

                  {submitting && (
                    <Loader2
                      className="animate-spin"
                      size={17}
                    />
                  )}

                  {submitting
                    ? "Verifying..."
                    : "Verify & Generate Tracking ID"}

                </button>


                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setFormError("");
                  }}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all"
                >
                  ← Back to application details
                </button>

              </form>

            )}


            {/* =================================================
                        FOOTER LINKS
                    ================================================= */}
            <div className="mt-7 pt-6 border-t border-gray-100 text-center">

              <p className="text-[13px] text-gray-500">

                Looking for a regular user account?{" "}

                <Link
                  to="/signup"
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4"
                >
                  Sign up as user
                </Link>

              </p>


              <p className="text-[13px] text-gray-500 mt-3">

                Already have an account?{" "}

                <Link
                  to="/login"
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4"
                >
                  Log in
                </Link>

              </p>

            </div>


            {/* =================================================
                        STATUS CARDS
                    ================================================= */}
            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Admin Status */}
              <Link
                to="/checkStatus"
                className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-all group"
              >

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
                    <FileText size={15} />
                  </div>

                  <div className="text-left">

                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                      Tracker
                    </p>

                    <p className="text-[11px] font-bold text-gray-900">
                      Admin Status
                    </p>

                  </div>

                </div>

                <ArrowRight
                  size={14}
                  className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition"
                />

              </Link>


              {/* Hotel Status */}
              <Link
                to="/hotelStatus"
                className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-all group"
              >

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
                    <Building2 size={15} />
                  </div>

                  <div className="text-left">

                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                      Tracker
                    </p>

                    <p className="text-[11px] font-bold text-gray-900">
                      Hotel Status
                    </p>

                  </div>

                </div>

                <ArrowRight
                  size={14}
                  className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition"
                />

              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SignupAdmin;