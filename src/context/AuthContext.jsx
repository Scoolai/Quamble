import React, { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Create the Auth Context
const AuthContext = createContext(null)

// Provider component
export const AuthProvider = ({ children }) => {
	const navigate = useNavigate()
	const [currentUser, setCurrentUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [initialized, setInitialized] = useState(false)

	// Check if user is authenticated on app startup
	useEffect(() => {
		const checkAuthStatus = async () => {
			const token = localStorage.getItem("authToken")

			if (!token) {
				setCurrentUser(null)
				setLoading(false)
				setInitialized(true)
				return
			}

			try {
				const username = localStorage.getItem("username") || ""

				setCurrentUser({ username })
			} catch (error) {
				// If token validation fails, clear storage
				localStorage.removeItem("authToken")
				localStorage.removeItem("username")
				setCurrentUser(null)
			} finally {
				setLoading(false)
				setInitialized(true)
			}
		}

		checkAuthStatus()
	}, [])

	// Login user
	const login = async (email, password) => {
		setLoading(true)

		try {
			const data = new FormData()
			data.append("email", email)
			data.append("password", password)

			const response = await axios.post(`${API_BASE_URL}/login`, data, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})

			if (response.data && response.data.token) {
				localStorage.setItem("authToken", response.data.token)

				// Extract username from welcome message if available
				if (response.data.message) {
					const username = response.data.message
						.replace("Welcome, ", "")
						.replace("!", "")
					localStorage.setItem("username", username)
					setCurrentUser({ username })
				} else {
					setCurrentUser({ username: "User" })
				}

				return { success: true }
			}

			return {
				success: false,
				error: "Invalid response from server",
			}
		} catch (error) {
			console.error("Login error:", error)

			let errorMessage = "Login failed. Please try again."

			if (error.response) {
				if (error.response.status === 401) {
					errorMessage = "Invalid email or password"
				} else if (error.response.data && error.response.data.message) {
					errorMessage = error.response.data.message
				}
			}

			return {
				success: false,
				error: errorMessage,
			}
		} finally {
			setLoading(false)
		}
	}

	// Logout user
	const logout = () => {
		localStorage.removeItem("authToken")
		localStorage.removeItem("username")
		setCurrentUser(null)
		navigate("/login")
	}

	// Get the auth token
	const getAuthToken = () => {
		return localStorage.getItem("authToken")
	}

	// Check if the user is authenticated
	const isAuthenticated = () => {
		return !!localStorage.getItem("authToken")
	}

	// Value to be provided to consumers
	const value = {
		currentUser,
		loading,
		initialized,
		login,
		logout,
		getAuthToken,
		isAuthenticated,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook for using the auth context
export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}

// Protected Route component
export const RequireAuth = ({ children }) => {
	const { isAuthenticated, loading, initialized } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (initialized && !loading && !isAuthenticated()) {
			navigate("/login")
		}
	}, [loading, initialized, isAuthenticated, navigate])

	if (loading || !initialized) {
		return <div>Loading...</div>
	}

	return isAuthenticated() ? children : null
}
