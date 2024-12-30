import React, { useState, useEffect } from 'react';
import { fetchWithError } from '../utils/errorUtils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const UpdateSystem = () => {
    const [updateStatus, setUpdateStatus] = useState('idle');
    const [updateMessage, setUpdateMessage] = useState('');
    const [error, setError] = useState(null);
    const [details, setDetails] = useState(null);

    const checkForUpdates = async () => {
        try {
            setUpdateStatus('checking');
            setError(null);
            
            const data = await fetchWithError('/api/system/updates/check');
            console.log('Update check response:', data);
            
            if (data.status === 'success') {
                setUpdateStatus(data.updates_available ? 'available' : 'up-to-date');
                setUpdateMessage(data.message);
                
                if (data.updates_available) {
                    const detailsData = await fetchWithError('/api/system/updates/details');
                    setDetails(detailsData.details);
                }
            } else {
                throw new Error(data.error || 'Failed to check for updates');
            }
        } catch (err) {
            console.error('Update check error:', err);
            setError(err.message);
            setUpdateStatus('error');
        }
    };

    const applyUpdate = async () => {
        try {
            setUpdateStatus('updating');
            setError(null);
            
            const data = await fetchWithError('/api/system/updates/apply', {
                method: 'POST'
            });
            
            if (data.status === 'success') {
                setUpdateStatus('updated');
                setUpdateMessage(data.message);
            } else {
                throw new Error(data.error || 'Failed to apply update');
            }
        } catch (err) {
            console.error('Update apply error:', err);
            setError(err.message);
            setUpdateStatus('error');
        }
    };

    useEffect(() => {
        checkForUpdates();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Updates</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Status: {updateStatus.charAt(0).toUpperCase() + updateStatus.slice(1)}
                    </p>
                </div>
                <button
                    onClick={checkForUpdates}
                    disabled={updateStatus === 'checking' || updateStatus === 'updating'}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50"
                >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                    Check for Updates
                </button>
            </div>

            {updateMessage && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-gray-600 dark:text-gray-300">
                    {updateMessage}
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                    Error: {error}
                </div>
            )}

            {details && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Update Details</h4>
                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {details}
                    </pre>
                </div>
            )}

            {updateStatus === 'available' && (
                <div className="mt-4">
                    <button
                        onClick={applyUpdate}
                        disabled={updateStatus === 'updating'}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`h-5 w-5 mr-2 ${updateStatus === 'updating' ? 'animate-spin' : ''}`} />
                        {updateStatus === 'updating' ? 'Updating...' : 'Apply Update'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UpdateSystem; 