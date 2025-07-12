import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const defaultQuizCardsData = [
	{
		title: "Science",
		description:
			"The cutting-edge language model that makes interactions a breeze...",
		image: "https://www.svgrepo.com/show/530438/ddos-protection.svg",
		background: "/assets/Cards/science.jpeg",
	},
	{
		title: "History",
		description: "Simply input your subject, click the generate button...",
		image: "https://www.svgrepo.com/show/530442/port-detection.svg",
		background: "/assets/Cards/history.jpg",
	},
	{
		title: "Geography",
		description:
			"We offer advanced customization. You can freely combine options...",
		image: "https://www.svgrepo.com/show/530444/availability.svg",
		background: "/assets/Cards/geography.png",
	},
	{
		title: "Cricket",
		description:
			"Test your knowledge of cricket history, players, records, and rules...",
		image: "https://www.svgrepo.com/show/530445/cricket.svg",
		background: "/assets/Cards/music.jpg",
	},
	{
		title: "Music",
		description: "We offer a free trial service without login...",
		image: "https://www.svgrepo.com/show/530440/machine-vision.svg",
		background: "/assets/Cards/music.jpg",
	},
	{
		title: "Programming",
		description:
			"We offer many templates covering areas such as writing...",
		image: "https://www.svgrepo.com/show/530450/page-analysis.svg",
		background: "/assets/Cards/programming.png",
	},
	{
		title: "Sports",
		description:
			"Our product is compatible with multiple platforms including Web...",
		image: "https://www.svgrepo.com/show/530453/mail-reception.svg",
		background: "/assets/Cards/sports.png",
	},
]

export default function QuizCardsSection() {
	const [quizCardsData, setQuizCardsData] = useState(defaultQuizCardsData)
	const [loading, setLoading] = useState(false)
	const { getAuthToken, isAuthenticated } = useAuth()

	useEffect(() => {
		if (isAuthenticated()) {
			fetchAvailableThemes()
		}
	}, [])

	const fetchAvailableThemes = async () => {
		setLoading(true)
		try {
			const token = getAuthToken()

			// Since there's no specific endpoint to get all themes,
			// we'll try to get theme-specific leaderboards to see what themes are available
			// For now, we'll use the default themes and make them dynamic with question counts

			// You could potentially call multiple theme-specific endpoints here
			// or add a new API endpoint to get all available themes

			setQuizCardsData(defaultQuizCardsData)
		} catch (error) {
			console.error("Error fetching themes:", error)
			// Keep default data on error
		} finally {
			setLoading(false)
		}
	}

	const handleQuizNavigation = theme => {
		console.log(theme)
		// Create dynamic link with theme parameter
		return `/quiz/ai-quiz?theme=${theme}&mode=theme-challenge&numQuestions=5`
	}

	return (
		<section id="quiz-cards" className="py-16 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Choose Your Quiz Category
					</h2>
					<p className="text-xl text-gray-600">
						Test your knowledge across different subjects
					</p>
				</div>

				{/* Quiz cards grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{quizCardsData.map((card, index) => (
						<Link key={index} to={handleQuizNavigation(card.title?.toLowerCase())}>
							<li
								className={`
                  relative 
                  cursor-pointer
                  flex flex-col justify-between
                  min-h-48
                  rounded-tr-3xl rounded-bl-3xl 
                  hover:scale-105 
                  transition-all
                  ease-in-out 
                  duration-500 
                  hover:shadow-2xl 
                  hover:shadow-black 
                  hover:rounded-tl-3xl 
                  hover:rounded-br-3xl
                `}
								style={{
									backgroundImage: `url(${card.background})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}>
								{/* Vintage Overlay */}
								<div className="absolute inset-0 bg-gradient-to-r from-black/60 to-white mix-blend-multiply rounded-tr-3xl rounded-bl-3xl hover:rounded-tl-3xl transition-all ease-out duration-500" />

								<div className="relative block px-6 py-3 mt-auto">
									<div className="flex gap-2 items-center">
										<img
											src={card.image}
											alt={card.title}
											className="h-7 w-7"
										/>
										<h3 className="my-3 font-display font-medium text-white">
											{card.title}
										</h3>
									</div>
									<p className="mt-1.5 text-sm leading-6 text-white">
										{card.description}
									</p>
								</div>
							</li>
						</Link>
					))}
				</div>
			</div>
		</section>
	)
}
