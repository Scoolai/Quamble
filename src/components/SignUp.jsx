import axios from "axios"
import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

// Fix: Remove trailing slash and quotes from the environment variable
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://3.110.46.79:5000").replace(/\/$/, '')

export default function SignUp() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "player",
        preference_1: "",
        preference_2: "",
        preference_3: "",
        preference_4: "",
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        // Basic validation
        if (formData.password !== formData.confirm_password) {
            setMessage("Passwords do not match")
            setMessageType("danger")
            setLoading(false)
            return
        }

        try {
            // Debug: Log the URL being called
            console.log("API URL:", `${API_BASE_URL}/signup`)
            console.log("Form data:", formData)

            // Convert to FormData for Flask form handling
            const formDataToSend = new FormData()
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key])
            })

            const response = await axios.post(
                `${API_BASE_URL}/signup`,
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            console.log("Response:", response.data)

            if (response.data.status === "success") {
                setMessage(response.data.message)
                setMessageType("success")
                // Navigate to login page after successful signup
                setTimeout(() => {
                    navigate("/login")
                }, 200000)
            }
        } catch (error) {
            console.error("Signup error:", error)
            
            if (error.response && error.response.data) {
                setMessage(error.response.data.message || "Signup failed")
                setMessageType(error.response.data.status || "danger")
            } else if (error.request) {
                setMessage("Network error. Please check your connection.")
                setMessageType("danger")
            } else {
                setMessage("An unexpected error occurred. Please try again.")
                setMessageType("danger")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex flex-col justify-center py-12 -mt-5 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create a new account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 max-w">
                        <span>Or </span>
                        <Link to="/login" className="font-medium text-[#661fff] hover:text-[#7738ff]">
                            Login
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {/* Message display */}
                        {message && (
                            <div className={`mb-4 p-4 rounded-md ${
                                messageType === "success" 
                                    ? "bg-green-50 text-green-800 border border-green-200" 
                                    : "bg-red-50 text-red-800 border border-red-200"
                            }`}>
                                {message}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <div className="mt-1">
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm">
                                        <option value="player">Player</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div>
                                <label htmlFor="preference_1" className="block text-sm font-medium text-gray-700">
                                    Preference 1
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="preference_1"
                                        name="preference_1"
                                        type="text"
                                        required
                                        value={formData.preference_1}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your first preference"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="preference_2" className="block text-sm font-medium text-gray-700">
                                    Preference 2
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="preference_2"
                                        name="preference_2"
                                        type="text"
                                        value={formData.preference_2}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your second preference"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="preference_3" className="block text-sm font-medium text-gray-700">
                                    Preference 3
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="preference_3"
                                        name="preference_3"
                                        type="text"
                                        value={formData.preference_3}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your third preference"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="preference_4" className="block text-sm font-medium text-gray-700">
                                    Preference 4
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="preference_4"
                                        name="preference_4"
                                        type="text"
                                        value={formData.preference_4}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your fourth preference"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#661fff] hover:bg-[#7738ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? "Signing up..." : "Sign Up"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
