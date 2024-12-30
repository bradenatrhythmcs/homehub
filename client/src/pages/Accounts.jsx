import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithError } from '../utils/errorUtils';
import AccountForm from '../components/AccountManager/AccountForm';
import AccountListDashboard from '../components/AccountManager/AccountListDashboard';
import { toast } from 'react-toastify';

const Accounts = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (user && user.account_type === 'PARENT') {
            fetchAccounts();
            fetchCategories();
        }
    }, [user]);

    const fetchAccounts = async () => {
        try {
            const response = await fetchWithError('/api/accounts');
            setAccounts(response);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            // Use the bills categories endpoint
            const response = await fetchWithError('/api/bills/categories');
            setCategories(response.map(cat => cat.category));
        } catch (error) {
            console.error('Error fetching categories:', error);
            // If bills categories fail, try account categories as fallback
            try {
                const accountCatsResponse = await fetchWithError('/api/accounts/categories');
                setCategories(accountCatsResponse.map(cat => cat.category));
            } catch (fallbackError) {
                console.error('Error fetching fallback categories:', fallbackError);
            }
        }
    };

    const handleAddAccount = async (formData) => {
        try {
            const response = await fetchWithError('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            setAccounts(prevAccounts => [...prevAccounts, response]);
            await fetchCategories(); // Refresh categories in case a new one was added
            setIsFormOpen(false);
            toast.success('Account added successfully!');
        } catch (error) {
            setError(error.message);
            toast.error(error.message || 'Failed to add account');
            throw error;
        }
    };

    const handleDeleteAccount = async (id) => {
        if (!window.confirm('Are you sure you want to delete this account?')) return;

        try {
            await fetchWithError(`/api/accounts/${id}`, {
                method: 'DELETE',
            });
            setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== id));
            toast.success('Account deleted successfully!');
        } catch (error) {
            setError(error.message);
            toast.error(error.message || 'Failed to delete account');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">{error}</div>
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
                    Account Manager
                </h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Account
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <AccountListDashboard
                    accounts={accounts}
                    onDelete={handleDeleteAccount}
                    showAll={true}
                />
            </div>

            {isFormOpen && (
                <AccountForm
                    isOpen={isFormOpen}
                    onSubmit={handleAddAccount}
                    onClose={() => setIsFormOpen(false)}
                    categories={categories}
                />
            )}
        </div>
    );
};

export default Accounts; 