import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "./api";

const ResetPassword = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});

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

        if (!formData.oldPassword.trim()) {
            newErrors.oldPassword =
                "Old Password is required";
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword =
                "New Password is required";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword =
                "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword =
                "Confirm Password is required";
        } else if (
            formData.newPassword !==
            formData.confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            const token =
                localStorage.getItem("token");

            const response = await axios.patch(
                `${signupApi}userSignup/resetPassword`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert(response.data.message);

            // Logout after password change
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="bg-gray-100 w-full max-w-md p-8 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Reset Password
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    Change your password securely
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>
                        <input
                            type="password"
                            name="oldPassword"
                            placeholder="Enter old password"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500"
                        />

                        {errors.oldPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.oldPassword}
                            </p>
                        )}
                    </div>


                    <div>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500"
                        />

                        {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.newPassword}
                            </p>
                        )}
                    </div>


                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
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
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 duration-300"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;