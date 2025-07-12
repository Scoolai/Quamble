import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
} from "@headlessui/react"
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Link, useLocation, useNavigate } from "react-router-dom" // Import useLocation
import { FaSearch } from "react-icons/fa"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const navigation = [
	{ name: "Dashboard", href: "/dashboard" },
	{ name: "Home", href: "/" },
	{ name: "Quizzes", href: "/quiz" },
	{ name: "About Us", href: "/aboutus" },
	{ name: "AI Challenge", href: "/aichallenge" },
]

function classNames(...classes) {
	return classes.filter(Boolean).join(" ")
}

export default function Navbar() {
	const { pathname } = useLocation() // Get current route
	const [searchQuery, setSearchQuery] = useState("")
	const { currentUser, logout, isAuthenticated } = useAuth() // Get auth context
	const navigate = useNavigate() // Add useNavigate hook

	return (
		<Disclosure as="nav" className="bg-gray-800 sticky top-0 z-20">
			<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
				<div className="relative flex h-16 items-center justify-between">
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						{/* Mobile menu button */}
						<DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
							<span className="absolute -inset-0.5" />
							<span className="sr-only">Open main menu</span>
							<Bars3Icon
								aria-hidden="true"
								className="block h-6 w-6 group-data-[open]:hidden"
							/>
							<XMarkIcon
								aria-hidden="true"
								className="hidden h-6 w-6 group-data-[open]:block"
							/>
						</DisclosureButton>
					</div>
					<div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
						<div className="flex shrink-0 items-center">
							<img
								alt="Your Company"
								src="/assets/logo.png"
								className="h-10 w-auto"
							/>
						</div>
						<div className="hidden sm:ml-6 sm:block">
							<div className="flex space-x-4">
								{navigation.map(item => (
									<Link
										key={item.name}
										to={item.href}
										className={classNames(
											pathname === item.href
												? "bg-gray-900 text-white"
												: "text-gray-300 hover:bg-gray-700 hover:text-white",
											"rounded-md px-3 py-2 text-sm font-medium"
										)}>
										{item.name}
									</Link>
								))}
							</div>
						</div>
					</div>
					<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
						{/* Search field with icon */}
						<div className="relative hidden sm:block">
							<FaSearch className="absolute left-2 top-2 text-gray-400" />
							<input
								type="text"
								placeholder="Search..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="pl-8 pr-2 py-1 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-white"
							/>
						</div>

						{/* Notification button */}
						{isAuthenticated() && (
							<button
								type="button"
								className="ml-3 relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
								<span className="absolute -inset-1.5" />
								<span className="sr-only">
									View notifications
								</span>
								<BellIcon
									aria-hidden="true"
									className="h-6 w-6"
								/>
							</button>
						)}

						{/* Profile dropdown */}
						{isAuthenticated() && (
							<Menu as="div" className="relative ml-3">
								<div>
									<MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
										<span className="absolute -inset-1.5" />
										<span className="sr-only">
											Open user menu
										</span>
										<img
											alt=""
											src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
											className="h-8 w-8 rounded-full"
										/>
									</MenuButton>
								</div>
								<MenuItems
									transition
									className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none">
									<MenuItem>
										<button
											onClick={() =>
												navigate("/dashboard/profile")
											}
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
											Your Profile
										</button>
									</MenuItem>
									<MenuItem>
										<a
											href="#"
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
											Settings
										</a>
									</MenuItem>
									<MenuItem>
										{/* Sign out button with logout function */}
										<button
											onClick={logout}
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
											Sign out
										</button>
									</MenuItem>
								</MenuItems>
							</Menu>
						)}
						{/* Login button */}
						{!isAuthenticated() ? (
							<button
								type="button"
								className="ml-3 rounded-md bg-indigo-600 px-3 py-1 text-white font-medium hover:bg-indigo-500">
								<Link to="/login">Login</Link>
							</button>
						) : currentUser ? (
							<div className="ml-3 text-sm text-gray-300">
								Welcome, {currentUser.username}
							</div>
						) : (
							<div className="ml-3 text-sm text-gray-300">
								Welcome {localStorage.getItem("username") || "User"}
							</div>
						)}

					</div>
				</div>
			</div>

			<DisclosurePanel className="sm:hidden">
				<div className="space-y-1 px-2 pb-3 pt-2">
					{navigation.map(item => (
						<DisclosureButton
							key={item.name}
							as="a"
							href={item.href}
							aria-current={
								pathname === item.href ? "page" : undefined
							}
							className={classNames(
								pathname === item.href
									? "bg-gray-900 text-white"
									: "text-gray-300 hover:bg-gray-700 hover:text-white",
								"block rounded-md px-3 py-2 text-base font-medium"
							)}>
							{item.name}
						</DisclosureButton>
					))}
				</div>
			</DisclosurePanel>
		</Disclosure>
	)
}
