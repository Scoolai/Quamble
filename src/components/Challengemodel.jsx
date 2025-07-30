import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

// Fix the API base URL - remove trailing slash
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://raj-tomar001-quamble.hf.space/").replace(/\/$/, '')

export default function Challengemodel() {
    const [challengeType, setChallengeType] = useState("")
    const [userPerformance, setUserPerformance] = useState({
        correctAnswers: 0,
        totalQuestions: 0,
        averageTime: 0,
    })
    const [themePerformance, setThemePerformance] = useState(null)
    const [themePerformanceLoading, setThemePerformanceLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [themesLoading, setThemesLoading] = useState(true)
    const [recentQuizzes, setRecentQuizzes] = useState([])
    const [themeLeaderboard, setThemeLeaderboard] = useState([])
    const [overallLeaderboard, setOverallLeaderboard] = useState([])
    const [overallLeaderboardLoading, setOverallLeaderboardLoading] = useState(false)
    const [selectedTheme, setSelectedTheme] = useState("general")
    const [themes, setThemes] = useState([])
    const [themesError, setThemesError] = useState(null)
    const [themeSearch, setThemeSearch] = useState(""); // Add this at the top with other useState
    

    const navigate = useNavigate()
    const { getAuthToken, isAuthenticated } = useAuth()

    // Challenge modes
    const challengeModes = [
        {
            id: "theme-challenge",
            title: "Theme Challenge",
            description: "Test your knowledge in a specific theme against AI.",
            apiEndpoint: "/beat_the_ai",
        },
        {
            id: "head-to-head",
            title: "Head-to-Head Mode",
            description:
                "Compete against AI on random themes.",
            apiEndpoint: "/beat_the_ai",
        },
        {
            id: "create-quiz",
            title: "Explore more",
            description: "Go through theme based quizzes and challenges.",
            apiEndpoint: "/quiz",
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

    // Scroll to top on component mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // New useEffect to set default theme
    useEffect(() => {
  if (themes.length > 0) {
    // If "cricket" exists, select it; otherwise, select the first theme
    if (themes.includes("cricket")) {
      setSelectedTheme("cricket");
      fetchThemeLeaderboard("cricket");
      fetchThemePerformance("cricket");
    } else if (!themes.includes(selectedTheme)) {
      setSelectedTheme(themes[0]);
      fetchThemeLeaderboard(themes[0]);
      fetchThemePerformance(themes[0]);
    }
  }
  // eslint-disable-next-line
}, [themes]);

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
                console.log("Fetched recent quizzes:", recentResponse.data.quizzes); // <-- Add this line

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

    // New function to fetch theme performance data
    const fetchThemePerformance = async (theme) => {
        setThemePerformanceLoading(true)
        try {
            const token = getAuthToken()
            const formData = new FormData()
            formData.append("theme", theme)
            const response = await axios.post(
                `${API_BASE_URL}/user_theme_stats`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            console.log("user_theme_stats response:", response.data) // <-- Add this line
            setThemePerformance(response.data)
        } catch (err) {
            setThemePerformance(null)
            console.error("Error fetching theme performance:", err)
        } finally {
            setThemePerformanceLoading(false)
        }
    }

    // Handle theme change
    const handleThemeChange = theme => {
        setSelectedTheme(theme)
        fetchThemeLeaderboard(theme)
        fetchThemePerformance(theme) // Fetch performance data for the selected theme
    }

    // Start a challenge based on the selected mode
    const handleStartChallenge = () => {
        if (challengeType === "Head-to-Head Mode") {
            navigate("/aichallenge/beat-the-ai?theme=random");
        } else if (challengeType === "Theme Challenge") {
            navigate(`/quiz?theme=${selectedTheme}&mode=theme-challenge`);
        }
        // ...other modes
    }

    // Handle direct selection of challenge mode
    const handleSelectChallengeMode = (modeId) => {
        if (modeId === "theme-challenge") {
            navigate("/aichallenge/beat-the-ai?challengeType=theme");
        } else if (modeId === "head-to-head") {
            navigate("/aichallenge/beat-the-ai?challengeType=headtohead&theme=random");
        } else if (modeId === "create-quiz") {
            navigate("/quiz");
        }
    };

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
                                    <button className="mt-4 text-sm font-medium bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700">
                                        Start Now →
                                    </button>
                                </div>
                            ))}
                        </div>
 {/* Theme Challenge Overview Title */}
<div className="mb-6">
  <h2 className="text-3xl font-bold text-black">Theme Challenge Overview</h2>
</div>

                    
{/* Combined Stats and Leaderboards Card */}
<div className="bg-white rounded-xl shadow-lg p-6">
    {/* Theme Selection Section */}
    <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Select Theme</h3>
        <input
            type="text"
            placeholder="Search themes..."
            value={themeSearch}
            onChange={e => setThemeSearch(e.target.value)}
            className="mb-4 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#661fff]"
        />
        <div className="flex flex-wrap gap-2">
            {themes
                .filter(theme => theme.toLowerCase().includes(themeSearch.toLowerCase()))
                .slice(0, 10)
                .map(theme => (
                    <button
                        key={theme}
                        className={`px-4 py-2 rounded-full border text-sm font-medium ${
                            selectedTheme === theme
                                ? "bg-[#661fff] text-white border-[#661fff]"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                        onClick={() => handleThemeChange(theme)}
                    >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                ))}
        </div>
    </div>

    {/* Divider */}
    <div className="border-b border-gray-200 my-6"></div>

    {/* Performance Stats Section */}
    <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
            Your Performance in "{selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}"
        </h3>
        {themePerformanceLoading ? (
            <div className="text-gray-500">Loading performance data...</div>
        ) : themePerformance ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-[#661fff]">
                        {themePerformance.total_score ? themePerformance.total_score.split("/")[0] : 0}
                    </p>
                    <p className="text-sm text-gray-600">Correct Answers</p>
                    <span className="text-xs text-gray-400">
                        out of {themePerformance.total_score ? themePerformance.total_score.split("/")[1] : 0}
                    </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-[#661fff]">
                        {themePerformance.avg_time_seconds !== undefined ? `${themePerformance.avg_time_seconds}s` : "0s"}
                    </p>
                    <p className="text-sm text-gray-600">Average Time</p>
                    <span className="text-xs text-gray-400">per Quiz</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-[#661fff]">
                        {themePerformance.accuracy !== undefined ? themePerformance.accuracy : "0%"}
                    </p>
                    <p className="text-sm text-gray-600">Accuracy Rate</p>
                    <span className="text-xs text-gray-400">overall performance</span>
                </div>
            </div>
        ) : (
            <div className="text-gray-500">No performance data available for this theme.</div>
        )}
    </div>

    {/* Divider */}
    <div className="border-b border-gray-200 my-6"></div>

    {/* Leaderboards Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theme-specific Leaderboard */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                Top Performers in {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}
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
                <p className="text-gray-500">No leaderboard data available for this theme.</p>
            )}
        </div>

        {/* Overall Leaderboard */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Overall Top Performers</h3>
                <button
                    onClick={fetchOverallLeaderboard}
                    disabled={overallLeaderboardLoading}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
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
                <p className="text-gray-500">No overall leaderboard data available.</p>
            )}
        </div>
    </div>
</div>

                    </>
                )}
            </div>
        </div>
    )
}
