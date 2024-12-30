import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Get username from URL query parameters
        const params = new URLSearchParams(location.search);
        const username = params.get('username');
        if (username) {
            setFormData(prev => ({ ...prev, username }));
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(formData.username, formData.password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Sign in to access your account
                        </p>
                    </div>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-3 py-2 
                                             border border-gray-300 dark:border-gray-600 rounded-lg
                                             placeholder-gray-500 dark:placeholder-gray-400
                                             text-gray-900 dark:text-white
                                             bg-white dark:bg-gray-700
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                                             focus:border-transparent transition-all duration-200
                                             hover:border-blue-400 dark:hover:border-blue-400"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-3 py-2 
                                             border border-gray-300 dark:border-gray-600 rounded-lg
                                             placeholder-gray-500 dark:placeholder-gray-400
                                             text-gray-900 dark:text-white
                                             bg-white dark:bg-gray-700
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                                             focus:border-transparent transition-all duration-200
                                             hover:border-blue-400 dark:hover:border-blue-400"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2.5 px-4
                                         bg-gradient-to-r from-blue-600 to-indigo-600
                                         text-white text-sm font-medium rounded-lg
                                         hover:from-blue-700 hover:to-indigo-700
                                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                                         focus:ring-blue-500 disabled:opacity-50
                                         disabled:cursor-not-allowed transform transition-all 
                                         duration-200 hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </div>
                                ) : 'Sign in'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full py-3 px-4 bg-transparent border border-gray-300 
                                     hover:border-blue-400 rounded font-medium text-gray-600 
                                     hover:text-blue-600 transition-colors shadow-sm hover:shadow-md"
                        >
                            Not you?
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 