import React, { useState, useMemo } from 'react';
import { TrashIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getColorClasses } from '../../utils/colorUtils';

const BillList = ({ bills, onDelete, onMarkPaid, showAll = true }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmingPaid, setConfirmingPaid] = useState(null);
    const { user } = useAuth();

    const filteredBills = bills.filter(bill => {
        const searchString = `${bill.title} ${bill.category_name || ''} ${bill.url || ''}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    });

    const displayBills = showAll ? filteredBills : filteredBills.slice(0, 4);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const handleConfirmPaid = (billId) => {
        setConfirmingPaid(billId);
    };

    const handleMarkPaid = (billId) => {
        onMarkPaid(billId);
        setConfirmingPaid(null);
    };

    const getStatusBadge = (frequency, nextDueDate) => {
        const dueDate = new Date(nextDueDate);
        const today = new Date();
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    Overdue
                </span>
            );
        } else if (diffDays <= 7) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    Due Soon
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Upcoming
                </span>
            );
        }
    };

    const billSummary = useMemo(() => {
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        return displayBills.reduce((acc, bill) => {
            if (!bill.cost) return acc;
            
            const dueDate = new Date(bill.next_due_date);
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            const cost = parseFloat(bill.cost);

            if (dueDate <= endOfMonth) {
                acc.currentMonth += cost;
            }
            if (diffDays <= 14) {
                acc.next14Days += cost;
            }
            if (diffDays <= 30) {
                acc.next30Days += cost;
            }

            return acc;
        }, {
            currentMonth: 0,
            next14Days: 0,
            next30Days: 0
        });
    }, [displayBills]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };
    
    return (
        <div className="mt-4">
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search bills..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frequency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Due</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {displayBills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <div>
                                        {bill.title}
                                        {bill.url && (
                                            <a 
                                                href={bill.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block text-xs"
                                            >
                                                {bill.url}
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses(bill.category_color)}`}>
                                        {bill.category_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                                    {bill.frequency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {bill.cost ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bill.cost) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(bill.next_due_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {getStatusBadge(bill.frequency, bill.next_due_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex space-x-2">
                                        {confirmingPaid === bill.id ? (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleMarkPaid(bill.id)}
                                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setConfirmingPaid(null)}
                                                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleConfirmPaid(bill.id)}
                                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                title="Mark as paid"
                                            >
                                                <CheckCircleIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {showAll && user.is_admin === 1 && (
                                            <button
                                                onClick={() => onDelete(bill.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                title="Delete bill"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Summary Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Due This Month</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(billSummary.currentMonth)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Due in Next 14 Days</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(billSummary.next14Days)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Due in Next 30 Days</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(billSummary.next30Days)}</p>
                </div>
            </div>
        </div>
    );
};

export default BillList; 