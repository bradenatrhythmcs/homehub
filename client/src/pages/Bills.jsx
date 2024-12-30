import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithError } from '../utils/errorUtils';
import BillForm from '../components/BillManager/BillForm';
import BillList from '../components/BillManager/BillList';

const Bills = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            
            if (user.account_type === 'PARENT') {
                try {
                    const [billsResponse, categoriesResponse] = await Promise.all([
                        fetchWithError('/api/bills'),
                        fetchWithError('/api/bills/categories')
                    ]);
                    setBills(billsResponse);
                    setCategories(categoriesResponse.map(cat => cat.category));
                } catch (error) {
                    setError(error.message);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [user]);

    const handleAddBill = async (formData) => {
        try {
            const response = await fetchWithError('/api/bills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            setBills(prevBills => [...prevBills, response]);
            setIsFormOpen(false);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const handleDeleteBill = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bill?')) return;

        try {
            await fetchWithError(`/api/bills/${id}`, {
                method: 'DELETE',
            });
            setBills(prevBills => prevBills.filter(bill => bill.id !== id));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleMarkBillPaid = async (id) => {
        try {
            const response = await fetchWithError(`/api/bills/${id}/paid`, {
                method: 'POST',
            });
            setBills(prevBills => prevBills.map(bill => bill.id === id ? response : bill));
        } catch (error) {
            setError(error.message);
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
                    Bills & Subscriptions
                </h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Bill
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <BillList
                    bills={bills}
                    onDelete={handleDeleteBill}
                    onMarkPaid={handleMarkBillPaid}
                    showAll={true}
                />
            </div>

            {isFormOpen && (
                <BillForm
                    isOpen={isFormOpen}
                    onSubmit={handleAddBill}
                    onClose={() => setIsFormOpen(false)}
                    categories={categories}
                />
            )}
        </div>
    );
};

export default Bills; 