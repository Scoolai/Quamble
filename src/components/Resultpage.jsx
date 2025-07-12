import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTrophy } from "react-icons/fa";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  
  // Get data from navigation state
  const { quizResult, userResponses, quizId, theme } = location.state || {};
  
  // State management - REMOVED: isSharing state
  const [quizScoreData, setQuizScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [attemptedQuizDetails, setAttemptedQuizDetails] = useState(null);
  const [loadingAttemptedQuiz, setLoadingAttemptedQuiz] = useState(true);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://3.110.46.79:5000").replace(/\/$/, '');

  // Helper functions
  const calculateAccuracy = (score, totalQuestions = 5) => {
    if (!score && score !== 0) return "0%";
    
    if (typeof score === 'string' && score.includes('/')) {
      const [correct, total] = score.split('/').map(Number);
      return `${Math.round((correct / total) * 100)}%`;
    }
    
    if (typeof score === 'number') {
      return `${Math.round((score / totalQuestions) * 100)}%`;
    }
    
    return "0%";
  };

  const calculatePercentage = (score, total) => {
    if (!total || total === 0) return 0;
    
    if (typeof score === 'string' && score.includes('/')) {
      const [correct, totalQuestions] = score.split('/').map(Number);
      return Math.round((correct / totalQuestions) * 100);
    }
    
    if (typeof score === 'number') {
      return Math.round((score / total) * 100);
    }
    
    return 0;
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 80) return "Excellent Performance!";
    if (percentage >= 60) return "Good Performance!";
    if (percentage >= 40) return "Fair Performance!";
    return "Keep Practicing!";
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    if (timeString.includes(':')) return timeString;
    return timeString;
  };

  const createFallbackData = (quizResult, userResponses, quizId, theme) => {
    const score = quizResult.score || 0;
    const totalQuestions = userResponses ? userResponses.length : 5;
    const accuracy = calculateAccuracy(score, totalQuestions);
    
    return {
      quiz_id: (quizResult.quiz_id || quizId).toString(),
      theme: theme,
      user_response: userResponses || [],
      score: typeof score === 'number' ? `${score}/${totalQuestions}` : score,
      accuracy: accuracy,
      time_taken: quizResult.time_taken || "N/A"
    };
  };

  // API 1: /view_quiz_score implementation
  useEffect(() => {
    const fetchQuizScore = async () => {
      // First, try the API if we have the required data
      if (!quizId || !theme) {
        console.log("Missing quiz ID or theme, using fallback data");
        if (quizResult && userResponses) {
          const fallbackData = createFallbackData(quizResult, userResponses, quizId, theme);
          setQuizScoreData(fallbackData);
          setLoading(false);
          return;
        } else {
          setError("Quiz ID or theme is missing and no fallback data available");
          setLoading(false);
          return;
        }
      }

      try {
        const token = getAuthToken();
        
        if (!token) {
          console.log("No authentication token, using fallback data");
          if (quizResult && userResponses) {
            const fallbackData = createFallbackData(quizResult, userResponses, quizId, theme);
            setQuizScoreData(fallbackData);
            setLoading(false);
            return;
          } else {
            setError("Authentication token missing");
            setLoading(false);
            return;
          }
        }

        console.log("Fetching quiz score from API with:", { quiz_id: quizId, theme: theme });
        
        // Try multiple API methods since GET is not allowed
        const apiMethods = [
          // Method 1: POST with FormData
          () => {
            const formData = new FormData();
            formData.append('quiz_id', quizId.toString());
            formData.append('theme', theme.toString());
            
            return axios.post(`${API_BASE_URL}/view_quiz_score`, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
              timeout: 10000,
            });
          },
          
          // Method 2: POST with JSON
          () => {
            return axios.post(`${API_BASE_URL}/view_quiz_score`, {
              quiz_id: quizId.toString(),
              theme: theme.toString()
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            });
          },
          
          // Method 3: PUT with FormData
          () => {
            const formData = new FormData();
            formData.append('quiz_id', quizId.toString());
            formData.append('theme', theme.toString());
            
            return axios.put(`${API_BASE_URL}/view_quiz_score`, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
              timeout: 10000,
            });
          },
          
          // Method 4: GET with query parameters (original method)
          () => {
            return axios.get(`${API_BASE_URL}/view_quiz_score`, {
              params: {
                quiz_id: quizId.toString(),
                theme: theme.toString()
              },
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            });
          }
        ];

        let response = null;
        let success = false;

        for (let i = 0; i < apiMethods.length; i++) {
          try {
            console.log(`Trying API method ${i + 1} for /view_quiz_score...`);
            response = await apiMethods[i]();
            console.log(`Method ${i + 1} successful:`, response.data);
            success = true;
            break;
          } catch (methodError) {
            console.log(`Method ${i + 1} failed:`, methodError.response?.status, methodError.response?.data);
            if (i === apiMethods.length - 1) {
              throw methodError; // Re-throw the last error
            }
          }
        }

        if (success && response.data) {
          const quizData = response.data;
          
          // If we don't have correct answers, try to fetch them separately
          
          
          
          setQuizScoreData(quizData);
        } else {
          throw new Error("No valid response from any API method");
        }
        
      } catch (error) {
        console.error("Error fetching quiz score:", error);
        console.error("Error response:", error.response?.data);
        
        // Use fallback data if API fails and we have fallback data
        if (quizResult && userResponses && quizId && theme) {
          console.log("Using fallback data after API error");
          const fallbackData = createFallbackData(quizResult, userResponses, quizId, theme);
          setQuizScoreData(fallbackData);
        } else {
          setError(`Unable to fetch quiz score: ${error.response?.data?.error || error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizScore();
  }, [quizId, theme, getAuthToken, quizResult, userResponses]);

  // API 2: /view_attempted_quiz implementation
  useEffect(() => {
    const fetchAttemptedQuizDetails = async () => {
      if (!quizId || !theme) {
        setLoadingAttemptedQuiz(false);
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) {
          setLoadingAttemptedQuiz(false);
          return;
        }

        const formData = new FormData();
        formData.append('quiz_id', quizId.toString());
        formData.append('theme', theme.toString());

        const response = await axios.post(
          `${API_BASE_URL}/view_attempted_quiz`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            timeout: 10000,
          }
        );

        if (response.data && response.data.questions) {
          setAttemptedQuizDetails(response.data);
        }
      } catch (err) {
        console.error("Error fetching attempted quiz:", err);
        setAttemptedQuizDetails(null);
      } finally {
        setLoadingAttemptedQuiz(false);
      }
    };

    fetchAttemptedQuizDetails();
  }, [quizId, theme, getAuthToken]);

  // API 3: /submit_feedback implementation
  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      alert("Please select a rating before submitting feedback.");
      return;
    }

    if (feedback.trim() === "") {
      alert("Please provide some feedback before submitting.");
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const token = getAuthToken();
      
      if (!token) {
        alert("Authentication required to submit feedback.");
        setIsSubmittingFeedback(false);
        return;
      }

      console.log("Submitting feedback to API:", {
        rating: rating,
        comments: feedback
      });

      const formData = new FormData();
      formData.append('rating', rating.toString());
      formData.append('comments', feedback);

      const response = await axios.post(`${API_BASE_URL}/submit_feedback`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });

      console.log("Feedback API response:", response.data);

      if (response.data && response.data.message) {
        alert(response.data.message);
      } else {
        alert("Feedback submitted successfully!");
      }
      
      // Reset form after successful submission
      setRating(0);
      setFeedback("");
      
      // Navigate to home page after feedback submission
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else if (error.response?.status === 400) {
        alert("Invalid feedback data. Please check your input.");
      } else if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
        navigate("/login");
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Navigation handlers
  const handleRetakeQuiz = () => {
    // Navigate back to quiz with same theme
    navigate(`/quiz?theme=${theme}&mode=theme-challenge`);
  };

  const handleExploreMore = () => {
    // Navigate to challenge selection page
    navigate("/challenge");
  };

  // Helper function to render stars
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          type="button"
          key={i}
          onClick={() => setRating(i)}
          className={`mx-1 text-2xl ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          disabled={isSubmittingFeedback}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  // Add this helper function at the top of the component
  const parseUserResponses = (userResponse) => {
    if (!userResponse) return [];
    
    if (Array.isArray(userResponse)) {
      return userResponse;
    }
    
    if (typeof userResponse === 'string') {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(userResponse);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        // If it's a single string, split by comma
        return userResponse.split(',').map(item => item.trim());
      } catch {
        // If JSON parsing fails, split by comma
        return userResponse.split(',').map(item => item.trim());
      }
    }
    
    return [];
  };

  // Helper function to safely format accuracy
  const formatAccuracy = (accuracy) => {
    if (accuracy === undefined || accuracy === null) return "0%";
    
    if (typeof accuracy === 'number') {
      return `${accuracy}%`;
    }
    
    if (typeof accuracy === 'string') {
      return accuracy.includes('%') ? accuracy : `${accuracy}%`;
    }
    
    return "0%";
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quiz results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !quizScoreData) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mr-2"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!quizScoreData) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-4">Unable to load quiz results</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  // Parse score to get numeric values
  let currentScore = 0;
  let totalQuestions = 5;
  let accuracyPercentage = 0;

  try {
    if (typeof quizScoreData.score === 'string' && quizScoreData.score.includes('/')) {
      [currentScore, totalQuestions] = quizScoreData.score.split('/').map(Number);
    } else if (typeof quizScoreData.score === 'number') {
      currentScore = quizScoreData.score;
      totalQuestions = quizScoreData.user_response ? quizScoreData.user_response.length : 5;
    }
    
    // Handle accuracy as both number and string
    if (quizScoreData.accuracy !== undefined && quizScoreData.accuracy !== null) {
      if (typeof quizScoreData.accuracy === 'number') {
        accuracyPercentage = quizScoreData.accuracy;
      } else if (typeof quizScoreData.accuracy === 'string') {
        // Only use replace if it's a string
        const cleanedAccuracy = quizScoreData.accuracy.replace('%', '');
        accuracyPercentage = parseInt(cleanedAccuracy);
      }
    } else {
      accuracyPercentage = calculatePercentage(currentScore, totalQuestions);
    }
  } catch (e) {
    console.error("Error parsing score data:", e);
    currentScore = 0;
    totalQuestions = 5;
    accuracyPercentage = 0;
  }

  const performanceMessage = getPerformanceMessage(accuracyPercentage);

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Top Section / Header */}
      <div className="bg-blue-600 text-white text-center rounded-xl p-6 md:p-8 mb-6">
        <FaTrophy className="text-6xl text-white mx-auto" />
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          {performanceMessage}
        </h1>
        <p className="text-lg mb-2 capitalize">{theme} Quiz</p>
        <p className="text-sm text-gray-300 font-medium">
          Completed on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500 text-sm">Total Score</p>
          <p className="text-xl font-semibold text-gray-800">
            {quizScoreData.score || `${currentScore}/${totalQuestions}`}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500 text-sm">Accuracy</p>
          <p className="text-xl font-semibold text-gray-800">
            {formatAccuracy(quizScoreData.accuracy)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500 text-sm">Time Taken</p>
          <p className="text-xl font-semibold text-gray-800">
            {formatTime(quizScoreData.time_taken)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500 text-sm">Quiz ID</p>
          <p className="text-xl font-semibold text-gray-800">
            #{quizScoreData.quiz_id}
          </p>
        </div>
      </div>

      {/* User Responses Review - Enhanced version with correct answers */}
      {(() => {
        // Use attemptedQuizDetails if available and loaded
        if (attemptedQuizDetails && attemptedQuizDetails.questions && !loadingAttemptedQuiz) {
          return (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Quick Overview
              </h2>
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Your Answers & Correct Answers:</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                  <div className="font-bold text-center border-b pb-2">Q# & Your Answer</div>
                  <div className="font-bold text-center border-b pb-2">Correct Answer</div>
                  {attemptedQuizDetails.questions.map((q, index) => {
                    // Parse question and options
                    let questionData = { question: "", options: [] };
                    try {
                      questionData = JSON.parse(q.question);
                    } catch (e) {
                      questionData.question = q.question;
                    }

                    // Get user's answer
                    let userAns = "";
                    if (q.user_response) {
                      try {
                        const parsedResponse = JSON.parse(q.user_response);
                        if (Array.isArray(parsedResponse)) {
                          userAns = parsedResponse[0] || "";
                        } else {
                          userAns = parsedResponse;
                        }
                      } catch {
                        userAns = q.user_response.replace(/^["'\[\]\\]+|["'\[\]\\]+$/g, '').trim();
                      }
                    }

                    if (!userAns || userAns === "" || userAns === "," || userAns === "[]" || userAns === "\"\"") {
                      userAns = "Not Answered";
                    }

                    const isCorrect = 
                      userAns !== "Not Answered" && 
                      userAns.toUpperCase().trim() === q.correct_option.toUpperCase().trim();

                    return (
                      <div key={q.ques_id} className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
                        {/* Question */}
                        <p className="font-semibold mb-4">{questionData.question}</p>
                        
                        {/* Options Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {questionData.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`p-3 rounded-lg ${
                                option.startsWith(q.correct_option) 
                                  ? 'bg-green-100 border border-green-300' 
                                  : option.startsWith(userAns) && userAns !== "Not Answered"
                                    ? isCorrect 
                                      ? 'bg-green-100 border border-green-300'
                                      : 'bg-red-100 border border-red-300'
                                    : 'bg-white border border-gray-200'
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>

                        {/* Answer Section */}
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <span className="font-medium">Your Answer: </span>
                            <span className={
                              userAns === "Not Answered"
                                ? "text-gray-500 font-bold"
                                : isCorrect
                                ? "text-green-700 font-bold"
                                : "text-red-700 font-bold"
                            }>
                              {userAns}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="font-medium">Correct Answer: </span>
                            <span className="text-green-700 font-bold">
                              {q.correct_option}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        // Fallback to old logic if attemptedQuizDetails not available
        const userResponses = parseUserResponses(quizScoreData.user_response);
        return userResponses.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Quick Overview
            </h2>
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Your Answers:</h3>
              <div className="grid grid-cols-5 gap-2">
                {userResponses.map((response, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-blue-100 text-blue-800 font-semibold p-2 rounded">
                      Q{index + 1}: {response || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <button 
          onClick={handleRetakeQuiz}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
        >
          Retake Quiz
        </button>
        <button 
          onClick={handleExploreMore}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
        >
          Explore More
        </button>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Your Feedback</h2>
        <p className="text-gray-600 mb-4">Rate this quiz and help us improve</p>

        {/* Star Rating */}
        <div className="flex items-center mb-4">{renderStars()}</div>

        {/* Feedback Textarea */}
        <textarea
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          placeholder="Share your thoughts about this quiz..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isSubmittingFeedback}
        />

        <button
          onClick={handleSubmitFeedback}
          disabled={isSubmittingFeedback}
          className="bg-blue-600 text-white px-6 py-3 rounded-3xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}