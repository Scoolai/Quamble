import React from "react"
import Profile from "./Profile"

export default function Dashboard() {
	return (
		<div className="flex h-screen bg-gray-50">
			<div className="flex-1 overflow-y-auto pb-10">
				{/* Navbar */}
				<header className="flex items-center justify-between p-4 bg-white border-b">
					<h1 className="text-xl font-bold text-gray-800">
						Profile
					</h1>
				</header>

				{/* Main Section */}
				<main className="p-6">
					<Profile />
				</main>
			</div>
		</div>
	)
}
