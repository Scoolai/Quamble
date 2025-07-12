import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Profile from "./Profile"
import { useAuth } from "../context/AuthContext"

export default function Dashboard() {
	const [activeComponent, setActiveComponent] = useState("Dashboard") // Track active component
	const { currentUser, isAuthenticated } = useAuth() // Get auth context
	const navigate = useNavigate() // Initialize useNavigate

	const handleNavigation = (component, path) => {
		setActiveComponent(component)
		navigate(path) // Change URL to the specified path
	}

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<aside className="w-64 bg-white border-r">
				<div className="p-4">
					<div className="mt-6">
						<img
							src="/assets/profile-user.png"
							alt="Profile"
							className="w-20 h-20 rounded-full mx-auto"
						/>
						{isAuthenticated() && (
							<h3 className="mt-4 text-center text-lg font-semibold text-gray-800">
								{currentUser?.username ?? localStorage.getItem("username") ?? "User"}
							</h3>
						)}
					</div>
				</div>
				<nav className="mt-6">
					<ul className="space-y-2">
						<hr />
						<li className="px-3">
							<button
								onClick={() =>
									handleNavigation("Dashboard", "/dashboard")
								} // Navigate to /dashboard
								className={`w-full text-left flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg ${
									activeComponent === "Dashboard"
										? "bg-gray-200"
										: ""
								}`}>
								Dashboard
							</button>
						</li>
						<hr className="w-11/12" />
						<li className="px-3">
							<button
								onClick={() =>
									handleNavigation(
										"Profile",
										"/dashboard/profile"
									)
								} // Navigate to /dashboard/profile
								className={`w-full text-left flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg ${
									activeComponent === "Profile"
										? "bg-gray-200"
										: ""
								}`}>
								Profile
							</button>
						</li>
						<hr className="w-11/12" />
					</ul>
				</nav>
			</aside>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto pb-10">
				{/* Navbar */}
				<header className="flex items-center justify-between p-4 bg-white border-b">
					<h1 className="text-xl font-bold text-gray-800">
						{activeComponent === "Dashboard"
							? "Dashboard"
							: "Profile"}
					</h1>
				</header>

				{/* Main Section */}
				<main className="p-6">
					{activeComponent === "Dashboard" && (
						<>
							{/* Dashboard Content */}
							<section className="mb-6">
								<h2 className="text-lg font-bold text-gray-800">
									Next Steps for You
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-blue-500 font-semibold">
											Add Availability
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											Add time slots to your calendar for
											mentees.
										</p>
									</div>
									<div className="col-span-2 p-4 bg-white shadow rounded-lg">
										<h3 className="text-blue-500 font-semibold">
											Add Payment
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											Set up your payment preferences.
										</p>
									</div>
									<div className="col-span-2 p-4 bg-white shadow rounded-lg">
										<h3 className="text-blue-500 font-semibold">
											Add Availability
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											Add time slots to your calendar for
											mentees.
										</p>
									</div>
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-blue-500 font-semibold">
											Add Payment
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											Set up your payment preferences.
										</p>
									</div>
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-blue-500 font-semibold">
											Add Education
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											Add your academic qualifications for
											mentees.
										</p>
									</div>
									<div className="col-span-2 p-4 bg-white shadow rounded-lg">
										<h3 className="text-blue-500 font-semibold">
											Add Availability
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											Add time slots to your calendar for
											mentees.
										</p>
									</div>
									<div className="col-span-2 p-4 bg-white shadow rounded-lg">
										<h3 className="text-blue-500 font-semibold">
											Add Availability
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											Add time slots to your calendar for
											mentees.
										</p>
									</div>
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-blue-500 font-semibold">
											Add Payment
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											Set up your payment preferences.
										</p>
									</div>
								</div>
							</section>

							<section>
								<h2 className="text-lg font-bold text-gray-800">
									Services
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-gray-800 font-semibold">
											Quick Call
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											30 mins quick call for personalized
											roadmaps.
										</p>
										<p className="text-sm mt-2">
											<span className="font-bold">
												Duration:
											</span>{" "}
											30 min
										</p>
										<p className="text-sm mt-1">
											<span className="font-bold">
												Price:
											</span>{" "}
											₹500
										</p>
										<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
											Edit
										</button>
									</div>
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-gray-800 font-semibold">
											Quick Call
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											30 mins quick call for personalized
											roadmaps.
										</p>
										<p className="text-sm mt-2">
											<span className="font-bold">
												Duration:
											</span>{" "}
											30 min
										</p>
										<p className="text-sm mt-1">
											<span className="font-bold">
												Price:
											</span>{" "}
											₹500
										</p>
										<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
											Edit
										</button>
									</div>
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-gray-800 font-semibold">
											Quick Call
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											30 mins quick call for personalized
											roadmaps.
										</p>
										<p className="text-sm mt-2">
											<span className="font-bold">
												Duration:
											</span>{" "}
											30 min
										</p>
										<p className="text-sm mt-1">
											<span className="font-bold">
												Price:
											</span>{" "}
											₹500
										</p>
										<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
											Edit
										</button>
									</div>
									<div className="col-span-3 p-4 bg-white shadow rounded-lg">
										<h3 className="text-gray-800 font-semibold">
											Quick Call
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											30 mins quick call for personalized
											roadmaps.
										</p>
										<p className="text-sm mt-2">
											<span className="font-bold">
												Duration:
											</span>{" "}
											30 min
										</p>
										<p className="text-sm mt-1">
											<span className="font-bold">
												Price:
											</span>{" "}
											₹500
										</p>
										<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
											Edit
										</button>
									</div>
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-gray-800 font-semibold">
											Quick Call
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											30 mins quick call for personalized
											roadmaps.
										</p>
										<p className="text-sm mt-2">
											<span className="font-bold">
												Duration:
											</span>{" "}
											30 min
										</p>
										<p className="text-sm mt-1">
											<span className="font-bold">
												Price:
											</span>{" "}
											₹500
										</p>
										<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
											Edit
										</button>
									</div>
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-gray-800 font-semibold">
											Quick Call
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											30 mins quick call for personalized
											roadmaps.
										</p>
										<p className="text-sm mt-2">
											<span className="font-bold">
												Duration:
											</span>{" "}
											30 min
										</p>
										<p className="text-sm mt-1">
											<span className="font-bold">
												Price:
											</span>{" "}
											₹500
										</p>
										<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
											Edit
										</button>
									</div>
									<div className="p-4 bg-white shadow rounded-lg">
										<h3 className="text-gray-800 font-semibold">
											Quick Call
										</h3>
										<p className="text-sm text-gray-600 mt-2">
											30 mins quick call for personalized
											roadmaps.
										</p>
										<p className="text-sm mt-2">
											<span className="font-bold">
												Duration:
											</span>{" "}
											30 min
										</p>
										<p className="text-sm mt-1">
											<span className="font-bold">
												Price:
											</span>{" "}
											₹500
										</p>
										<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
											Edit
										</button>
									</div>
								</div>
							</section>
						</>
					)}

					{activeComponent === "Profile" && <Profile />}
				</main>
			</div>
		</div>
	)
}
