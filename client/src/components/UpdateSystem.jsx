import React, { useState, useEffect } from 'react';
import { fetchWithError } from '../utils/errorUtils';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const UpdateSystem = () => {
    const [updateStatus, setUpdateStatus] = useState('checking');
    const [updateDetails, setUpdateDetails] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);

    // Check for updates
    const checkForUpdates = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchWithError('/api/system/updates/check');
            const data = await response.json();
            setUpdateStatus(data.status);
            
            if (data.updateAvailable) {
                const detailsResponse = await fetchWithError('/api/system/updates/details');
                const detailsData = await detailsResponse.json();
                setUpdateDetails(detailsData);
            } else {
                setUpdateDetails(null);
            }
            
            setLastChecked(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Apply update
    const applyUpdate = async () => {
        if (!window.confirm('Are you sure you want to update the system? This will restart the server.')) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchWithError('/api/system/updates/apply', {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                setUpdateStatus('up-to-date');
                setUpdateDetails(null);
                alert('Update completed successfully. The page will now reload.');
                window.location.reload();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Check for updates on component mount
    useEffect(() => {
        checkForUpdates();
    }, []);

    const renderStatus = () => {
        const getStatusConfig = () => {
            switch (updateStatus) {
                case 'checking':
                    return {
                        icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
                        text: 'Checking for updates...',
                        className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    };
                case 'behind':
                    return {
                        icon: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />,
                        text: 'Update available!',
                        className: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    };
                case 'up-to-date':
                    return {
                        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
                        text: 'System is up to date',
                        className: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    };
                case 'ahead':
                    return {
                        icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
                        text: 'Local version is ahead of remote version',
                        className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    };
                case 'diverged':
                    return {
                        icon: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />,
                        text: 'Local changes detected. Cannot update automatically',
                        className: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    };
                default:
                    return {
                        icon: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />,
                        text: 'Unknown update status',
                        className: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    };
            }
        };

        const config = getStatusConfig();
        return (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${config.className}`}>
                {config.icon}
                <span className="text-sm font-medium">{config.text}</span>
            </div>
        );
    };

    const renderUpdateDetails = () => {
        if (!updateDetails) return null;

        return (
            <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Version</h4>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{updateDetails.currentVersion}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Latest Version</h4>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{updateDetails.latestVersion}</p>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Latest Commit</h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{updateDetails.latestCommitMessage}</p>
                </div>

                {updateDetails.changes.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Changes</h4>
                        <ul className="space-y-2">
                            {updateDetails.changes.map((change, index) => (
                                <li key={index} className="text-sm text-gray-900 dark:text-gray-100">
                                    • {change}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center gap-2">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {renderStatus()}
            {renderUpdateDetails()}

            <div className="mt-6 flex flex-wrap gap-4">
                <button
                    onClick={checkForUpdates}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Check for Updates
                </button>

                {updateStatus === 'behind' && (
                    <button
                        onClick={applyUpdate}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Apply Update
                    </button>
                )}
            </div>

            {lastChecked && (
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Last checked: {lastChecked.toLocaleString()}
                </p>
            )}
        </div>
    );
};

export default UpdateSystem; 