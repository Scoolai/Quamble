import React from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

export default function LLMchallenge() {
	return (
		<>
			{/* Main Content */}
			<main className="flex flex-col items-center p-10 bg-white rounded-lg">
				<h2 className="text-4xl font-bold text-center mb-3">
					Challenge the AI, Prove Your Knowledge!
				</h2>
				<p className="text-center text-gray-400 text-lg font-normal mb-6">
					Participate in curated quizzes where you compete against
					AI-generated answers
				</p>
				<div className="relative w-full max-w-3xl py-5">
					<img
						src="/LLMchallenge.png" // Replace with your image URL
						alt="AI Challenge"
						className="rounded-xl w-full shadow-xl transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
					/>
				</div>
				<Link to="/aichallenge/challengemodel">
					<button className="mt-6 bg-[#661fff] text-white px-6 py-3 rounded-full hover:bg-[#7a48e8] transition duration-300">
						Start the Challenge
					</button>
				</Link>
			</main>
		</>
	)
}
