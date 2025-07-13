import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

// Fix the API base URL - remove trailing slash
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://3.110.46.79:5000").replace(/\/$/, '')

export default function Challengemodel() {
    const [challengeType, setChallengeType] = useState("")
    const [userPerformance, setUserPerformance] = useState({
        correctAnswers: 0,
        totalQuestions: 0,
        averageTime: 0,
    })
    // REMOVED: aiPerformance state
    const [loading, setLoading] = useState(false)
    const [themesLoading, setThemesLoading] = useState(true)
    const [recentQuizzes, setRecentQuizzes] = useState([])
    const [themeLeaderboard, setThemeLeaderboard] = useState([])
    const [overallLeaderboard, setOverallLeaderboard] = useState([])
    const [overallLeaderboardLoading, setOverallLeaderboardLoading] = useState(false)
    const [selectedTheme, setSelectedTheme] = useState("general")
    const [themes, setThemes] = useState([])
    const [themesError, setThemesError] = useState(null)

    const navigate = useNavigate()
    const { getAuthToken, isAuthenticated } = useAuth()

    // Challenge modes
    const challengeModes = [
        {
            id: "head-to-head",
            title: "Head-to-Head Mode",
            description:
                "Answer questions alongside AI and compete for accuracy and speed.",
            apiEndpoint: "/beat_the_ai",
        },
        {
            id: "theme-challenge",
            title: "Theme Challenge",
            description: "Test your knowledge in a specific theme against AI.",
            apiEndpoint: "/create_quiz_from_bank",
        },
        {
            id: "create-quiz",
            title: "Create Your Own Quiz",
            description: "Create your own questions and challenge others.",
            apiEndpoint: "/create_quiz_master",
        },
    ]

    // Fetch all themes from API
    const fetchAllThemes = async () => {
        setThemesLoading(true)
        setThemesError(null)

        try {
            const token = getAuthToken()
            
            console.log("Fetching all themes from API...")

            // Try multiple methods for the /get_all_themes API
            const apiMethods = [
                // Method 1: GET request (as specified in the API)
                () => {
                    return axios.get(`${API_BASE_URL}/get_all_themes`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    })
                },
                
                // Method 2: GET request without auth (in case it's public)
                () => {
                    return axios.get(`${API_BASE_URL}/get_all_themes`, {
                        timeout: 10000,
                    })
                },
                
                // Method 3: POST request (fallback)
                () => {
                    return axios.post(`${API_BASE_URL}/get_all_themes`, {}, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    })
                }
            ]

            let success = false
            let response = null

            for (let i = 0; i < apiMethods.length; i++) {
                try {
                    console.log(`Trying themes API method ${i + 1}...`)
                    response = await apiMethods[i]()
                    console.log(`Themes API method ${i + 1} successful:`, response.data)
                    success = true
                    break
                } catch (methodError) {
                    console.log(`Themes API method ${i + 1} failed:`, methodError.response?.status, methodError.response?.data)
                    if (i === apiMethods.length - 1) {
                        throw methodError // Re-throw the last error
                    }
                }
            }

            if (success && response.data) {
                let themesData = []
                
                // Handle different response formats
                if (Array.isArray(response.data)) {
                    themesData = response.data
                } else if (response.data.themes && Array.isArray(response.data.themes)) {
                    themesData = response.data.themes
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    themesData = response.data.data
                } else {
                    console.warn("Unexpected themes response format:", response.data)
                    throw new Error("Unexpected response format")
                }

                // Process themes data
                const processedThemes = themesData.map(theme => {
                    if (typeof theme === 'string') {
                        return theme.toLowerCase()
                    } else if (theme.name) {
                        return theme.name.toLowerCase()
                    } else if (theme.theme) {
                        return theme.theme.toLowerCase()
                    } else {
                        return theme.toString().toLowerCase()
                    }
                })

                console.log("Processed themes:", processedThemes)
                setThemes(processedThemes)
                
                // Set default selected theme if current selection is not in the list
                if (processedThemes.length > 0 && !processedThemes.includes(selectedTheme)) {
                    setSelectedTheme(processedThemes[0])
                }
            } else {
                throw new Error("No themes data received")
            }

        } catch (error) {
            console.error("Error fetching themes:", error)
            setThemesError(error.message || "Failed to fetch themes")
            
            // Fallback to default themes if API fails
            const fallbackThemes = [
                "general",
                "sports", 
                "history",
                "science",
                "cricket",
                "programming",
            ]
            
            console.log("Using fallback themes:", fallbackThemes)
            setThemes(fallbackThemes)
            
            // Show user-friendly error message
            if (error.response?.status === 401) {
                console.error("Authentication error for themes API")
            } else if (error.response?.status === 404) {
                console.error("Themes API endpoint not found")
            }
            
        } finally {
            setThemesLoading(false)
        }
    }

    // Fetch overall leaderboard from API
    const fetchOverallLeaderboard = async () => {
        setOverallLeaderboardLoading(true)

        try {
            const token = getAuthToken()
            
            if (!token) {
                console.error("No authentication token found for overall leaderboard")
                return
            }

            console.log("Fetching overall leaderboard from API...")

            // Try multiple methods for the /leaderboard_overall API
            const apiMethods = [
                // Method 1: GET request
                () => {
                    return axios.get(`${API_BASE_URL}/leaderboard_overall`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    })
                },
                
                // Method 2: POST request (fallback)
                () => {
                    return axios.post(`${API_BASE_URL}/leaderboard_overall`, {}, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    })
                },
                
                // Method 3: POST with FormData
                () => {
                    const formData = new FormData()
                    return axios.post(`${API_BASE_URL}/leaderboard_overall`, formData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                        timeout: 10000,
                    })
                }
            ]

            let success = false
            let response = null

            for (let i = 0; i < apiMethods.length; i++) {
                try {
                    console.log(`Trying overall leaderboard API method ${i + 1}...`)
                    response = await apiMethods[i]()
                    console.log(`Overall leaderboard API method ${i + 1} successful:`, response.data)
                    success = true
                    break
                } catch (methodError) {
                    console.log(`Overall leaderboard API method ${i + 1} failed:`, methodError.response?.status, methodError.response?.data)
                    if (i === apiMethods.length - 1) {
                        throw methodError // Re-throw the last error
                    }
                }
            }

            if (success && response.data) {
                let leaderboardData = []
                
                // Handle different response formats
                if (Array.isArray(response.data)) {
                    leaderboardData = response.data
                } else if (response.data.leaderboard && Array.isArray(response.data.leaderboard)) {
                    leaderboardData = response.data.leaderboard
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    leaderboardData = response.data.data
                } else {
                    console.warn("Unexpected overall leaderboard response format:", response.data)
                    throw new Error("Unexpected response format")
                }

                console.log("Overall leaderboard data:", leaderboardData)
                setOverallLeaderboard(leaderboardData)
            } else {
                throw new Error("No overall leaderboard data received")
            }

        } catch (error) {
            console.error("Error fetching overall leaderboard:", error)
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                console.error("Authentication error for overall leaderboard - redirecting to login")
                navigate("/login")
                return
            }
            
            if (error.response?.status === 404) {
                console.log("Overall leaderboard endpoint not found")
                setOverallLeaderboard([])
                return
            }
            
            // For other errors, log the details
            console.error("Overall leaderboard API Error details:", error.response?.data)
            setOverallLeaderboard([])
        } finally {
            setOverallLeaderboardLoading(false)
        }
    }

    // Fetch user's recent quizzes and performance data
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login")
            return
        }

        // Fetch themes first, then user data, then overall leaderboard
        fetchAllThemes()
        fetchUserData()
        fetchOverallLeaderboard()
    }, [isAuthenticated, navigate])

    // Fetch theme leaderboard when selected theme changes
    useEffect(() => {
        if (selectedTheme && themes.length > 0) {
            fetchThemeLeaderboard(selectedTheme)
        }
    }, [selectedTheme, themes])

    const fetchUserData = async () => {
        setLoading(true)
        const token = getAuthToken()

        try {
            // Fetch recent quizzes
            const recentResponse = await axios.get(
                `${API_BASE_URL}/recent_quizzes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (recentResponse.data && recentResponse.data.quizzes) {
                setRecentQuizzes(recentResponse.data.quizzes)

                // Calculate user performance from recent quizzes
                const quizzes = recentResponse.data.quizzes
                if (quizzes.length > 0) {
                    let totalCorrect = 0
                    let totalTime = 0
                    let quizzesWithTime = 0

                    quizzes.forEach(quiz => {
                        if (quiz.score !== undefined) {
                            totalCorrect += parseInt(quiz.score)
                        }

                        if (quiz.time_taken) {
                            totalTime += parseFloat(quiz.time_taken)
                            quizzesWithTime++
                        }
                    })

                    setUserPerformance({
                        correctAnswers: totalCorrect,
                        totalQuestions: quizzes.reduce(
                            (acc, quiz) =>
                                acc +
                                (quiz.questions ? quiz.questions.length : 0),
                            0
                        ),
                        averageTime:
                            quizzesWithTime > 0
                                ? (totalTime / quizzesWithTime).toFixed(1)
                                : 0,
                    })
                }
            }

        } catch (error) {
            console.error("Error fetching user data:", error.response)
        } finally {
            setLoading(false)
        }
    }

    // Theme leaderboard API - REMOVED AI performance calculation
    const fetchThemeLeaderboard = async theme => {
        try {
            const token = getAuthToken()
            
            if (!token) {
                console.error("No authentication token found")
                return
            }

            console.log("Fetching leaderboard for theme:", theme)

            // Use FormData instead of query parameters
            const formData = new FormData()
            formData.append('theme', theme)

            const response = await axios.post(
                `${API_BASE_URL}/leaderboard_theme`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 10000,
                }
            )

            console.log("Theme leaderboard response:", response.data)

            if (response.data && response.data.leaderboard) {
                setThemeLeaderboard(response.data.leaderboard)
                // REMOVED: AI performance calculation
            }

        } catch (error) {
            console.error("Error fetching theme leaderboard:", error)
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                console.error("Authentication error - redirecting to login")
                navigate("/login")
                return
            }
            
            if (error.response?.status === 404) {
                console.log("No theme leaderboard data found for theme:", theme)
                setThemeLeaderboard([])
                return
            }
            
            // For other errors, log the details
            console.error("Theme leaderboard API Error details:", error.response?.data)
            setThemeLeaderboard([])
        }
    }

    // Handle theme change
    const handleThemeChange = theme => {
        setSelectedTheme(theme)
        fetchThemeLeaderboard(theme)
    }

    // Start a challenge based on the selected mode
    const handleStartChallenge = async () => {
        const selectedMode =
            challengeModes.find(
                mode =>
                    mode.title
                        .toLowerCase()
                        .includes(challengeType.toLowerCase()) ||
                    mode.id.includes(challengeType.toLowerCase())
            ) || challengeModes[0]

        if (selectedMode.id === "theme-challenge") {
            // Navigate to theme challenge with selected theme
            navigate(`/quiz?theme=${selectedTheme}&mode=theme-challenge`)
        } else if (selectedMode.id === "create-quiz") {
            // Navigate to create quiz page
            navigate("/create-quiz")
        } else {
            // Default: head-to-head challenge
            navigate("/aichallenge/beat-the-ai")
        }
    }

    // Handle direct selection of challenge mode
    const handleSelectChallengeMode = modeId => {
        if (modeId === "head-to-head") {
            navigate("/aichallenge/beat-the-ai")
        } else if (modeId === "theme-challenge") {
            navigate(`/quiz?theme=${selectedTheme}&mode=theme-challenge`)
        } else {
            navigate("/create-quiz")
        }
    }

    return (
        <div className="min-h-screen p-6 md:p-10 bg-gray-100 flex flex-col items-center">
            {/* Container */}
            <div className="w-full max-w-6xl space-y-6 md:space-y-8">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Choose Your Challenge Mode
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center p-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#661fff]"></div>
                    </div>
                ) : (
                    <>
                        {/* Challenge Mode Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {challengeModes.map(mode => (
                                <div
                                    key={mode.id}
                                    onClick={() =>
                                        handleSelectChallengeMode(mode.id)
                                    }
                                    className="bg-white rounded-lg shadow p-5 flex flex-col items-start transition-all duration-300 hover:shadow-lg hover:bg-gray-50 cursor-pointer">
                                    <h2 className="text-lg font-semibold mb-2 text-[#661fff]">
                                        {mode.title}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {mode.description}
                                    </p>
                                    <button className="mt-4 text-sm font-medium text-[#661fff] hover:underline">
                                        Start Now →
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Theme Selection */}
                        <div className="bg-white rounded-lg shadow p-5">
                            <h3 className="text-md font-bold text-gray-700 mb-3">
                                Select Theme
                            </h3>
                            
                            {themesLoading ? (
                                <div className="flex items-center justify-center p-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#661fff] mr-2"></div>
                                    <span className="text-gray-600">Loading themes...</span>
                                </div>
                            ) : themesError ? (
                                <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                                    <p className="text-yellow-700 text-sm">
                                        ⚠️ {themesError}
                                    </p>
                                    <p className="text-yellow-600 text-xs mt-1">
                                        Using default themes. You can still proceed with the challenge.
                                    </p>
                                </div>
                            ) : null}
                            
                            <div className="flex flex-wrap gap-2">
                                {themes.map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => handleThemeChange(theme)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                            selectedTheme === theme
                                                ? "bg-[#661fff] text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                        disabled={themesLoading}>
                                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Refresh themes button */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <button
                                    onClick={fetchAllThemes}
                                    disabled={themesLoading}
                                    className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400">
                                    {themesLoading ? "Loading..." : "🔄 Refresh Themes"}
                                </button>
                            </div>
                        </div>

                        {/* Performance Section - UPDATED to single column */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* Your Performance - now takes full width */}
                            <div className="bg-white rounded-lg shadow p-5">
                                <h3 className="text-md font-bold text-gray-700 mb-3">
                                    Your Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[#661fff]">
                                            {userPerformance.correctAnswers}
                                        </p>
                                        <p className="text-sm text-gray-600">Correct Answers</p>
                                        <p className="text-xs text-gray-500">
                                            out of {userPerformance.totalQuestions || 0}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[#661fff]">
                                            {userPerformance.averageTime}s
                                        </p>
                                        <p className="text-sm text-gray-600">Average Time</p>
                                        <p className="text-xs text-gray-500">per question</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[#661fff]">
                                            {userPerformance.totalQuestions
                                                ? (
                                                        (userPerformance.correctAnswers /
                                                            userPerformance.totalQuestions) *
                                                        100
                                                  ).toFixed(1)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-gray-600">Accuracy Rate</p>
                                        <p className="text-xs text-gray-500">overall performance</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboards Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Theme-specific Leaderboard */}
                            <div className="bg-white rounded-lg shadow p-5">
                                <h3 className="text-md font-bold text-gray-700 mb-3">
                                    Top Performers in{" "}
                                    {selectedTheme.charAt(0).toUpperCase() +
                                        selectedTheme.slice(1)}
                                </h3>

                                {themeLeaderboard.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                                                        Rank
                                                    </th>
                                                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                                                        Username
                                                    </th>
                                                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">
                                                        Score
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {themeLeaderboard.map(
                                                    (entry, index) => (
                                                        <tr
                                                            key={index}
                                                            className="border-b border-gray-100">
                                                            <td className="py-2 px-3 text-sm text-gray-800">
                                                                {index + 1}
                                                            </td>
                                                            <td className="py-2 px-3 text-sm text-gray-800">
                                                                {entry.username}
                                                            </td>
                                                            <td className="py-2 px-3 text-sm text-gray-800 text-right">
                                                                {entry.total_score}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">
                                        No leaderboard data available for this theme.
                                    </p>
                                )}
                            </div>

                            {/* Overall Leaderboard */}
                            <div className="bg-white rounded-lg shadow p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-md font-bold text-gray-700">
                                        Overall Top Performers
                                    </h3>
                                    <button
                                        onClick={fetchOverallLeaderboard}
                                        disabled={overallLeaderboardLoading}
                                        className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400">
                                        {overallLeaderboardLoading ? "Loading..." : "🔄 Refresh"}
                                    </button>
                                </div>

                                {overallLeaderboardLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#661fff] mr-2"></div>
                                        <span className="text-gray-600">Loading overall leaderboard...</span>
                                    </div>
                                ) : overallLeaderboard.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                                                        Rank
                                                    </th>
                                                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                                                        Username
                                                    </th>
                                                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">
                                                        Score
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {overallLeaderboard.map(
                                                    (entry, index) => (
                                                        <tr
                                                            key={index}
                                                            className="border-b border-gray-100">
                                                            <td className="py-2 px-3 text-sm text-gray-800">
                                                                {index + 1}
                                                            </td>
                                                            <td className="py-2 px-3 text-sm text-gray-800">
                                                                {entry.username || entry.name || 'Unknown'}
                                                            </td>
                                                            <td className="py-2 px-3 text-sm text-gray-800 text-right">
                                                                {entry.total_score || entry.score || 0}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">
                                        No overall leaderboard data available.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick Challenge Entry */}
                        <div className="bg-white rounded-lg shadow p-5">
                            <h3 className="text-md font-bold text-gray-700 mb-4">
                                Quick Challenge Entry
                            </h3>

                            <label
                                htmlFor="challengeMode"
                                className="block font-medium mb-2 text-gray-700">
                                Enter challenge type or select from above
                            </label>

                            <input
                                id="challengeMode"
                                type="text"
                                value={challengeType}
                                onChange={e => setChallengeType(e.target.value)}
                                placeholder="e.g., Head-to-Head, Theme Challenge"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#661fff] mb-4"
                            />

                            <div className="flex space-x-4">
                                <button
                                    className="bg-[#661fff] text-white px-5 py-2 rounded-full hover:bg-[#7a48e8] focus:outline-none focus:ring-2 focus:ring-[#661fff]"
                                    onClick={handleStartChallenge}>
                                    Start Challenge
                                </button>
                                <button
                                    className="bg-gray-300 text-gray-800 px-5 py-2 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    onClick={() => setChallengeType("")}>
                                    Clear
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
