import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { getAuthToken, isAuthenticated } from "../utils/auth"

// Fix: Remove trailing slash to prevent double slashes
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://3.110.46.79:5000").replace(/\/$/, '')

// Beat the AI Game Component
const BeatTheAI = () => {
    const navigate = useNavigate()
    const [gameState, setGameState] = useState({
        isPlaying: false,
        currentQuestion: null,
        score: 0,
        difficulty: "Easy",
        theme: "",
        questionCount: 0,
        isLoading: false,
        gameOver: false,
        error: null
    })

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login")
        }
    }, [navigate])

    // Start new game
    const startGame = async () => {
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            score: 0,
            questionCount: 0,
            gameOver: false,
            error: null
        }))
        
        await fetchNextQuestion()
    }

    // Fetch next question from API
    const fetchNextQuestion = async () => {
        if (!isAuthenticated()) return

        try {
            setGameState(prev => ({ ...prev, isLoading: true, error: null }))
            
            const token = getAuthToken()
            const formData = new FormData()
            
            // Send current theme and score to determine difficulty
            formData.append("theme", gameState.theme || "random")
            formData.append("score", gameState.score.toString())

            console.log("Fetching next question...")
            console.log("API URL:", `${API_BASE_URL}/beat_the_ai`)
            console.log("Data:", { theme: gameState.theme || "random", score: gameState.score })

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

            console.log("Beat the AI response:", response.data)

            if (response.data && response.data.question) {
                setGameState(prev => ({
                    ...prev,
                    currentQuestion: {
                        question: response.data.question,
                        options: response.data.options,
                        difficulty: response.data.difficulty,
                        theme: response.data.theme
                    },
                    difficulty: response.data.difficulty,
                    theme: response.data.theme,
                    questionCount: prev.questionCount + 1,
                    isLoading: false
                }))
            } else {
                throw new Error("Invalid response format")
            }
        } catch (err) {
            console.error("Error fetching question:", err)
            
            if (err.response && err.response.status === 401) {
                localStorage.removeItem("authToken")
                navigate("/login")
                return
            }

            let errorMessage = "Failed to fetch question"
            if (err.response?.status === 500) {
                errorMessage = "Server error - The AI is temporarily unavailable. Please try again later."
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            } else if (err.request) {
                errorMessage = "Network error - Please check your connection"
            }

            setGameState(prev => ({
                ...prev,
                error: errorMessage,
                isLoading: false
            }))
        }
    }

    // Handle answer selection
    const handleAnswer = async (selectedOption) => {
        // For now, we'll assume the answer is correct and increment score
        // In a real implementation, you'd need another API to check the answer
        const isCorrect = true // This should come from answer validation API
        
        if (isCorrect) {
            setGameState(prev => ({
                ...prev,
                score: prev.score + 1
            }))
        }

        // Check if game should continue (let's say max 10 questions)
        if (gameState.questionCount >= 10) {
            setGameState(prev => ({
                ...prev,
                gameOver: true,
                isPlaying: false
            }))
        } else {
            // Fetch next question with updated score
            setTimeout(() => {
                fetchNextQuestion()
            }, 1000)
        }
    }

    // Reset game
    const resetGame = () => {
        setGameState({
            isPlaying: false,
            currentQuestion: null,
            score: 0,
            difficulty: "Easy",
            theme: "",
            questionCount: 0,
            isLoading: false,
            gameOver: false,
            error: null
        })
    }

    // If not playing, show the start card
    if (!gameState.isPlaying && !gameState.gameOver) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="mt-8 flex justify-center">
                    <div
                        onClick={startGame}
                        className="relative cursor-pointer flex flex-col justify-between min-h-32 w-80 rounded-tr-3xl rounded-bl-3xl hover:scale-105 transition-all ease-in-out duration-500 hover:shadow-2xl hover:shadow-black hover:rounded-tl-3xl hover:rounded-br-3xl bg-gradient-to-r from-red-600 to-purple-600">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent rounded-tr-3xl rounded-bl-3xl hover:rounded-tl-3xl transition-all ease-out duration-500" />
                        <div className="relative block px-6 py-4 text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                🤖 Beat the AI
                            </h3>
                            <p className="text-sm text-white">
                                Challenge our AI with increasing difficulty!
                            </p>
                            <p className="text-xs text-white/80 mt-2">
                                Click to start playing
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show game over screen
    if (gameState.gameOver) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Game Over! 🎉
                    </h2>
                    <p className="text-xl text-gray-600 mb-2">
                        Final Score: {gameState.score}/{gameState.questionCount}
                    </p>
                    <p className="text-lg text-gray-500 mb-6">
                        Difficulty Reached: {gameState.difficulty}
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={startGame}
                            className="w-full bg-gradient-to-r from-red-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-purple-700 transition-all">
                            Play Again
                        </button>
                        <Link
                            to="/"
                            className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Show loading state
    if (gameState.isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">
                        AI is generating your question...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Difficulty: {gameState.difficulty}
                    </p>
                </div>
            </div>
        )
    }

    // Show error state
    if (gameState.error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">
                        Error 😞
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {gameState.error}
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={fetchNextQuestion}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                            Try Again
                        </button>
                        <button
                            onClick={resetGame}
                            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                            Back to Start
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Show current question
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🤖 Beat the AI
                    </h1>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Question {gameState.questionCount}/10</span>
                        <span>Score: {gameState.score}</span>
                        <span>Difficulty: {gameState.difficulty}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Theme: {gameState.theme}
                    </div>
                </div>

                {/* Question */}
                {gameState.currentQuestion && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                            {gameState.currentQuestion.question}
                        </h2>

                        {/* Options */}
                        <div className="space-y-4">
                            {Object.entries(gameState.currentQuestion.options).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => handleAnswer(key)}
                                    className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-all">
                                    <span className="font-semibold text-blue-600 mr-3">
                                        {key}:
                                    </span>
                                    <span className="text-gray-800">{value}</span>
                                </button>
                            ))}
                        </div>

                        {/* Quit Button */}
                        <div className="text-center mt-8">
                            <button
                                onClick={resetGame}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all">
                                Quit Game
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BeatTheAI
