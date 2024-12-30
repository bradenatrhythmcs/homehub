import React from 'react';

const UserCard = ({ user }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Welcome, {user.username}!
            </h2>
            <div className="space-y-3">
                <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Account Type:</span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {user.account_type}
                    </span>
                </div>
                {user.is_admin === 1 && (
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Role:</span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            Admin
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCard; 