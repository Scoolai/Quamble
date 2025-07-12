import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { runConfettiEffect } from "../script/confettiEffect"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const QuestionCard = ({
    question,
    options,
    currentQuestion,
    totalQuestions,
    onAnswerChange,
    onNext,
    quizId,
    theme,
    startTime,
    allUserResponses = [],
}) => {
    const [selectedOption, setSelectedOption] = useState("")
    const [timeLeft, setTimeLeft] = useState(30)
    const [showModal, setShowModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const { getAuthToken } = useAuth()

    // Fix: Remove trailing slash to prevent double slashes
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://3.110.46.79:5000").replace(/\/$/, '')

    useEffect(() => {
        // Set the selected option from the existing user responses for the current question
        const currentAnswerLetter = allUserResponses[currentQuestion - 1] || ""
        
        // Find the full option text that matches the stored letter
        const matchingOption = options.find(option => 
            getOptionLetter(option) === currentAnswerLetter
        )
        
        setSelectedOption(matchingOption || "")
        setTimeLeft(30) // Reset timer for each question (changed back to 30s)

        let timerExpired = false // Flag to ensure `onNext` is called only once
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1 && !timerExpired) {
                    clearInterval(timer)
                    timerExpired = true // Set the flag to true to prevent repeated calls
                    onNext() // Automatically move to the next question when timer ends
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            clearInterval(timer)
            timerExpired = true // Prevent `onNext` call if the component unmounts or re-renders
        }
    }, [currentQuestion, allUserResponses, onNext, options]) // Added 'options' to dependency array

    // Helper function to extract option letter from full option text
    const getOptionLetter = (option) => {
        // Extract A, B, C, or D from options like "A) Some text" or "A Some text"
        const match = option.match(/^([A-D])\)?\s*/)
        return match ? match[1] : option.charAt(0).toUpperCase()
    }

    // Helper function to format time as HH:MM:SS
    const formatTime = (date) => {
        return date.toTimeString().split(' ')[0] // Gets HH:MM:SS from time string
    }

    const handleOptionChange = option => {
        // Set the selected option as the full option text (for display purposes)
        setSelectedOption(option)
        
        // Extract option letter and send to parent
        const optionLetter = getOptionLetter(option)
        onAnswerChange(optionLetter)
    }

    const handleSubmit = () => {
        setShowModal(true)
    }

    const handleConfirmSubmit = async () => {
        setShowModal(false)
        setIsSubmitting(true)

        try {
            const token = getAuthToken()
            const endTime = formatTime(new Date()) // Format as HH:MM:SS

            // Ensure all responses array has the correct length
            const processedResponses = []
            for (let i = 0; i < totalQuestions; i++) {
                processedResponses.push(allUserResponses[i] || "")
            }

            console.log("Submitting quiz:", {
                quiz_id: quizId,
                user_response: processedResponses,
                theme: theme,
                start_time: startTime,
                end_time: endTime,
                totalQuestions: totalQuestions,
                responseLength: processedResponses.length
            })

            // Send each response as a separate form field
            const formData = new FormData()
            formData.append('quiz_id', quizId.toString())
            formData.append('theme', theme)
            formData.append('start_time', startTime)
            formData.append('end_time', endTime)
            
            // Add each response as a separate field (only option letters: A, B, C, D)
            processedResponses.forEach((response, index) => {
                formData.append('user_response', response)
            })

            console.log("FormData contents:")
            for (let [key, value] of formData.entries()) {
                console.log(key, value)
            }

            // Submit quiz using the /submit_quiz API endpoint
            const response = await axios.post(
                `${API_BASE_URL}/submit_quiz`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            console.log("Quiz submission response:", response.data)

            // Check if the response contains quiz results (score, time_taken, etc.)
            if (response.data && (response.data.score !== undefined || response.data.status === "success")) {
                // If submission was successful, run confetti effect and navigate to results
                runConfettiEffect()
                navigate("/aichallenge/result", {
                    state: {
                        quizResult: response.data,
                        userResponses: processedResponses,
                        quizId: quizId,
                        theme: theme,
                    },
                })
            } else {
                console.error("Quiz submission failed:", response.data)
                alert("Failed to submit quiz. Please try again.")
            }
        } catch (error) {
            console.error("Error submitting quiz:", error)
            console.error("Error response:", error.response?.data)
            
            // Enhanced error handling with more specific messages
            if (error.response?.status === 500) {
                console.error("Server error details:", {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                })
                
                alert(`Server error - The backend encountered an issue while processing your quiz submission. Please try again later.`)
            } else if (error.response?.status === 401) {
                alert("Authentication error - Please log in again.")
                navigate("/login")
            } else if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.error || "Invalid request format"
                alert(`Error: ${errorMessage}`)
            } else if (error.response?.data?.error) {
                alert(`Error: ${error.response.data.error}`)
            } else {
                alert("An error occurred while submitting your quiz. Please try again.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="py-20">
            <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-5 m-7 border border-gray-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">
                        Question {currentQuestion} of {totalQuestions}
                    </div>
                    <div className="text-red-500 font-bold">
                        {timeLeft}s left
                    </div>
                </div>

                {/* Question */}
                <div className="mb-4 text-gray-700">
                    <p>{question}</p>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-6 flex flex-col gap-1">
                    {options.map((option, index) => (
                        <label
                            key={index}
                            className="flex items-center space-x-2 border-gray-400 border-2 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="radio"
                                name={`question-${currentQuestion}`}
                                value={option}
                                checked={selectedOption === option}
                                onChange={() => handleOptionChange(option)}
                                className="form-radio text-blue-500 h-4 w-4"
                            />
                            <span className="text-gray-700">{option}</span>
                        </label>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end">
                    {currentQuestion < totalQuestions ? (
                        <button
                            onClick={onNext}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            disabled={isSubmitting}>
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                            disabled={isSubmitting}>
                            Submit Quiz
                        </button>
                    )}
                </div>

                {/* Confirmation Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Submit Quiz
                            </h3>
                            <p className="mb-6 text-gray-700">
                                Are you sure you want to submit the quiz? You won't be able to make changes after submission.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                                    disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmSubmit}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                                    disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Confirm Submit"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QuestionCard
