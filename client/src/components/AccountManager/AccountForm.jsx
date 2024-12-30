import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithError } from '../../utils/errorUtils';

const AccountForm = ({ onSubmit, onClose, initialData = null }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        category_id: '',
        owner_id: user?.id || '',
        account_number: '',
        company_name: '',
        note: '',
        password_id: '',
        bill_id: ''
    });
    const [availablePasswords, setAvailablePasswords] = useState([]);
    const [availableBills, setAvailableBills] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
        fetchRelatedData();
        // Trigger enter animation
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, [initialData]);

    const fetchRelatedData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [passwords, bills, users, categories] = await Promise.all([
                fetchWithError('/api/passwords'),
                fetchWithError('/api/bills'),
                fetchWithError('/api/users/profiles'),
                fetchWithError('/api/accounts/categories', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            ]);

            setAvailablePasswords(passwords);
            setAvailableBills(bills);
            setAvailableUsers(users);
            setCategories(categories);
        } catch (error) {
            console.error('Error fetching related data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Convert string IDs to numbers
            const submissionData = {
                ...formData,
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
                owner_id: formData.owner_id ? parseInt(formData.owner_id) : null,
                password_id: formData.password_id ? parseInt(formData.password_id) : null,
                bill_id: formData.bill_id ? parseInt(formData.bill_id) : null
            };
            await onSubmit(submissionData);
            handleClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200); // Wait for exit animation
    };

    if (isLoading && !formData.title) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out z-50 ${isVisible ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-0'} overflow-y-auto`}>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div 
                    className={`modal-content bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ease-out my-8 ${
                        isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
                    }`}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {initialData ? 'Edit Account' : 'Add New Account'}
                            </h3>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200 select-center"
                                >
                                    <option value="">Select a category (required)</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Owner <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="owner_id"
                                    name="owner_id"
                                    value={formData.owner_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200 select-center"
                                >
                                    <option value="">Select an owner (required)</option>
                                    {availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="company_name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Account Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="account_number"
                                    name="account_number"
                                    value={formData.account_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="password_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Associated Password (Optional)
                                </label>
                                <select
                                    id="password_id"
                                    name="password_id"
                                    value={formData.password_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200 select-center"
                                >
                                    <option value="">None</option>
                                    {availablePasswords.map(password => (
                                        <option key={password.id} value={password.id}>
                                            {password.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="bill_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Associated Bill (Optional)
                                </label>
                                <select
                                    id="bill_id"
                                    name="bill_id"
                                    value={formData.bill_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200 select-center"
                                >
                                    <option value="">None</option>
                                    {availableBills.map(bill => (
                                        <option key={bill.id} value={bill.id}>
                                            {bill.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    id="note"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow-md transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {initialData ? 'Updating...' : 'Adding...'}
                                        </span>
                                    ) : (initialData ? 'Update Account' : 'Add Account')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountForm; 