import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { fetchWithError } from '../../utils/errorUtils';

const ProfileLogin = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    // Fetch user data when component mounts
    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await fetchWithError(`${API_BASE_URL}/users/by-username/${username}`);
                setUserData(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchUser();
    }, [username]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store the token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    {userData?.avatar_path ? (
                        <img
                            src={`${API_BASE_URL}/uploads/${userData.avatar_path}`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 mb-4"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                            <span className="text-4xl">{username.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <h1 className="text-3xl font-bold text-center">Welcome back, {username}!</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 rounded bg-white border border-gray-300 
                                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                                     text-gray-800 placeholder-gray-500"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 
                                 rounded font-medium text-white transition-colors
                                 disabled:bg-blue-300 disabled:cursor-not-allowed
                                 shadow-md hover:shadow-lg"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/')}
                    className="mt-6 w-full py-3 px-4 bg-transparent border border-gray-300 
                             hover:border-blue-400 rounded font-medium text-gray-600 
                             hover:text-blue-600 transition-colors shadow-sm hover:shadow-md"
                >
                    Not you?
                </button>
            </div>
        </div>
    );
};

export default ProfileLogin; 