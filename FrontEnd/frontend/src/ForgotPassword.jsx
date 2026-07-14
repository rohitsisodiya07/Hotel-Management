import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";

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
            newErrors.password =
                "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword =
                "Confirm Password is required";
        } else if (
            formData.password !==
            formData.confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match";
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

            const response = await axios.post(
                `${signupApi}userSignup/sendOtp`,
                {
                    email: formData.email,
                }
            );

            alert(response.data.message);
            setStep(2);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Something went wrong"
            );
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

            const response = await axios.post(
                `${signupApi}userSignup/verifyOtp`,
                {
                    email: formData.email,
                    otp,
                }
            );

            alert(response.data.message);
            setStep(3);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Something went wrong"
            );
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
            alert(
                error.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="bg-gray-100 w-full max-w-md p-8 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Forgot Password
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    Reset your password securely
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* STEP 1 */}
                    {step === 1 && (
                        <>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500"
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
                            >
                                {loading
                                    ? "Sending OTP..."
                                    : "Send OTP"}
                            </button>
                        </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500"
                            />

                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </button>
                        </>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <>
                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500"
                                />

                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500"
                                />

                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
                            >
                                {loading
                                    ? "Resetting..."
                                    : "Reset Password"}
                            </button>
                        </>
                    )}
                </form>

                <p className="text-center mt-6 text-gray-600">
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;