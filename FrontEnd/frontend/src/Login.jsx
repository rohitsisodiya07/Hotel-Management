import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import axios from "axios";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const validate = () => {
        let newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            const response = await axios.post(`${signupApi}userSignup/login`, formData);

            // Save token
            localStorage.setItem("token", response.data.token);

            // Save user
            localStorage.setItem("user", JSON.stringify(response.data.user));

            alert(response.data.message);

            // Clear form
            setFormData({
                email: "",
                password: "",
            });

            // Role based navigation
            if (response.data.user.role === "superAdmin") {
                navigate("/superAdmin/state");
            } else {
                navigate("/user");
            }
        } catch (error) {
            console.log(error);

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
                <div className="text-center mb-8">
                    <div className="w-11 h-11 rounded-lg bg-[#201F19] flex items-center justify-center mx-auto mb-4">
                        <span className="font-mono text-[14px] font-medium text-[#F3EFE3]">A</span>
                    </div>
                    <h1 className="text-[22px] font-medium text-[#201F19] tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-[#8B8474] text-[13px] mt-1.5">
                        Log in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Email */}
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

                    {/* Password */}
                    <div>
                        <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39B8B" strokeWidth="1.8">
                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
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

                    <div className="text-right">
                        <Link to="/forgot" className="text-[12.5px] text-[#8B8474] font-medium hover:text-[#201F19] hover:underline transition-colors">
                            Forgot password?
                        </Link>
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
                        {loading ? "Logging in…" : "Log in"}
                    </button>
                </form>

                <p className="text-center mt-6 text-[13px] text-[#8B8474]">
                    Don't have an account?{" "}
                    <Link to="/" className="text-[#201F19] font-medium hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
