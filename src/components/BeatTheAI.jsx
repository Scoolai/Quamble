import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { getAuthToken, isAuthenticated } from "../utils/auth"

// Fix: Remove trailing slash to prevent double slashes
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://raj-tomar001-quamble.hf.space/").replace(/\/$/, '')

// Add this helper function at the top of your file
function parseOptionsFromQuestion(questionText) {
    // Example: "Which...?\nA) Tardigrades\nB) Dolphins\nC) Camels\nD) Honeybees"
    const optionLines = questionText.split('\n').filter(line => /^[A-D]\)/.test(line.trim()));
    const options = {};
    optionLines.forEach(line => {
        const match = line.match(/^([A-D])\)\s*(.*)$/);
        if (match) {
            options[match[1]] = match[2];
        }
    });
    return options;
}

const THEME_OPTIONS = [
  "random facts about animals",
  "science",
  "history",
  "sports",
  "music",
  "geography",
  "programming",
  // Add more themes as needed
];

// Beat the AI Game Component
const BeatTheAI = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const challengeType = params.get("challengeType") || "headtohead";
    const themeFromUrl = params.get("theme");

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
    const [selectedTheme, setSelectedTheme] = useState(themeFromUrl || "");
    const [inputTheme, setInputTheme] = useState(""); // New state for input theme
    const [userSelectedOption, setUserSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login")
        }
    }, [navigate])

    useEffect(() => {
      // If you want to get theme from URL:
      const params = new URLSearchParams(window.location.search);
      const themeFromUrl = params.get("theme");
      if (themeFromUrl === "random" || !themeFromUrl) {
        setSelectedTheme("random");
      } else {
        setSelectedTheme(themeFromUrl);
      }
    }, []);

    // Start new game
    const startGame = async () => {
      let themeToUse = "random topics";  // Changed from "random" to "random topics"
      if (challengeType === "theme") {
        themeToUse = selectedTheme || "general";
      }
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        score: 0,
        questionCount: 0,
        gameOver: false,
        error: null,
        theme: themeToUse,
      }));
      await fetchNextQuestion(themeToUse);
    }

    // Start new game with custom theme
    const startGameWithTheme = async (theme) => {
        const themeToUse = theme || "random topics";
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            score: 0,
            questionCount: 0,
            gameOver: false,
            error: null,
            theme: themeToUse,
        }));
        await fetchNextQuestion(themeToUse);
    }

    // Fetch next question from API
    const fetchNextQuestion = async (themeOverride) => {
        if (!isAuthenticated()) return

        try {
            setGameState(prev => ({ ...prev, isLoading: true, error: null }))
            
            const token = getAuthToken()
            const formData = new FormData()
            
            const themeToSend = themeOverride || gameState.theme || "random facts about animals"
            formData.append("theme", themeToSend)
            // Score is already in 0-100 scale
            formData.append("score", gameState.score.toString())

            console.log("Fetching next question...")
            console.log("API URL:", `${API_BASE_URL}/beat_the_ai`)
            console.log("Data:", { theme: themeToSend, score: gameState.score })

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
                setGameState(prev => ({
                    ...prev,
                    currentQuestion: {
                        question: response.data.question.split('\n')[0],
                        options: parseOptionsFromQuestion(response.data.question),
                        correctOption: response.data["Correct Option"], // <-- store correct option
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
        setUserSelectedOption(selectedOption);
        setShowFeedback(true);

        const isCorrect =
            gameState.currentQuestion &&
            selectedOption === gameState.currentQuestion.correctOption;

        if (isCorrect) {
            setGameState(prev => ({
                ...prev,
                score: prev.score + 10 // Each correct answer is 10 marks
            }))
        }

        // Don't fetch next question yet; wait for Next button
        if (gameState.questionCount >= 10) {
            setTimeout(() => {
                setGameState(prev => ({
                    ...prev,
                    gameOver: true,
                    isPlaying: false
                }))
            }, 1000);
        }
    };

    // Next question handler
    const handleNextQuestion = () => {
        setUserSelectedOption(null);
        setShowFeedback(false);
        fetchNextQuestion();
    };

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

    // If not playing, show the start card with theme selection
    if (!gameState.isPlaying && !gameState.gameOver) {
        if (challengeType === "theme") {
            // Show theme input for Theme Challenge
            return (
                <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                    <div className="mt-8 flex flex-col items-center">
                        <div className="mb-6 w-80">
                            <label className="block text-white text-lg font-semibold mb-2">
                                Enter Theme
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-300 shadow"
                                placeholder="Type your theme..."
                                value={inputTheme}
                                onChange={e => setInputTheme(e.target.value)}
                            />
                        </div>
                        <div
                            onClick={() => {
                                setSelectedTheme(inputTheme);
                                startGameWithTheme(inputTheme);
                            }}
                            className={`relative cursor-pointer flex flex-col justify-between min-h-32 w-80 rounded-tr-3xl rounded-bl-3xl hover:scale-105 transition-all ease-in-out duration-500 hover:shadow-2xl hover:shadow-black hover:rounded-tl-3xl hover:rounded-br-3xl bg-gradient-to-r from-red-600 to-purple-600 ${!inputTheme.trim() ? "opacity-50 pointer-events-none" : ""}`}>
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
            );
        }
        // Head-to-head: just show the start button
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="mt-8 flex flex-col items-center">
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
        );
    }

    // Show game over screen
    if (gameState.gameOver) {
        const didBeatAI = gameState.score >= 80;
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <h1 className={`text-3xl font-bold mb-4 ${didBeatAI ? "text-green-600" : "text-red-600"}`}>
                        {didBeatAI
                            ? "🎉 Congratulations! You Beat the AI!"
                            : "😢 Ohh no!! Better luck next time"}
                    </h1>
                    <p className="text-lg text-gray-700 mb-6">
                        You scored {gameState.score} out of 100.
                    </p>
                    <button
                        onClick={resetGame}
                        className="bg-[#661fff] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4b1bbd] transition-all"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        );
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
                        <span>Score: {gameState.score} / 100</span>
                        <span>Difficulty: {gameState.difficulty}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Theme: {gameState.theme}
                    </div>
                </div>

                {/* Question */}
                {gameState.currentQuestion && gameState.currentQuestion.options && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                            {gameState.currentQuestion.question}
                        </h2>

                        {/* Options */}
                        <div className="space-y-4">
                            {Object.entries(gameState.currentQuestion.options).map(([key, value]) => {
                                let optionStyle = "bg-gray-50 hover:bg-blue-50 border-gray-200 hover:border-blue-300";
                                if (showFeedback) {
                                    if (key === gameState.currentQuestion.correctOption) {
                                        optionStyle = "bg-green-100 border-green-400 text-green-700 font-bold";
                                    } else if (key === userSelectedOption) {
                                        optionStyle = "bg-red-100 border-red-400 text-red-700 font-bold";
                                    } else {
                                        optionStyle = "bg-gray-50 border-gray-200 text-gray-800";
                                    }
                                } else if (userSelectedOption === key) {
                                    optionStyle = "bg-blue-100 border-blue-400";
                                }
                                return (
                                    <button
                                        key={key}
                                        disabled={showFeedback}
                                        onClick={() => {
                                            if (!showFeedback) handleAnswer(key);
                                        }}
                                        className={`w-full text-left p-4 border-2 rounded-lg transition-all ${optionStyle}`}
                                    >
                                        <span className="font-semibold text-blue-600 mr-3">
                                            {key}:
                                        </span>
                                        <span className="text-gray-800">{value}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {/* Next Button */}
                        {showFeedback && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        {/* Quit Button */}
                        <div className="text-center mt-4">
                            <button
                                onClick={resetGame}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all">
                                Quit Game
                            </button>
                        </div>
                    </div>
                )}
                {/* Challenge Type Selection - New Section */}
                {challengeType === "Theme Challenge" && (
                  <div className="bg-white rounded-lg shadow p-5 mb-4">
                    <h3 className="text-md font-bold text-gray-700 mb-3">Select Theme</h3>
                    <div className="flex flex-wrap gap-2">
                      {THEME_OPTIONS.map((theme) => (
                        <button
                          key={theme}
                          className={`px-4 py-2 rounded-full border text-sm font-medium ${
                            selectedTheme === theme
                              ? "bg-[#661fff] text-white border-[#661fff]"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                          onClick={() => setSelectedTheme(theme)}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </button>
                      ))}
                    </div>
                    {/* Optional: allow custom theme entry */}
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Or type a custom theme..."
                        value={selectedTheme}
                        onChange={e => setSelectedTheme(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#661fff]"
                      />
                    </div>
                  </div>
                )}
            </div>
        </div>
    )
}

export default BeatTheAI
