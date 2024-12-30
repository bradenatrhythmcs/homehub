import React, { useState, useEffect } from 'react';
import { fetchWithError } from '../utils/errorUtils';
import {
    ServerIcon,
    CircleStackIcon,
    CpuChipIcon,
    ClockIcon,
    SignalIcon,
} from '@heroicons/react/24/outline';

const SystemVitals = () => {
    const [vitals, setVitals] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVitals = async () => {
            try {
                const data = await fetchWithError('/api/system/vitals');
                setVitals(data);
            } catch (err) {
                console.error('Error fetching system vitals:', err);
                setError(err.message);
            }
        };

        // Initial fetch
        fetchVitals();

        // Set up polling every 5 seconds
        const interval = setInterval(fetchVitals, 5000);

        return () => clearInterval(interval);
    }, []);

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-red-600 dark:text-red-400">
                Error loading system vitals: {error}
            </div>
        );
    }

    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (parts.length === 0) parts.push('Just started');
        
        return parts.join(' ');
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    System Vitals
                </h2>
                <ServerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>

            {!vitals ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Server Status */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <SignalIcon className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Server Status</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-lg font-semibold text-green-500">Active</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Port {vitals.port}
                            </span>
                        </div>
                    </div>

                    {/* System Memory */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <CircleStackIcon className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Memory Usage</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatBytes(vitals.memory.used)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                of {formatBytes(vitals.memory.total)}
                            </span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(vitals.memory.used / vitals.memory.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* CPU Load */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <CpuChipIcon className="h-5 w-5 text-purple-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">CPU Load</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {vitals.cpu.load.toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {vitals.cpu.cores} Cores
                            </span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${vitals.cpu.load}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Uptime & Database */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <ClockIcon className="h-5 w-5 text-orange-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">System Info</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Uptime</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatUptime(vitals.uptime)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">DB Size</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {vitals.database.exists ? formatBytes(vitals.database.size) : 'Not initialized'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Environment</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {vitals.environment}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemVitals; 