import React, { useState, useEffect } from 'react';
import { fetchWithError } from '../utils/errorUtils';
import { API_BASE_URL } from '../config/api';
import { CakeIcon } from '@heroicons/react/24/outline';

const UpcomingBirthdays = () => {
    const [birthdays, setBirthdays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBirthdays = async () => {
            try {
                const data = await fetchWithError(`${API_BASE_URL}/users/birthdays/upcoming`);
                // Filter out any entries with invalid dates
                const validBirthdays = data.filter(birthday => {
                    if (!birthday.date_of_birth) return false;
                    const [year, month, day] = birthday.date_of_birth.split('-').map(Number);
                    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) return false;
                    const date = new Date(Date.UTC(year, month - 1, day));
                    return !isNaN(date.getTime());
                });
                setBirthdays(validBirthdays);
            } catch (err) {
                console.error('Error fetching birthdays:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBirthdays();
    }, []);

    const formatBirthday = (dateString) => {
        try {
            if (!dateString) {
                console.error('Invalid date string:', dateString);
                return 'Invalid date';
            }

            // Create date in UTC to avoid timezone offset issues
            const [year, month, day] = dateString.split('-').map(Number);
            
            // Validate the date components
            if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
                console.error('Invalid date components:', { year, month, day, dateString });
                return 'Invalid date';
            }

            const date = new Date(Date.UTC(year, month - 1, day));
            
            // Validate the resulting date
            if (isNaN(date.getTime())) {
                console.error('Invalid date object:', date, 'from components:', { year, month, day });
                return 'Invalid date';
            }

            return new Intl.DateTimeFormat('en-US', { 
                month: 'long', 
                day: 'numeric',
                timeZone: 'UTC' // Use UTC to avoid any timezone conversions
            }).format(date);
        } catch (err) {
            console.error('Error formatting birthday:', err, 'for date:', dateString);
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Birthday Details
                    </h2>
                    <CakeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-red-500 dark:text-red-400">
                    Error loading birthdays: {error}
                </div>
            </div>
        );
    }

    if (birthdays.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Birthday Details
                    </h2>
                    <CakeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    No upcoming birthdays found.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Birthday Details
                </h2>
                <CakeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-4">
                {birthdays.map((birthday) => (
                    <div 
                        key={`${birthday.type}-${birthday.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <CakeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {birthday.name}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatBirthday(birthday.date_of_birth)}
                                    </div>
                                    <span className="text-gray-400 dark:text-gray-500">•</span>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Turning {birthday.upcoming_age}
                                    </div>
                                    <span className="text-gray-400 dark:text-gray-500">•</span>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {Math.ceil(birthday.days_until)} days away
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                            {birthday.type === 'user' ? 'Family' : birthday.contact_type}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingBirthdays; 