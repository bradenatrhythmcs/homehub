import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { fetchWithError } from '../../utils/errorUtils';

const WifiNetworkForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        ssid: '',
        password: '',
        encryptionType: 'WPA2'
    });
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            await fetchWithError(`${API_BASE_URL}/wifi`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setFormData({
                ssid: '',
                password: '',
                encryptionType: 'WPA2'
            });
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Network Name (SSID)
                </label>
                <input
                    type="text"
                    name="ssid"
                    value={formData.ssid}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Encryption Type
                </label>
                <select
                    name="encryptionType"
                    value={formData.encryptionType}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white select-center"
                >
                    <option value="WPA2">WPA2</option>
                    <option value="WPA3">WPA3</option>
                    <option value="WPA">WPA</option>
                </select>
            </div>

            {error && (
                <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {isSaving ? 'Saving...' : 'Save Network'}
            </button>
        </form>
    );
};

export default WifiNetworkForm; 