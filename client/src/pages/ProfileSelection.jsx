import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileGrid from '../components/profiles/ProfileGrid';
import { API_BASE_URL } from '../config/api';
import { fetchWithError } from '../utils/errorUtils';
import Error from '../components/Error';

const ProfileSelection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfiles = async () => {
        try {
            const data = await fetchWithError(`${API_BASE_URL}/users`);
            setProfiles(data);
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileClick = (username) => {
        if (user) {
            navigate('/dashboard');
            return;
        }
        navigate(`/login/${username}`);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const UserCard = ({ username, onSelect }) => {
        const [avatarError, setAvatarError] = useState(false);
        const [userData, setUserData] = useState(null);

        useEffect(() => {
            const fetchUserData = async () => {
                try {
                    const data = await fetchWithError(`${API_BASE_URL}/users/by-username/${username}`);
                    setUserData(data);
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    setAvatarError(true);
                }
            };
            fetchUserData();
        }, [username]);

        return (
            <button
                onClick={() => onSelect(username)}
                className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors w-full"
            >
                {!avatarError && userData?.avatar_path ? (
                    <img
                        src={`${API_BASE_URL}/uploads/${userData.avatar_path}`}
                        alt=""
                        onError={(e) => {
                            console.error('Image load error:', e);
                            setAvatarError(true);
                        }}
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-blue-500"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl text-white">{username.charAt(0).toUpperCase()}</span>
                    </div>
                )}
                <div className="text-xl font-semibold text-white">{username}</div>
            </button>
        );
    };

    const handleProfileSelect = async (userId) => {
        try {
            const data = await fetchWithError(`${API_BASE_URL}/users/${userId}`);
            setSelectedUser(data);
            navigate(`/profile/${userId}`);
        } catch (error) {
            setError(error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Error 
                    message={error.message}
                    onRetry={fetchProfiles}
                    type={error.type}
                />
            </div>
        );
    }

    return <ProfileGrid profiles={profiles} onProfileClick={handleProfileClick} />;
};

export default ProfileSelection; 