import { useState } from 'react';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, KeyIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import AccountDetail from './AccountDetail';
import { getColorClasses } from '../../utils/colorUtils';

const AccountList = ({ accounts, onDelete, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);

    const filteredAccounts = accounts.filter(account => 
        account.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (account.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mt-4">
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search accounts..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Linked Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAccounts.map((account) => (
                            <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    <button
                                        onClick={() => setSelectedAccount(account)}
                                        className="hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        {account.title}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {account.company_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses(account.category_color)}`}>
                                        {account.category_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {account.owner_username}
                                </td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">
                                    <div className="flex flex-col gap-2">
                                        {account.password_title && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                                <KeyIcon className="h-3 w-3 mr-1" />
                                                {account.password_title}
                                            </span>
                                        )}
                                        {account.bill_title && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                <BanknotesIcon className="h-3 w-3 mr-1" />
                                                {account.bill_title}
                                            </span>
                                        )}
                                        {!account.password_title && !account.bill_title && (
                                            <span className="text-gray-500 dark:text-gray-400 text-xs italic">
                                                No linked items
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                    <button
                                        onClick={() => setSelectedAccount(account)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(account)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(account.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedAccount && (
                <AccountDetail
                    account={selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                />
            )}
        </div>
    );
};

export default AccountList; 