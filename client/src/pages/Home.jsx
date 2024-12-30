import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { AppError, fetchWithError } from '../utils/errorUtils';
import WifiNetworkCard from '../components/WifiNetworkCard';
import ProfileCard from '../components/ProfileCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import UpcomingBirthdays from '../components/UpcomingBirthdays';
import SystemVitals from '../components/SystemVitals';

const Home = () => {
    const navigate = useNavigate();
    const [network, setNetwork] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Fetch profiles and the latest network
                const [profilesData, networksData] = await Promise.all([
                    fetchWithError('/api/users/profiles'),
                    fetchWithError('/api/wifi/latest')
                ]);
                setProfiles(profilesData);
                setNetwork(networksData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof AppError ? err.message : 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProfileClick = (username) => {
        navigate(`/login?username=${encodeURIComponent(username)}`);
    };

    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700 mb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                            Welcome to HomeHub
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Select your profile or connect to a network
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Profiles Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-400 mb-6">
                        Select Your Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {profiles.map(profile => (
                            <ProfileCard 
                                key={profile.id} 
                                profile={profile}
                                onClick={() => handleProfileClick(profile.username)}
                            />
                        ))}
                        <Link
                            to="/register"
                            className="flex items-center justify-center p-6 border-2 border-dashed 
                                     border-gray-300 dark:border-gray-700 rounded-lg 
                                     hover:border-blue-500 dark:hover:border-blue-400
                                     hover:text-blue-500 dark:hover:text-blue-400 
                                     text-gray-600 dark:text-gray-400
                                     transition-colors"
                        >
                            Create New Profile
                        </Link>
                    </div>
                </div>

                {/* WiFi and Birthdays Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* WiFi Network Section */}
                    <div>
                        <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-400 mb-6">
                            Current Network
                        </h2>
                        {network ? (
                            <WifiNetworkCard network={network} />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                                No network available.
                            </p>
                        )}
                    </div>

                    {/* Upcoming Birthdays Section */}
                    <div>
                        <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-400 mb-6">
                            Upcoming Birthdays
                        </h2>
                        <UpcomingBirthdays />
                    </div>
                </div>

                {/* System Vitals Section */}
                <SystemVitals />
            </div>
        </div>
    );
};

export default Home; 