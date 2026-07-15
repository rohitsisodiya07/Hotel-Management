import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";

const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "OTP" },
    { n: 3, label: "New password" },
];

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
        `w-full border pl-10 pr-3.5 h-11 rounded-lg text-[13px] outline-none transition-all duration-150 bg-white ${errors[name]
            ? "border-[#C6564A] focus:border-[#C6564A] focus:ring-2 focus:ring-[#C6564A]/12"
            : "border-[#E3E0D4] focus:border-[#B3AC97] focus:ring-2 focus:ring-[#B3AC97]/15"
        }`;

    const FieldError = ({ name }) =>
        errors[name] ? (
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
            className="min-h-screen flex items-center justify-center px-4 font-sans"
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
          box-shadow: 0 1px 2px rgba(30,28,20,0.04), 0 12px 34px -14px rgba(30,28,20,0.14);
        }
        .icon-toggle { color: #A39B8B; transition: color .15s ease; cursor: pointer; }
        .icon-toggle:hover { color: #5A554C; }
      `}</style>

            <div className="reg-card w-full max-w-md p-8 rounded-2xl border border-[#E3E0D4]">
                <div className="text-center mb-7">
                    <div className="w-11 h-11 rounded-lg bg-[#201F19] flex items-center justify-center mx-auto mb-4">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F3EFE3" strokeWidth="1.8">
                            <rect x="3" y="11" width="18" height="10" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h1 className="text-[22px] font-medium text-[#201F19] tracking-tight">
                        Reset password
                    </h1>
                    <p className="text-[#8B8474] text-[13px] mt-1.5">
                        Reset your password securely
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-7">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.n}>
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-medium transition-colors duration-200"
                                    style={{
                                        background: step >= s.n ? "#201F19" : "#F3F1E6",
                                        color: step >= s.n ? "#F3EFE3" : "#A39B8B",
                                    }}
                                >
                                    {step > s.n ? (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                    ) : (
                                        s.n
                                    )}
                                </div>
                                <span className="text-[10px] text-[#A39B8B] tracking-wide">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div
                                    className="w-8 h-px mb-4"
                                    style={{ background: step > s.n ? "#201F19" : "#E3E0D4" }}
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
                                <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39B8B" strokeWidth="1.8">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="M2 7l10 6 10-6" />
                                    </svg>
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
                                className="w-full h-12 rounded-lg font-medium text-[14px] bg-[#201F19] text-[#F3EFE3] hover:bg-[#332F26] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading && (
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M21 12a9 9 0 1 1-9-9" />
                                    </svg>
                                )}
                                {loading ? "Sending OTP…" : "Send OTP"}
                            </button>
                        </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <>
                            <div>
                                <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                                    One-time code
                                </label>
                                <p className="text-[12px] text-[#A39B8B] mb-2">
                                    Sent to {formData.email}
                                </p>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full border border-[#E3E0D4] px-3.5 h-11 rounded-lg text-[15px] tracking-[0.3em] font-mono text-center outline-none focus:border-[#B3AC97] focus:ring-2 focus:ring-[#B3AC97]/15 transition-all duration-150 bg-white"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={loading}
                                className="w-full h-12 rounded-lg font-medium text-[14px] bg-[#201F19] text-[#F3EFE3] hover:bg-[#332F26] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading && (
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M21 12a9 9 0 1 1-9-9" />
                                    </svg>
                                )}
                                {loading ? "Verifying…" : "Verify OTP"}
                            </button>
                        </>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <>
                            <div>
                                <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                                    New password
                                </label>
                                <div className="relative">
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39B8B" strokeWidth="1.8">
                                        <rect x="3" y="11" width="18" height="10" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter new password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={fieldClass("password") + " pr-10"}
                                    />
                                    <span
                                        className="icon-toggle absolute right-3.5 top-1/2 -translate-y-1/2"
                                        onClick={() => setShowPassword((v) => !v)}
                                    >
                                        {showPassword ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" /></svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </span>
                                </div>
                                <FieldError name="password" />
                            </div>

                            <div>
                                <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                                    Confirm new password
                                </label>
                                <div className="relative">
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39B8B" strokeWidth="1.8">
                                        <rect x="3" y="11" width="18" height="10" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={fieldClass("confirmPassword") + " pr-10"}
                                    />
                                    <span
                                        className="icon-toggle absolute right-3.5 top-1/2 -translate-y-1/2"
                                        onClick={() => setShowConfirm((v) => !v)}
                                    >
                                        {showConfirm ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" /></svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </span>
                                </div>
                                <FieldError name="confirmPassword" />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-lg font-medium text-[14px] bg-[#201F19] text-[#F3EFE3] hover:bg-[#332F26] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading && (
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M21 12a9 9 0 1 1-9-9" />
                                    </svg>
                                )}
                                {loading ? "Resetting…" : "Reset password"}
                            </button>
                        </>
                    )}
                </form>

                <p className="text-center mt-6 text-[13px] text-[#8B8474]">
                    Remember your password?{" "}
                    <Link to="/login" className="text-[#201F19] font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
