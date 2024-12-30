import React from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import { HomeIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    // Don't render anything if no user is logged in
    if (!user) return null;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 shadow-sm dark:shadow-gray-700/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            HomeHub
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/dashboard"
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <HomeIcon className="h-6 w-6" />
                            <span className="ml-2 text-sm font-medium hidden md:block">Dashboard</span>
                        </Link>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </button>
                        <UserMenu user={user} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 