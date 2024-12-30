import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { fetchWithError } from '../utils/errorUtils';
import Loading from '../components/Loading';
import Error from '../components/Error';
import UserEditForm from '../components/admin/UserEditForm';
import WifiNetworkForm from '../components/admin/WifiNetworkForm';
import WifiNetworkList from '../components/admin/WifiNetworkList';
import CategoryManager from '../components/admin/CategoryManager';
import DatabaseBackup from '../components/admin/DatabaseBackup';
import UpdateSystem from '../components/UpdateSystem';
import { UsersIcon, WifiIcon, TagIcon, ServerIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [networks, setNetworks] = useState([]);
    const [loadingStates, setLoadingStates] = useState({
        users: true,
        networks: false
    });
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchNetworks();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, users: true }));
            const token = localStorage.getItem('token');
            const data = await fetchWithError(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUsers(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, users: false }));
        }
    };

    const fetchNetworks = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, networks: true }));
            const data = await fetchWithError(`${API_BASE_URL}/wifi`);
            setNetworks(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoadingStates(prev => ({ ...prev, networks: false }));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetchWithError(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            setError(err);
        }
    };

    const handleResetPassword = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await fetchWithError(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_password: newPassword })
            });
            
            setNewPassword('');
            setSelectedUser(null);
            alert('Password reset successfully');
        } catch (err) {
            setError(err);
        }
    };

    const handleRoleUpdate = async (userId, isAdmin, accountType) => {
        try {
            const token = localStorage.getItem('token');
            const updatedUser = await fetchWithError(`${API_BASE_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_admin: isAdmin,
                    account_type: accountType
                })
            });
            
            setUsers(users.map(user => 
                user.id === userId ? updatedUser : user
            ));
        } catch (err) {
            setError(err);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
    };

    const handleUpdateSuccess = (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
    };

    const handleDeleteNetwork = async (networkId) => {
        if (!window.confirm('Are you sure you want to delete this network?')) return;

        try {
            await fetchWithError(`${API_BASE_URL}/wifi/${networkId}`, {
                method: 'DELETE'
            });
            setNetworks(networks.filter(n => n.id !== networkId));
        } catch (err) {
            setError(err);
        }
    };

    if (loadingStates.users && loadingStates.networks) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage users, categories, and WiFi networks.</p>
            </div>

            <div className="space-y-6 sm:space-y-8">
                <section>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-400">User Management</h2>
                        <UsersIcon className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 dark:text-white">{user.username}</span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(user)}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-xl text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-xl text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                                                    >
                                                        Reset Password
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-xl text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-400">Category Management</h2>
                        <TagIcon className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                        <CategoryManager />
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-400">WiFi Networks</h2>
                        <WifiIcon className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                                Add New Network
                            </h3>
                            <WifiNetworkForm onSuccess={fetchNetworks} />
                        </div>
                        <div className="lg:col-span-2">
                            <WifiNetworkList 
                                networks={networks}
                                onDelete={handleDeleteNetwork}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-400">Database Backup</h2>
                        <ServerIcon className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                        <DatabaseBackup />
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-400">System Updates</h2>
                        <ArrowPathIcon className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <UpdateSystem />
                </section>
            </div>

            {selectedUser && (
                <PasswordResetModal 
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onReset={handleResetPassword}
                />
            )}

            {editingUser && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Edit User: {editingUser.username}
                        </h3>
                        <UserEditForm
                            user={editingUser}
                            onUpdate={handleUpdateSuccess}
                            onCancel={() => setEditingUser(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const PasswordResetModal = ({ user, onClose, onReset }) => {
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = () => {
        onReset(user.id, newPassword);
        setNewPassword('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Reset Password for {user.username}
                </h3>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400 mb-4"
                />
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Admin; 