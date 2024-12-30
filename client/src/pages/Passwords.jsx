import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api.js';
import PasswordForm from '../components/PasswordManager/PasswordForm';
import PasswordList from '../components/PasswordManager/PasswordList';

const Passwords = () => {
    const { user } = useAuth();
    const [passwords, setPasswords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPassword, setEditingPassword] = useState(null);

    useEffect(() => {
        if (user) {
            fetchPasswords();
        }
    }, [user]);

    const fetchPasswords = async () => {
        try {
            setError(null);
            const response = await api.get('/passwords');
            setPasswords(response.data);
        } catch (error) {
            console.error('Error fetching passwords:', error);
            setError(error.response?.data?.message || 'Error fetching passwords');
            setPasswords([]); // Clear passwords on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPassword = async (formData) => {
        try {
            const response = await api.post('/passwords', formData);
            setPasswords(prevPasswords => [...prevPasswords, response.data]);
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error adding password:', error);
            setError(error.response?.data?.message || 'Error adding password');
            throw error;
        }
    };

    const handleEditPassword = async (formData) => {
        try {
            const submitData = {
                title: formData.title,
                username: formData.username,
                password: formData.password,
                ...(formData.url && formData.url.trim() !== '' && {
                    url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`
                }),
                is_child_visible: Boolean(formData.is_child_visible)
            };

            const response = await api.put(`/passwords/${editingPassword.id}`, submitData);
            setPasswords(prevPasswords => 
                prevPasswords.map(password => 
                    password.id === editingPassword.id ? response.data : password
                )
            );
            setEditingPassword(null);
        } catch (error) {
            console.error('Error updating password:', error);
            setError(error.response?.data?.message || 'Error updating password');
            throw error;
        }
    };

    const handleDeletePassword = async (id) => {
        if (!window.confirm('Are you sure you want to delete this password?')) return;

        try {
            await api.delete(`/passwords/${id}`);
            setPasswords(prevPasswords => prevPasswords.filter(password => password.id !== id));
        } catch (error) {
            console.error('Error deleting password:', error);
            setError(error.response?.data?.message || 'Error deleting password');
        }
    };

    const handleStartEdit = async (password) => {
        try {
            const response = await api.get(`/passwords/${password.id}/decrypt`);
            if (!response.data.decryptedPassword) {
                throw new Error('No decrypted password in response');
            }
            
            setEditingPassword({
                ...password,
                password: response.data.decryptedPassword,
                is_child_visible: password.is_child_visible
            });
        } catch (error) {
            console.error('Error fetching decrypted password:', error);
            setError(error.response?.data?.message || 'Error fetching password');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col justify-center items-center min-h-[60vh]">
                    <div className="text-red-500 mb-4">{error}</div>
                    <button
                        onClick={fetchPasswords}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Redirect if user is not a parent
    if (!user || user.account_type !== 'PARENT') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Password Manager
                </h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Password
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <PasswordList
                    passwords={passwords}
                    onDelete={handleDeletePassword}
                    onEdit={handleStartEdit}
                    showAll={true}
                    user={user}
                />
            </div>

            {(isFormOpen || editingPassword) && (
                <PasswordForm
                    isOpen={isFormOpen || !!editingPassword}
                    onSubmit={editingPassword ? handleEditPassword : handleAddPassword}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingPassword(null);
                    }}
                    initialData={editingPassword}
                />
            )}
        </div>
    );
};

export default Passwords; 