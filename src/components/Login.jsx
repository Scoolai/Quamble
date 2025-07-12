import axios from "axios"
import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

// Fix: Handle API URL properly
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://3.110.46.79:5000/")

export default function Login() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError("")
        setLoading(true)

        // Create FormData for Flask form handling
        const data = new FormData()
        data.append("email", formData.email)
        data.append("password", formData.password)

        try {
            console.log("API URL:", `${API_BASE_URL}/login`)
            console.log("Login data:", { email: formData.email, password: "***" })

            const response = await axios.post(`${API_BASE_URL}/login`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            console.log("Login response:", response.data)

            if (response.data && response.data.status === "success" && response.data.token) {
                // Store the token in localStorage
                localStorage.setItem("authToken", response.data.token)

                // Extract username from welcome message
                if (response.data.message) {
                    const username = response.data.message
                        .replace("Welcome, ", "")
                        .replace("!", "")
                    localStorage.setItem("username", username)
                }

                console.log("Login success:", response.data.message)

                // Redirect to home page or dashboard
                navigate("/")
            } else {
                setError("Invalid response from server")
            }
        } catch (err) {
            console.error("Login error:", err)

            // Handle specific error messages
            if (err.response) {
                if (err.response.status === 401) {
                    setError("Invalid email or password")
                } else if (err.response.data && err.response.data.message) {
                    setError(err.response.data.message)
                } else {
                    setError("Login failed. Please try again.")
                }
            } else if (err.request) {
                setError("Network error. Please check your connection.")
            } else {
                setError("An unexpected error occurred. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex flex-col justify-center py-12 -mt-10 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Login to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 max-w">
                        <span>Or </span>
                        <Link 
                            to="/signup" 
                            className="font-medium text-[#661fff] hover:text-[#7738ff]"
                        >
                            create an account
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
                                {error}
                            </div>
                        )}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700">
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

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember_me"
                                        name="remember_me"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="remember_me"
                                        className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a
                                        href="#"
                                        className="font-medium text-[#661fff] hover:text-[#7738ff]">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#661fff] hover:bg-[#7738ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                            </div>
                        </form>
                        
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-100 text-gray-500">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-3 gap-3">
                                <div>
                                    <a
                                        href="#"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        <img
                                            className="h-5 w-5"
                                            src="https://www.svgrepo.com/show/512120/facebook-176.svg"
                                            alt=""
                                        />
                                    </a>
                                </div>
                                <div>
                                    <a
                                        href="#"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        <img
                                            className="h-5 w-5"
                                            src="https://www.svgrepo.com/show/513008/twitter-154.svg"
                                            alt=""
                                        />
                                    </a>
                                </div>
                                <div>
                                    <a
                                        href="#"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        <img
                                            className="h-6 w-6"
                                            src="https://www.svgrepo.com/show/506498/google.svg"
                                            alt=""
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
