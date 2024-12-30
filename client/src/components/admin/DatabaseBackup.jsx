import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { fetchWithError } from '../../utils/errorUtils';
import { CloudArrowUpIcon, CloudArrowDownIcon, TrashIcon } from '@heroicons/react/24/outline';

const DatabaseBackup = () => {
    const [backups, setBackups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBackups = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await fetchWithError(`${API_BASE_URL}/admin/backups`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setBackups(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const createBackup = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            await fetchWithError(`${API_BASE_URL}/admin/backup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchBackups();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const restoreBackup = async (filename) => {
        if (!window.confirm('Are you sure you want to restore this backup? This will overwrite the current database.')) {
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            await fetchWithError(`${API_BASE_URL}/admin/restore/${filename}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchBackups();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteBackup = async (filename) => {
        if (!window.confirm('Are you sure you want to delete this backup?')) {
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            await fetchWithError(`${API_BASE_URL}/admin/backup/${filename}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchBackups();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatSize = (bytes) => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error.includes('Failed to fetch') ? 'Unable to connect to server' : error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                    onClick={createBackup}
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50"
                >
                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                    Create New Backup
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Backup Name
                                </th>
                                <th scope="col" className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th scope="col" className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Size
                                </th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {backups.map((backup) => (
                                <tr key={backup.filename} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        <div>
                                            <span className="block sm:hidden font-medium">Backup:</span>
                                            {backup.filename}
                                            <div className="block sm:hidden text-xs text-gray-500 dark:text-gray-400">
                                                Created: {formatDate(backup.created)}
                                                <br />
                                                Size: {formatSize(backup.size)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {formatDate(backup.created)}
                                    </td>
                                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {formatSize(backup.size)}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => restoreBackup(backup.filename)}
                                                className="inline-flex items-center p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Restore Backup"
                                            >
                                                <CloudArrowDownIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteBackup(backup.filename)}
                                                className="inline-flex items-center p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Delete Backup"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {backups.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No backups available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DatabaseBackup; 