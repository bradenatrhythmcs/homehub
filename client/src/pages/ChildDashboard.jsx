import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { fetchWithError } from '../utils/errorUtils';
import WifiNetworkCard from '../components/WifiNetworkCard';
import PasswordList from '../components/PasswordManager/PasswordList';
import UserCard from '../components/UserCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { useAuth } from '../contexts/AuthContext';
import ContactManager from '../components/ContactManager/ContactManager';

const ChildDashboard = () => {
    const { user } = useAuth();
    const [networks, setNetworks] = useState([]);
    const [passwords, setPasswords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();

        // Cleanup function to reset state when component unmounts
        return () => {
            setNetworks([]);
            setPasswords([]);
            setIsLoading(true);
            setError(null);
        };
    }, []);

    const fetchData = async () => {
        try {
            const [networksData, passwordsData] = await Promise.all([
                fetchWithError(`${API_BASE_URL}/wifi`),
                fetchWithError(`${API_BASE_URL}/passwords`)
            ]);

            setNetworks(networksData);
            setPasswords(passwordsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
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
                    </div>
                    <PasswordList
                        passwords={passwords}
                        showAll={false}
                        user={user}
                    />
                </div>

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
        </div>
    );
};

export default ChildDashboard; 