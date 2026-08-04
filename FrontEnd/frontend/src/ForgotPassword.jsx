import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import { Hotel, Mail, Lock, KeyRound, AlertCircle, Loader2, Check } from "lucide-react";

const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "OTP" },
    { n: 3, label: "New password" },
];

const EyeIcon = ({ open }) =>
    open ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" />
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setErrors({
            ...errors,
            [e.target.name]: "",
        });
    };

    const validatePassword = () => {
        let newErrors = {};

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm Password is required";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Send OTP
    const handleSendOtp = async () => {
        if (!formData.email.trim()) {
            setErrors({
                email: "Email is required",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(`${signupApi}userSignup/sendOtp`, {
                email: formData.email,
            });

            alert(response.data.message);
            setStep(2);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            alert("OTP is required");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(`${signupApi}userSignup/verifyOtp`, {
                email: formData.email,
                otp,
            });

            alert(response.data.message);
            setStep(3);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Reset Password
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword()) return;

        try {
            setLoading(true);

            const response = await axios.patch(
                `${signupApi}userSignup/forgotPassword`,
                formData
            );

            alert(response.data.message);

            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
            });

            setOtp("");
            setStep(1);

            navigate("/login");
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = (name) =>
        `w-full border pl-10 pr-3.5 h-11 rounded-xl text-xs font-medium outline-none transition-all bg-gray-50/50 text-gray-900 shadow-2xs ${errors[name]
            ? "border-rose-300 focus:border-rose-500 bg-rose-50/20"
            : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
        }`;

    const FieldError = ({ name }) =>
        errors[name] ? (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                {errors[name]}
            </p>
        ) : null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-['Inter',sans-serif] flex items-center justify-center px-4 py-12 relative overflow-hidden">

            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Hotel size={22} />
                    </div>
                    <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
                        Security Gateway
                    </span>
                    <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 m-0 tracking-tight">
                        Reset password
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-medium">
                        Reset your password securely
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.n}>
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center font-['IBM_Plex_Mono'] text-[11px] font-bold transition-all duration-200 shadow-2xs"
                                    style={{
                                        background: step >= s.n ? "#2563EB" : "#F3F4F6",
                                        color: step >= s.n ? "#FFFFFF" : "#9CA3AF",
                                    }}
                                >
                                    {step > s.n ? (
                                        <Check size={12} strokeWidth={3} />
                                    ) : (
                                        s.n
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div
                                    className="w-8 h-0.5 mb-5 rounded-full"
                                    style={{ background: step > s.n ? "#2563EB" : "#E5E7EB" }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* STEP 1 */}
                    {step === 1 && (
                        <>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={fieldClass("email")}
                                    />
                                </div>
                                <FieldError name="email" />
                            </div>

                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                            >
                                {loading && <Loader2 className="animate-spin" size={15} />}
                                {loading ? "Sending OTP…" : "Send OTP"}
                            </button>
                        </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                    Verification Code (OTP)
                                </label>
                                <p className="text-[11px] text-gray-400 mb-2 font-medium">
                                    Sent to {formData.email}
                                </p>
                                <div className="relative">
                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full border border-gray-200 pl-10 pr-3.5 h-11 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white tracking-widest bg-gray-50/50 shadow-2xs text-gray-900"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={loading}
                                className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                            >
                                {loading && <Loader2 className="animate-spin" size={15} />}
                                {loading ? "Verifying…" : "Verify OTP"}
                            </button>
                        </>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                    New password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter new password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={fieldClass("password") + " pr-10"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                    >
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                                <FieldError name="password" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                    Confirm new password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={fieldClass("confirmPassword") + " pr-10"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                    >
                                        <EyeIcon open={showConfirm} />
                                    </button>
                                </div>
                                <FieldError name="confirmPassword" />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                            >
                                {loading && <Loader2 className="animate-spin" size={15} />}
                                {loading ? "Resetting…" : "Reset password"}
                            </button>
                        </>
                    )}
                </form>

                <p className="text-center mt-6 text-xs text-gray-500 font-medium">
                    Remember your password?{" "}
                    <Link to="/login" className="text-gray-900 font-bold hover:text-blue-600 underline underline-offset-4">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;