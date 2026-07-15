import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signupApi } from './api'
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();

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

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
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
            const response = await axios.post(
                `${signupApi}userSignup/login`,
                formData
            );

            // Save token
            localStorage.setItem(
                "token",
                response.data.token
            );

            // Save user
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            alert(response.data.message);

            // Clear form
            setFormData({
                email: "",
                password: "",
            });

            // Role based navigation
            if (
                response.data.user.role ===
                "superAdmin"
            ) {
                navigate("/superAdmin/state");
            } else {
                navigate("/user");
            }
        } catch (error) {
            console.log(error);

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
                    Welcome
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    Login to your account
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
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

                    {/* Password */}
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
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
                    <div className="text-right">
                        <Link
                            to="/forgot"
                            className="text-sm text-indigo-600 font-medium hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 duration-300 cursor-pointer"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        to="/"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;