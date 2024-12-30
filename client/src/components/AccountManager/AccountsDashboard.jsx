import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import AccountForm from './AccountForm';
import AccountListDashboard from './AccountListDashboard';
import { fetchWithError } from '../../utils/errorUtils';

const AccountsDashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.account_type === 'PARENT') {
            fetchAccounts();
            fetchCategories();
        }

        // Cleanup function to reset state when component unmounts
        return () => {
            setAccounts([]);
            setCategories([]);
            setIsFormOpen(false);
            setIsLoading(true);
        };
    }, [user]);

    const fetchAccounts = async () => {
        try {
            const response = await fetchWithError('/api/accounts');
            setAccounts(response);
        } catch (error) {
            console.error('Error fetching accounts:', error);
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

    const handleAddAccount = async (accountData) => {
        try {
            await fetchWithError('/api/accounts', {
                method: 'POST',
                body: JSON.stringify(accountData)
            });
            fetchAccounts();
            fetchCategories(); // Refresh categories after adding new account
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error adding account:', error);
        }
    };

    // Don't render anything for child accounts
    if (!user || user.account_type !== 'PARENT') {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Accounts
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add
                    </button>
                    {user.is_admin === 1 && (
                        <Link
                            to="/accounts"
                            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                        >
                            <Cog6ToothIcon className="h-4 w-4 mr-1" />
                            Manage
                        </Link>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : accounts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No accounts added yet</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="mt-2 inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Account
                    </button>
                </div>
            ) : (
                <AccountListDashboard accounts={accounts} />
            )}

            {isFormOpen && (
                <AccountForm
                    onSubmit={handleAddAccount}
                    onClose={() => setIsFormOpen(false)}
                    categories={categories}
                />
            )}
        </div>
    );
};

export default AccountsDashboard; 