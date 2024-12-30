import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon, LinkIcon } from '@heroicons/react/24/outline';
import { fetchWithError } from '../../utils/errorUtils';

const PasswordList = ({ passwords, onDelete, onEdit, user, showAll = true }) => {
    const [visiblePasswords, setVisiblePasswords] = useState(new Set());
    const [decryptedPasswords, setDecryptedPasswords] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const togglePasswordVisibility = async (id) => {
        const newVisible = new Set(visiblePasswords);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
            // Only decrypt if we haven't already
            if (!decryptedPasswords[id]) {
                try {
                    const response = await fetchWithError(`/api/passwords/${id}/decrypt`);
                    if (!response.decryptedPassword) {
                        throw new Error('No decrypted password in response');
                    }
                    setDecryptedPasswords(prev => ({
                        ...prev,
                        [id]: response.decryptedPassword
                    }));
                } catch (error) {
                    console.error('Error decrypting password:', error);
                    // Remove from visible if decryption failed
                    newVisible.delete(id);
                }
            }
        }
        setVisiblePasswords(newVisible);
    };

    // Clear decrypted passwords when the component unmounts or passwords change
    useEffect(() => {
        return () => setDecryptedPasswords({});
    }, [passwords]);

    const filteredPasswords = passwords.filter(password => {
        const searchString = `${password.title} ${password.username} ${password.url || ''}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    });

    const displayPasswords = showAll ? filteredPasswords : filteredPasswords.slice(0, 4);

    return (
        <div className="mt-4">
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search passwords..."
                        className="w-full px-4 py-2 border rounded-lg pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
            </div>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{ maxHeight: '480px' }}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            {showAll && user.is_admin === 1 && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {displayPasswords.map((password) => (
                            <tr key={password.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {password.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {password.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono">
                                            {visiblePasswords.has(password.id) 
                                                ? (decryptedPasswords[password.id] || 'Loading...')
                                                : '••••••••'}
                                        </span>
                                        <button
                                            onClick={() => togglePasswordVisibility(password.id)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            title={visiblePasswords.has(password.id) ? "Hide password" : "Show password"}
                                        >
                                            {visiblePasswords.has(password.id) ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {password.url && (
                                        <a 
                                            href={password.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            title={password.url}
                                        >
                                            <LinkIcon className="h-5 w-5" />
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex">
                                        {password.is_child_visible ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 w-fit">
                                                Child Visible
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 w-fit">
                                                Parent Only
                                            </span>
                                        )}
                                    </div>
                                </td>
                                {showAll && user.is_admin === 1 && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => onEdit(password)}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                                title="Edit password"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(password.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                title="Delete password"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PasswordList; 