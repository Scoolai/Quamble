import React, { useEffect, useRef, useState } from "react"
import { FiEdit3 } from "react-icons/fi"
import { FaTrophy, FaStar, FaClock } from "react-icons/fa"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { getAuthToken, isAuthenticated } from "../utils/auth"

// Keep the API URL with trailing slash as hosted
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://3.110.46.79:5000/"

export default function ProfilePage() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    // Profile Data State
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        userName: "",
        gender: "",
        currentRole: "",
        currentOrganisation: "",
        currentIndustry: "",
        bio: "",
        profilePic: "/assets/logo.png",
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formError, setFormError] = useState(null)
    const [saveLoading, setSaveLoading] = useState(false)
    const [file, setFile] = useState(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // First, add state to track which quiz is expanded
    const [expandedQuizId, setExpandedQuizId] = useState(null);

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login")
        }
    }, [navigate])

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!isAuthenticated()) return

            try {
                setLoading(true)
                setError(null)
                const token = getAuthToken()

                console.log("Fetching profile data...")
                console.log("API URL:", `${API_BASE_URL}view_profile`)
                console.log("Token:", token ? "Present" : "Missing")

                const response = await axios.get(
                    `${API_BASE_URL}view_profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                console.log("Profile response:", response.data)

                if (response.data) {
                    // Handle the response according to your API specification
                    setProfileData({
                        firstName: response.data.first_name || "",
                        lastName: response.data.last_name || "",
                        userName: localStorage.getItem("username") || "", // Get from localStorage since it's not in API response
                        gender: response.data.gender || "Not specified",
                        currentRole: response.data.role || "",
                        currentOrganisation: response.data.organisation || "",
                        currentIndustry: response.data.industry || "",
                        bio: response.data.bio || "",
                        profilePic: response.data.profile_pic || "/assets/logo.png",
                    })
                } else {
                    setError("No profile data received from server")
                }
            } catch (err) {
                console.error("Error fetching profile:", err)

                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("authToken")
                    localStorage.removeItem("username")
                    navigate("/login")
                    return
                }

                // Handle specific error messages from API
                if (err.response && err.response.data && err.response.data.error) {
                    if (err.response.data.error === "User does not exist.") {
                        setError("User profile not found. Please contact support.")
                    } else {
                        setError(err.response.data.error)
                    }
                } else if (err.response && err.response.status === 404) {
                    setError("Profile not found. Please complete your profile setup.")
                } else {
                    setError("Failed to load profile data. Please try again later.")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [navigate])

    const toggleEdit = () => {
        setFormError(null)
        setIsEditOpen(!isEditOpen)
    }

    // Handle form submission for saving edits
    const handleSave = async (e) => {
        e.preventDefault()
        
        if (!isAuthenticated()) return

        try {
            setSaveLoading(true)
            setFormError(null)

            const formData = new FormData(e.target)
            const token = getAuthToken()

            // Prepare the data for the API according to your specification
            const profileUpdateData = new FormData()
            profileUpdateData.append("first_name", formData.get("firstName"))
            profileUpdateData.append("last_name", formData.get("lastName"))
            profileUpdateData.append("organisation", formData.get("currentOrganisation"))
            profileUpdateData.append("industry", formData.get("currentIndustry"))
            profileUpdateData.append("bio", formData.get("bio"))

            // Only append the file if one was selected
            if (file) {
                profileUpdateData.append("profile_pic", file)
            }

            console.log("Updating profile with data:", {
                first_name: formData.get("firstName"),
                last_name: formData.get("lastName"),
                organisation: formData.get("currentOrganisation"),
                industry: formData.get("currentIndustry"),
                bio: formData.get("bio"),
                hasFile: !!file
            })

            const response = await axios.post(
                `${API_BASE_URL}edit_profile`,
                profileUpdateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            console.log("Profile update response:", response.data)

            if (response.data && response.data.message === "Profile updated successfully!") {
                // Update local state with the new data
                setProfileData(prevData => ({
                    ...prevData,
                    firstName: formData.get("firstName"),
                    lastName: formData.get("lastName"),
                    currentOrganisation: formData.get("currentOrganisation"),
                    currentIndustry: formData.get("currentIndustry"),
                    bio: formData.get("bio"),
                }))

                // Close the edit panel
                toggleEdit()
                
                // Show success message
                alert("Profile updated successfully!")
            } else {
                setFormError("Unexpected response from server")
            }
        } catch (err) {
            console.error("Error updating profile:", err)

            if (err.response && err.response.status === 401) {
                localStorage.removeItem("authToken")
                navigate("/login")
                return
            }

            // Handle error response
            if (err.response && err.response.data && err.response.data.error) {
                setFormError(err.response.data.error)
            } else {
                setFormError("Failed to update profile. Please try again.")
            }
        } finally {
            setSaveLoading(false)
        }
    }

    // Handle profile picture change
    const handleProfilePicChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            // Store the file object for later upload
            setFile(selectedFile)

            // Show preview of the image
            const reader = new FileReader()
            reader.onload = () => {
                setProfileData(prevData => ({
                    ...prevData,
                    profilePic: reader.result,
                }))
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    // Achievements data
    const [achievements] = useState([
        {
            icon: <FaTrophy className="text-2xl text-blue-600 mx-auto" />,
            title: "Quiz Master",
            description: "Complete 20 quizzes",
        },
        {
            icon: <FaStar className="text-2xl text-blue-600 mx-auto" />,
            title: "Perfect Score",
            description: "Get 100% in a quiz",
        },
        {
            icon: <FaClock className="text-2xl text-blue-600 mx-auto" />,
            title: "Speed Demon",
            description: "Complete a quiz in under 2 minutes",
        },
    ])

    // Recent Quizzes data
    const [recentQuizzes, setRecentQuizzes] = useState([])
    const [quizzesLoading, setQuizzesLoading] = useState(true)

    useEffect(() => {
        const fetchRecentQuizzes = async () => {
            if (loading) return
            if (!isAuthenticated()) return

            try {
                setQuizzesLoading(true)
                const token = getAuthToken()

                console.log("Fetching recent quizzes...")
                console.log("API URL:", `${API_BASE_URL}recent_quizzes`)

                const response = await axios.get(
                    `${API_BASE_URL}recent_quizzes`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                console.log("Recent quizzes response:", response.data)

                if (response.data) {
                    // Check if response.data is an array (direct quiz data)
                    if (Array.isArray(response.data)) {
                        // Handle direct array response
                        const formattedQuizzes = response.data.map(quiz => {
                            // Parse JSON strings for correct_answers and questions
                            let correctAnswers = []
                            let questions = []
                            let userResponses = []

                            try {
                                correctAnswers = JSON.parse(quiz.correct_answers || '[]')
                            } catch (e) {
                                console.error("Error parsing correct_answers:", e)
                                correctAnswers = []
                            }

                            try {
                                questions = JSON.parse(quiz.questions || '[]')
                            } catch (e) {
                                console.error("Error parsing questions:", e)
                                questions = []
                            }

                            try {
                                userResponses = JSON.parse(quiz.user_responses || '[]')
                            } catch (e) {
                                console.error("Error parsing user_responses:", e)
                                userResponses = []
                            }

                            // Handle date formatting - if date_attempted is null, use current date
                            let displayDate = "Today"
                            let displayTime = "Unknown"

                            if (quiz.date_attempted) {
                                try {
                                    const attemptedDate = new Date(quiz.date_attempted)
                                    displayDate = attemptedDate.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                } catch (e) {
                                    console.error("Error parsing date:", e)
                                    displayDate = "Unknown"
                                }
                            }

                            // Handle time formatting - improve the time display
                            if (quiz.time_taken) {
                                const totalSeconds = parseInt(quiz.time_taken)
                                if (totalSeconds > 0) {
                                    const minutes = Math.floor(totalSeconds / 60)
                                    const seconds = totalSeconds % 60
                                    displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`
                                } else {
                                    displayTime = "< 1 min"
                                }
                            } else {
                                displayTime = "< 1 min"
                            }

                            return {
                                quizId: quiz.quiz_id,
                                theme: quiz.theme || "Mixed",
                                questions: questions,
                                correctAnswers: correctAnswers,
                                userResponses: userResponses,
                                timeTaken: quiz.time_taken || 0,
                                dateAttempted: quiz.date_attempted,
                                score: quiz.score || 0,
                                totalQuestions: questions.length || 0,
                                // Calculate score for display
                                scoreDisplay: `${quiz.score || 0}/${questions.length || 0}`,
                                // Format date for display
                                displayDate: displayDate,
                                // Format time taken for display
                                displayTime: displayTime
                            }
                        })

                        setRecentQuizzes(formattedQuizzes)
                        console.log("Formatted quizzes:", formattedQuizzes)
                    } else if (response.data.message === "No quizzes found for the user.") {
                        // Handle no quizzes message
                        setRecentQuizzes([])
                    } else if (response.data.quizzes && Array.isArray(response.data.quizzes)) {
                        // Handle wrapped response (your original expected format)
                        const formattedQuizzes = response.data.quizzes.map(quiz => ({
                            quizId: quiz.quiz_id,
                            theme: quiz.theme || "Mixed",
                            questions: quiz.questions || [],
                            correctAnswers: quiz.correct_answers || [],
                            userResponses: quiz.user_responses || [],
                            timeTaken: quiz.time_taken || 0,
                            dateAttempted: quiz.date_attempted,
                            score: `${quiz.correct_answers?.length || 0}/${quiz.questions?.length || 0}`,
                            displayDate: quiz.date_attempted 
                                ? new Date(quiz.date_attempted).toLocaleDateString()
                                : "Unknown",
                            displayTime: quiz.time_taken 
                                ? `${Math.floor(quiz.time_taken / 60)}:${(quiz.time_taken % 60).toString().padStart(2, '0')}`
                                : "Unknown"
                        }))

                        setRecentQuizzes(formattedQuizzes)
                    } else {
                        // Handle unexpected response structure
                        console.warn("Unexpected response structure:", response.data)
                        setRecentQuizzes([])
                    }
                } else {
                    setRecentQuizzes([])
                }
            } catch (err) {
                console.error("Error fetching recent quizzes:", err)

                // Special handling for 404 with "No quizzes found" message
                if (err.response && err.response.status === 404) {
                    if (err.response.data && err.response.data.message === "No quizzes found for the user.") {
                        console.log("No quizzes found for user (404 response)")
                        setRecentQuizzes([])
                    } else {
                        console.error("404 Error - API endpoint not found")
                        setRecentQuizzes([])
                    }
                    return
                }

                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("authToken")
                    localStorage.removeItem("username")
                    navigate("/login")
                    return
                }

                // Handle other specific error messages from API
                if (err.response && err.response.data && err.response.data.error) {
                    console.error("API Error:", err.response.data.error)
                }

                // Set empty array on error to avoid breaking the UI
                setRecentQuizzes([])
            } finally {
                setQuizzesLoading(false)
            }
        }

        fetchRecentQuizzes()
    }, [loading, navigate])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-pulse text-blue-600">Loading profile...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-600">{error}</p>
                    <div className="mt-3 space-x-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Try Again
                        </button>
                        {error.includes("profile not found") && (
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Create Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Profile Card */}
            <div className="mx-auto p-5 bg-white rounded-3xl shadow-md overflow-hidden w-full relative">
                <button
                    onClick={toggleEdit}
                    className="absolute top-[290px] right-8 bg-blue-500 text-white px-3 py-1 rounded-t-lg text-sm shadow flex gap-1 items-center hover:bg-blue-600">
                    Edit
                    <FiEdit3 />
                </button>
                <p className="text-md font-semibold text-gray-700">Manage Profile</p>
                <br />
                <hr />
                <br />
                <div className="relative">
                    <div className="bg-blue-500 h-32 rounded-t-2xl"></div>
                    <div className="absolute top-16 left-4">
                        <img
                            src={profileData.profilePic}
                            alt="Profile"
                            className="h-28 w-28 rounded-full border-4 border-white object-cover"
                        />
                    </div>
                </div>
                <div className="mt-16 px-6 pb-6">
                    <h2 className="text-2xl font-bold text-gray-800 pb-1">
                        {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-gray-500">
                        Username:{" "}
                        <span className="font-medium text-gray-800">
                            {profileData.userName}
                        </span>
                    </p>
                    <p className="text-gray-500 mt-2">
                        Current Role:{" "}
                        <span className="font-medium text-gray-800">
                            {profileData.currentRole}
                        </span>
                    </p>
                    <p className="text-gray-500 mt-2">
                        Current Organisation:{" "}
                        <span className="font-medium text-gray-800">
                            {profileData.currentOrganisation}
                        </span>
                    </p>
                    <p className="text-gray-500 mt-2">
                        Current Industry:{" "}
                        <span className="font-medium text-gray-800">
                            {profileData.currentIndustry}
                        </span>
                    </p>
                    <p className="text-gray-500 mt-4">Bio / About You:</p>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">
                        {profileData.bio}
                    </p>
                    <hr className="my-8" />

                    {/* Achievements Section */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Achievements</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {achievements.map((achv, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gray-50 rounded-xl shadow p-4 flex flex-col items-center hover:shadow-md transition-shadow">
                                    {achv.icon}
                                    <h3 className="text-md font-semibold text-gray-800 mt-2">
                                        {achv.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">{achv.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Quizzes Section */}
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Recent Quizzes</h2>
                        {quizzesLoading ? (
                            <div className="text-center text-gray-500">
                                <div className="animate-pulse">Loading recent quizzes...</div>
                            </div>
                        ) : recentQuizzes.length > 0 ? (
                            <div className="space-y-3">
                                {recentQuizzes.map((quiz, idx) => (
                                    <div key={idx} className="mb-6">
                                        <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <div className="text-gray-800 font-medium">
                                                    Quiz #{quiz.quizId} - <span className="capitalize">{quiz.theme}</span>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-4">
                                                    <span className="flex items-center gap-1">
                                                        📅 {quiz.displayDate}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        ⏱️ {quiz.displayTime}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        ❓ {quiz.totalQuestions} questions
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-blue-600 font-bold text-lg">
                                                    {quiz.scoreDisplay}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {quiz.totalQuestions > 0 
                                                        ? `${Math.round((quiz.score / quiz.totalQuestions) * 100)}%`
                                                        : "0%"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Add Quiz History Expansion */}
                                        <div className="mt-2 pl-4">
                                            <button 
                                                onClick={() => {
                                                    if (expandedQuizId === quiz.quizId) {
                                                        // If already expanded, close it
                                                        setExpandedQuizId(null);
                                                    } else {
                                                        // If not expanded, fetch details and expand
                                                        setExpandedQuizId(quiz.quizId);
                                                        const fetchQuizDetails = async () => {
                                                            try {
                                                                const token = getAuthToken();
                                                                const formData = new FormData();
                                                                formData.append('quiz_id', quiz.quizId);
                                                                formData.append('theme', quiz.theme);

                                                                const response = await axios.post(
                                                                    `${API_BASE_URL}view_attempted_quiz`,
                                                                    formData,
                                                                    {
                                                                        headers: {
                                                                            Authorization: `Bearer ${token}`,
                                                                            "Content-Type": "multipart/form-data",
                                                                        },
                                                                    }
                                                                );

                                                                if (response.data && response.data.questions) {
                                                                    setRecentQuizzes(prevQuizzes => 
                                                                        prevQuizzes.map(q => 
                                                                            q.quizId === quiz.quizId 
                                                                                ? { ...q, details: response.data.questions }
                                                                                : q
                                                                        )
                                                                    );
                                                                }
                                                            } catch (error) {
                                                                console.error("Error fetching quiz details:", error);
                                                            }
                                                        };

                                                        fetchQuizDetails();
                                                    }
                                                }}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                {expandedQuizId === quiz.quizId ? 'Hide Details' : 'View Details'}
                                            </button>

                                            {/* Display Quiz Details if Available and Expanded */}
                                            {quiz.details && expandedQuizId === quiz.quizId && (
                                                <div className="mt-4 space-y-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="font-semibold text-gray-700">Quiz Details</h3>
                                                        <button 
                                                            onClick={() => setExpandedQuizId(null)}
                                                            className="text-gray-500 hover:text-gray-700 text-sm"
                                                        >
                                                            ✖ Close
                                                        </button>
                                                    </div>
                                                    {quiz.details.map((q, qIdx) => {
                                                        // Parse question data
                                                        let questionData = { question: "", options: [] };
                                                        try {
                                                            questionData = JSON.parse(q.question);
                                                        } catch {
                                                            questionData.question = q.question;
                                                        }

                                                        // Parse user response
                                                        let userAns = "Not Answered";
                                                        if (q.user_response) {
                                                            try {
                                                                const parsed = JSON.parse(q.user_response);
                                                                if (Array.isArray(parsed)) {
                                                                    userAns = parsed[0] || "Not Answered";
                                                                } else {
                                                                    userAns = parsed;
                                                                }
                                                            } catch {
                                                                userAns = q.user_response.replace(/^["'\[\]\\]+|["'\[\]\\]+$/g, '').trim();
                                                            }
                                                        }

                                                        const isCorrect = 
                                                            userAns !== "Not Answered" && 
                                                            userAns.toUpperCase().trim() === q.correct_option.toUpperCase().trim();

                                                        return (
                                                            <div key={qIdx} className="bg-white p-4 rounded-lg shadow-sm">
                                                                <p className="font-medium mb-2">Q{qIdx + 1}: {questionData.question}</p>
                                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                                    {questionData.options.map((opt, optIdx) => (
                                                                        <div
                                                                            key={optIdx}
                                                                            className={`p-2 rounded ${
                                                                                opt.startsWith(q.correct_option)
                                                                                    ? 'bg-green-100 border border-green-300'
                                                                                    : opt.startsWith(userAns)
                                                                                    ? isCorrect
                                                                                        ? 'bg-green-100 border border-green-300'
                                                                                        : 'bg-red-100 border border-red-300'
                                                                                    : 'bg-gray-50 border border-gray-200'
                                                                            }`}
                                                                        >
                                                                            {opt}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="mt-2 text-sm">
                                                                    <span className="font-medium">Your Answer: </span>
                                                                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                                                        {userAns}
                                                                    </span>
                                                                    <span className="ml-4 font-medium">Correct Answer: </span>
                                                                    <span className="text-green-600">{q.correct_option}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <div className="text-4xl mb-2">📚</div>
                                <p>No recent quizzes found</p>
                                <p className="text-sm mt-1">Start taking quizzes to see your history here!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Side Panel */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-end">
                    <div className="bg-white w-full md:w-1/3 h-full shadow-lg overflow-y-auto p-6 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                            <button
                                onClick={toggleEdit}
                                className="text-gray-500 hover:text-gray-700">
                                ✖
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <img
                                        src={profileData.profilePic}
                                        alt="Profile"
                                        className="h-24 w-24 rounded-full border-4 border-blue-500 object-cover"
                                    />
                                    <label
                                        htmlFor="profilePic"
                                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full shadow cursor-pointer">
                                        📷
                                    </label>
                                    <input
                                        id="profilePic"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePicChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-1">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    defaultValue={profileData.firstName}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-1">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    defaultValue={profileData.lastName}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-1">
                                    Current Organisation
                                </label>
                                <input
                                    type="text"
                                    name="currentOrganisation"
                                    defaultValue={profileData.currentOrganisation}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-1">
                                    Current Industry
                                </label>
                                <input
                                    type="text"
                                    name="currentIndustry"
                                    defaultValue={profileData.currentIndustry}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-1">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    defaultValue={profileData.bio}
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <button
                                    type="button"
                                    onClick={toggleEdit}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                    disabled={saveLoading}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {saveLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
