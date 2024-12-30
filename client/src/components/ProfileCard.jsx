import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const ProfileCard = React.memo(({ profile }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    if (!profile) return null;

    const handleProfileClick = useCallback(() => {
        // If user is already logged in and it's their profile, go to dashboard
        if (user && user.username === profile.username) {
            navigate('/dashboard');
            return;
        }
        // Otherwise, go to login page with the username as a query parameter
        navigate(`/login?username=${encodeURIComponent(profile.username)}`);
    }, [user, profile.username, navigate]);

    return (
        <div 
            onClick={handleProfileClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <UserCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {profile.username}
                    </h3>
                    {profile.account_type && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {profile.account_type}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});

ProfileCard.displayName = 'ProfileCard';

export default ProfileCard; 