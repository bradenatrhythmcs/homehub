import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { fetchWithError } from '../utils/errorUtils';
import WifiNetworkCard from '../components/WifiNetworkCard';
import PasswordList from '../components/PasswordManager/PasswordList';
import PasswordForm from '../components/PasswordManager/PasswordForm';
import BillList from '../components/BillManager/BillList';
import BillForm from '../components/BillManager/BillForm';
import AccountsDashboard from '../components/AccountManager/AccountsDashboard';
import ContactManager from '../components/ContactManager/ContactManager';
import UserCard from '../components/UserCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
    const { user } = useAuth();
    const [networks, setNetworks] = useState([]);
    const [passwords, setPasswords] = useState([]);
    const [bills, setBills] = useState([]);
    const [billCategories, setBillCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
    const [isBillFormOpen, setIsBillFormOpen] = useState(false);

    useEffect(() => {
        fetchData();

        // Cleanup function to reset state when component unmounts
        return () => {
            setNetworks([]);
            setPasswords([]);
            setBills([]);
            setBillCategories([]);
            setIsLoading(true);
            setError(null);
            setIsPasswordFormOpen(false);
            setIsBillFormOpen(false);
        };
    }, []);

    const fetchData = async () => {
        try {
            const [networksData, passwordsData, billsData, categoriesData] = await Promise.all([
                fetchWithError(`${API_BASE_URL}/wifi`),
                fetchWithError(`${API_BASE_URL}/passwords`),
                fetchWithError(`${API_BASE_URL}/bills`),
                fetchWithError(`${API_BASE_URL}/bills/categories`)
            ]);

            setNetworks(networksData);
            setPasswords(passwordsData);
            setBills(billsData);
            setBillCategories(categoriesData.map(cat => cat.category));
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPassword = async (passwordData) => {
        try {
            const response = await fetchWithError(`${API_BASE_URL}/passwords`, {
                method: 'POST',
                body: JSON.stringify(passwordData)
            });

            setPasswords(prev => [...prev, response]);
            setIsPasswordFormOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeletePassword = async (passwordId) => {
        if (!window.confirm('Are you sure you want to delete this password?')) return;

        try {
            await fetchWithError(`${API_BASE_URL}/passwords/${passwordId}`, {
                method: 'DELETE'
            });

            setPasswords(prev => prev.filter(p => p.id !== passwordId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddBill = async (billData) => {
        try {
            const response = await fetchWithError(`${API_BASE_URL}/bills`, {
                method: 'POST',
                body: JSON.stringify(billData)
            });

            setBills(prev => [...prev, response]);
            const categoriesData = await fetchWithError(`${API_BASE_URL}/bills/categories`);
            setBillCategories(categoriesData.map(cat => cat.category));
            setIsBillFormOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteBill = async (billId) => {
        if (!window.confirm('Are you sure you want to delete this bill?')) return;

        try {
            await fetchWithError(`${API_BASE_URL}/bills/${billId}`, {
                method: 'DELETE'
            });

            setBills(prev => prev.filter(b => b.id !== billId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMarkBillPaid = async (billId) => {
        try {
            const response = await fetchWithError(`${API_BASE_URL}/bills/${billId}/paid`, {
                method: 'POST'
            });

            setBills(prev => prev.map(b => b.id === billId ? response : b));
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;
    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* User Info and First WiFi Network */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <UserCard user={user} />
                {networks.length > 0 && (
                    <div className="transform transition-all duration-300 hover:scale-[1.02]">
                        <WifiNetworkCard network={networks[0]} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Passwords Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Passwords
                        </h2>
                        <div className="flex space-x-2">
                            {user.account_type === 'PARENT' && (
                                <button
                                    onClick={() => setIsPasswordFormOpen(true)}
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add
                                </button>
                            )}
                            {user.is_admin === 1 && (
                                <Link
                                    to="/passwords"
                                    className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                                >
                                    <Cog6ToothIcon className="h-4 w-4 mr-1" />
                                    Manage
                                </Link>
                            )}
                        </div>
                    </div>
                    <PasswordList
                        passwords={passwords}
                        onDelete={handleDeletePassword}
                        showAll={false}
                        user={user}
                    />
                </div>

                {/* Bills Section - Only show for parent accounts */}
                {user.account_type === 'PARENT' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Bills & Subscriptions
                            </h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setIsBillFormOpen(true)}
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add
                                </button>
                                {user.is_admin === 1 && (
                                    <Link
                                        to="/bills"
                                        className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                                    >
                                        <Cog6ToothIcon className="h-4 w-4 mr-1" />
                                        Manage
                                    </Link>
                                )}
                            </div>
                        </div>
                        <BillList
                            bills={bills}
                            onDelete={handleDeleteBill}
                            onMarkPaid={handleMarkBillPaid}
                            showAll={false}
                        />
                    </div>
                )}

                {/* Only show accounts section for parent accounts */}
                {user.account_type === 'PARENT' && <AccountsDashboard />}

                {/* Contacts Section */}
                <ContactManager />
            </div>

            {/* Additional WiFi Networks */}
            {networks.length > 1 && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Additional Networks
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {networks.slice(1).map((network) => (
                            <div 
                                key={network.id}
                                className="transform transition-all duration-300 hover:scale-[1.02]"
                            >
                                <WifiNetworkCard network={network} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Forms */}
            {isPasswordFormOpen && (
                <PasswordForm
                    isOpen={isPasswordFormOpen}
                    onSubmit={handleAddPassword}
                    onClose={() => setIsPasswordFormOpen(false)}
                />
            )}

            {isBillFormOpen && (
                <BillForm
                    isOpen={isBillFormOpen}
                    onSubmit={handleAddBill}
                    onClose={() => setIsBillFormOpen(false)}
                    existingCategories={billCategories}
                />
            )}
        </div>
    );
};

export default Dashboard; 