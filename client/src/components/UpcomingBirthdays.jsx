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
            if (!dateString) return 'Invalid date';
            const [year, month, day] = dateString.split('-').map(Number);
            if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) return 'Invalid date';
            const date = new Date(Date.UTC(year, month - 1, day));
            if (isNaN(date.getTime())) return 'Invalid date';
            return new Intl.DateTimeFormat('en-US', { 
                month: 'short', 
                day: 'numeric',
                timeZone: 'UTC'
            }).format(date);
        } catch (err) {
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Upcoming Birthdays
                    </h2>
                    <CakeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm text-red-500 dark:text-red-400">
                    Error loading birthdays: {error}
                </div>
            </div>
        );
    }

    if (birthdays.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Upcoming Birthdays
                    </h2>
                    <CakeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No upcoming birthdays found
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Upcoming Birthdays
                </h2>
                <CakeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
                {birthdays.map((birthday) => (
                    <div 
                        key={`${birthday.type}-${birthday.id}`}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <div className="flex items-center min-w-0">
                            <div className="min-w-0">
                                <div className="flex items-baseline space-x-2 min-w-0">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {birthday.name}
                                    </span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                        {birthday.type === 'user' ? 'Family' : birthday.contact_type}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatBirthday(birthday.date_of_birth)} • Turning {birthday.upcoming_age}
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                {Math.ceil(birthday.days_until)}d
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingBirthdays; 