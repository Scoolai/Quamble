import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import QuestionCard from "./QuestionCard"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const QuizCard = () => {
    const [quizQuestions, setQuizQuestions] = useState([])
    const [correctAnswers, setCorrectAnswers] = useState([])
    const [userAnswers, setUserAnswers] = useState([])
    const [currentQuestion, setCurrentQuestion] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quizId, setQuizId] = useState(null)
    const [startTime, setStartTime] = useState(null)
    const [difficulty, setDifficulty] = useState("Easy")
    const [isHeadToHead, setIsHeadToHead] = useState(false)
    const [currentScore, setCurrentScore] = useState(0)
    const [availableQuizzes, setAvailableQuizzes] = useState([])
    const [selectedQuizIndex, setSelectedQuizIndex] = useState(0)
    const [showQuizSelection, setShowQuizSelection] = useState(false)

    const location = useLocation()
    const navigate = useNavigate()
    const { getAuthToken, isAuthenticated } = useAuth()

    // Fix: Remove trailing slash to prevent double slashes
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://3.110.46.79:5000").replace(/\/$/, '')

    // Extract query parameters
    const queryParams = new URLSearchParams(location.search)
    const theme = queryParams.get("theme") || "general"
    const mode = queryParams.get("mode") || "theme-challenge"
    const numQuestions = queryParams.get("numQuestions") || 5

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login")
            return
        }

        // Record the start time when the component mounts in HH:MM:SS format
        setStartTime(formatTime(new Date()))
        setIsHeadToHead(mode === "head-to-head")

        // Initialize user answers array based on the mode
        if (mode === "head-to-head") {
            // For head-to-head, we don't know the number of questions in advance
            setUserAnswers([])
        } else {
            setUserAnswers(Array(numQuestions).fill(""))
        }

        // Fetch quiz based on the mode
        fetchQuiz()
    }, [isAuthenticated, theme, mode, numQuestions, navigate])

    // Load a selected quiz from the available quizzes
    const loadSelectedQuiz = (selectedQuiz) => {
        try {
            console.log("Loading selected quiz:", selectedQuiz)

            // Parse the questions from JSON strings
            const processedQuestions = selectedQuiz.questions.map(questionStr => {
                try {
                    const parsed = JSON.parse(questionStr)
                    return {
                        question: parsed.question,
                        options: parsed.options || [],
                        difficulty: "Medium", // Default difficulty
                        theme: theme,
                    }
                } catch (parseError) {
                    console.error("Error parsing question:", parseError, questionStr)
                    return {
                        question: questionStr,
                        options: [],
                        difficulty: "Medium",
                        theme: theme,
                    }
                }
            })

            setQuizId(selectedQuiz.quiz_id)
            setQuizQuestions(processedQuestions)
            setCorrectAnswers(selectedQuiz.correct_options || [])
            
            // Fix: Initialize userAnswers with exact length matching questions
            const initialAnswers = new Array(processedQuestions.length).fill("")
            setUserAnswers(initialAnswers)
            
            setShowQuizSelection(false)
            setLoading(false)
        } catch (err) {
            console.error("Error loading selected quiz:", err)
            setError("Failed to load selected quiz")
            setLoading(false)
        }
    }

    // Create a new quiz (fallback method)
    const createNewQuiz = async () => {
        try {
            const token = getAuthToken()
            
            // Use FormData instead of JSON
            const formData = new FormData()
            formData.append('theme', theme)
            formData.append('num_questions', parseInt(numQuestions).toString())

            const response = await axios.post(
                `${API_BASE_URL}/create_quiz_from_bank`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            if (response.data) {
                setQuizId(response.data.quiz_id)
                const questions = response.data.questions.map(q => {
                    if (typeof q === "string") {
                        try {
                            return JSON.parse(q)
                        } catch {
                            return { question: q, options: [] }
                        }
                    }
                    return q
                })
                setQuizQuestions(questions)
                setCorrectAnswers(response.data.correct_options || [])
                
                // Fix: Initialize userAnswers with exact length matching questions
                const initialAnswers = new Array(questions.length).fill("")
                setUserAnswers(initialAnswers)
                
                setLoading(false)
            }
        } catch (err) {
            console.error("Error creating new quiz:", err)
            throw err
        }
    }

    // Fetch available quizzes for the theme
    const fetchQuizzesForTheme = async () => {
        try {
            const token = getAuthToken()
            
            console.log("Fetching quizzes for theme:", theme)
            console.log("API URL:", `${API_BASE_URL}/fetch_quiz_for_theme`)

            // Use FormData instead of JSON
            const formData = new FormData()
            formData.append('theme', theme)

            const response = await axios.post(
                `${API_BASE_URL}/fetch_quiz_for_theme`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            console.log("Theme quizzes response:", response.data)

            if (response.data && response.data.quizzes && Array.isArray(response.data.quizzes)) {
                // Filter out empty quizzes
                const validQuizzes = response.data.quizzes.filter(quiz => 
                    quiz.questions && quiz.questions.length > 0
                )

                // Sort quizzes by quiz_id in descending order (newest first)
                const sortedQuizzes = validQuizzes.sort((a, b) => b.quiz_id - a.quiz_id)

                setAvailableQuizzes(sortedQuizzes)
                
                if (sortedQuizzes.length > 0) {
                    // If multiple quizzes are available, show selection UI
                    if (sortedQuizzes.length > 1) {
                        setShowQuizSelection(true)
                        setLoading(false)
                    } else {
                        // Load the only available quiz
                        loadSelectedQuiz(sortedQuizzes[0])
                    }
                } else {
                    // No valid quizzes found, fallback to create new quiz
                    console.log("No valid quizzes found for theme, creating new quiz")
                    await createNewQuiz()
                }
            } else {
                console.log("No quizzes found for theme, creating new quiz")
                await createNewQuiz()
            }
        } catch (err) {
            console.error("Error fetching theme quizzes:", err)
            
            // Fallback to creating new quiz if fetch fails
            if (err.response?.status === 404) {
                console.log("Theme quizzes not found, creating new quiz")
                await createNewQuiz()
            } else {
                console.log("Error occurred, creating new quiz")
                await createNewQuiz()
            }
        }
    }

    const fetchQuiz = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = getAuthToken()
            
            // Choose the appropriate API endpoint based on the mode
            if (mode === "head-to-head") {
                // Use beat_the_ai API for head-to-head mode with proper parameters
                const formData = new FormData()
                formData.append("theme", theme || "random")
                formData.append("score", currentScore.toString())

                console.log("Fetching beat_the_ai question...")
                console.log("API URL:", `${API_BASE_URL}/beat_the_ai`)
                console.log("Data:", { theme: theme || "random", score: currentScore })

                const response = await axios.post(
                    `${API_BASE_URL}/beat_the_ai`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                )

                // For beat_the_ai, we get one question at a time
                if (response.data && response.data.question) {
                    const questionData = {
                        question: response.data.question,
                        options: Object.values(response.data.options || {}),
                        difficulty: response.data.difficulty,
                        theme: response.data.theme,
                    }

                    setQuizQuestions([questionData])
                    setDifficulty(response.data.difficulty)
                    setCorrectAnswers([]) // Fixed: Added missing closing parenthesis
                    setUserAnswers([""])

                    // Generate a temporary quiz ID for beat_the_ai mode
                    setQuizId(`beat_ai_${Date.now()}`)
                    setLoading(false)
                }
            } else {
                // For theme-challenge mode, fetch existing quizzes
                await fetchQuizzesForTheme()
                return // fetchQuizzesForTheme handles the loading state
            }
        } catch (err) {
            console.error("Error fetching quiz:", err)
            
            // Enhanced error handling
            if (err.response?.status === 500) {
                setError("Server error - Please try again later. The backend service might be temporarily unavailable.")
            } else if (err.response?.status === 401) {
                setError("Authentication error - Please log in again.")
                navigate("/login")
            } else if (err.response?.data?.error) {
                setError(err.response.data.error)
            } else {
                setError("Failed to load quiz. Please check your internet connection and try again.")
            }
            setLoading(false)
        }
    }

    const fetchNextBeatTheAIQuestion = async () => {
        try {
            const token = getAuthToken()
            const formData = new FormData()
            formData.append("theme", theme || "random")
            formData.append("score", currentScore.toString())

            console.log("Fetching next beat_the_ai question...")
            console.log("Current score:", currentScore)

            const response = await axios.post(
                `${API_BASE_URL}/beat_the_ai`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            if (response.data && response.data.question) {
                const questionData = {
                    question: response.data.question,
                    options: Object.values(response.data.options || {}),
                    difficulty: response.data.difficulty,
                    theme: response.data.theme,
                }

                // Add the new question to the existing questions
                setQuizQuestions(prev => [...prev, questionData])
                setDifficulty(response.data.difficulty)
                setUserAnswers(prev => [...prev, ""])
                setCurrentQuestion(prev => prev + 1)
            }
        } catch (error) {
            console.error("Error fetching next question:", error)
            
            if (error.response?.status === 500) {
                setError("Server error - The AI is temporarily unavailable.")
            } else {
                setError("Failed to fetch next question.")
            }
        }
    }

    const handleAnswerChange = answer => {
        // Update the user's ansr for the current question
        const updatedAnswers = [...userAnswers]
        updatedAnswers[currentQuestion - 1] = answer
        setUserAnswers(updatedAnswers)

        // Debug logging
        console.log("Answer changed:", {
            currentQuestion: currentQuestion,
            answer: answer,
            updatedAnswers: updatedAnswers,
            totalQuestions: quizQuestions.length
        })

        // For head-to-head mode, increment score if answer is correct
        if (isHeadToHead) {
            // This is a simplified logic - in reality, you'd need to check if the answer is correct
            // For now, we'll assume every answer increases the score
            setCurrentScore(prev => prev + 1)
        }
    }

    const handleNext = () => {
        // For head-to-head mode, fetch next question dynamically
        if (isHeadToHead) {
            fetchNextBeatTheAIQuestion()
        } else {
            // Regular mode - move to next existing question
            if (currentQuestion < quizQuestions.length) {
                setCurrentQuestion(currentQuestion + 1)
            }
        }
    }

    const handleQuizSelection = (quizIndex) => {
        setSelectedQuizIndex(quizIndex)
        const selectedQuiz = availableQuizzes[quizIndex]
        loadSelectedQuiz(selectedQuiz)
    }

    // Helper function to format time as HH:MM:SS
    const formatTime = (date) => {
        return date.toTimeString().split(' ')[0] // Gets HH:MM:SS from time string
    }

    // Show quiz selection screen
    if (showQuizSelection && availableQuizzes.length > 1) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Select a Quiz
                            </h1>
                            <p className="text-gray-600">
                                Choose from {availableQuizzes.length} available quizzes for <span className="font-semibold text-blue-600">{theme}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableQuizzes.map((quiz, index) => (
                                <div
                                    key={quiz.quiz_id}
                                    onClick={() => handleQuizSelection(index)}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-300">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            Quiz #{quiz.quiz_id}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {quiz.questions.length} Questions
                                        </p>
                                        <div className="text-sm text-gray-500 mb-4">
                                            <p className="font-semibold text-blue-600">Ready to Challenge?</p>
                                            <p className="italic">
                                                Test your knowledge with {quiz.questions.length} carefully crafted questions
                                            </p>
                                        </div>
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                                            Start Quiz
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                                ← Back to Themes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#661fff] mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {mode === "head-to-head"
                            ? "Preparing AI Challenge..."
                            : "Loading Quiz..."}
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <div className="space-y-2">
                        <button
                            onClick={fetchQuiz}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors mr-2">
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!quizQuestions.length) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="text-gray-500 text-xl mb-4">
                        No questions available
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    const currentQuestionData = quizQuestions[currentQuestion - 1]

    return (
        <div>
            {/* Show difficulty and mode info for head-to-head */}
            {isHeadToHead && (
                <div className="text-center py-4 bg-gradient-to-r from-red-500 to-purple-600 text-white">
                    <h2 className="text-lg font-bold">
                        🤖 Beat the AI Challenge
                    </h2>
                    <p className="text-sm">
                        Difficulty: {difficulty} | Theme:{" "}
                        {currentQuestionData?.theme || theme} | Score: {currentScore}
                    </p>
                </div>
            )}

            {/* Show quiz info for regular mode */}
            {!isHeadToHead && quizId && (
                <div className="text-center py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <p className="text-sm">
                        Quiz #{quizId} | Theme: {theme} | {quizQuestions.length} Questions
                    </p>
                </div>
            )}

            <QuestionCard
                question={currentQuestionData.question}
                options={currentQuestionData.options || []}
                currentQuestion={currentQuestion}
                totalQuestions={quizQuestions.length}
                onAnswerChange={handleAnswerChange}
                onNext={handleNext}
                quizId={quizId}
                theme={theme}
                startTime={startTime}
                allUserResponses={userAnswers}
            />
        </div>
    )
}
export default QuizCard
