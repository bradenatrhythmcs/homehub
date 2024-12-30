import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { fetchWithError } from '../../utils/errorUtils';
import { FaCalendar, FaUserShield, FaUserFriends } from 'react-icons/fa';

const UserEditForm = ({ user, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        is_admin: user.is_admin === 1,
        account_type: user.account_type,
        date_of_birth: user.date_of_birth
    });
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            const response = await fetchWithError(`${API_BASE_URL}/admin/users/${user.id}`, {
                method: 'PUT',
                body: {
                    is_admin: formData.is_admin,
                    account_type: formData.account_type,
                    date_of_birth: formData.date_of_birth
                }
            });

            onUpdate(response);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Date of Birth
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="block w-full pl-10 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Account Type
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserFriends className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                        name="account_type"
                        value={formData.account_type}
                        onChange={handleChange}
                        className="block w-full pl-10 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white select-center"
                    >
                        <option value="PARENT">Parent</option>
                        <option value="CHILD">Child</option>
                    </select>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <label className="flex items-center space-x-3">
                    <div className="flex items-center h-5">
                        <input
                            type="checkbox"
                            name="is_admin"
                            checked={formData.is_admin}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaUserShield className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Admin Privileges</span>
                    </div>
                </label>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-7">
                    Grant administrative access to manage users, categories, and system settings.
                </p>
            </div>

            {error && (
                <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-xl">
                    {error}
                </div>
            )}

            <div className="flex space-x-3 pt-2">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default UserEditForm; 