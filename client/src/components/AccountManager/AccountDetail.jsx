import { XMarkIcon, KeyIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const AccountDetail = ({ account, onClose }) => {
    if (!account) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ease-out">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Account Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h4>
                            <p className="mt-1 text-base text-gray-900 dark:text-white">{account.title}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</h4>
                            <p className="mt-1 text-base text-gray-900 dark:text-white">{account.company_name}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h4>
                            <span className={`mt-1 inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-${account.category_color || 'orange'}-100 dark:bg-${account.category_color || 'orange'}-900 text-${account.category_color || 'orange'}-800 dark:text-${account.category_color || 'orange'}-200`}>
                                {account.category_name}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner</h4>
                            <p className="mt-1 text-base text-gray-900 dark:text-white">{account.owner_username}</p>
                        </div>

                        {account.account_number && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Number</h4>
                                <p className="mt-1 text-base text-gray-900 dark:text-white">{account.account_number}</p>
                            </div>
                        )}

                        {account.note && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h4>
                                <p className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-wrap">{account.note}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Linked Items</h4>
                            <div className="mt-2 space-y-2">
                                {account.password_title ? (
                                    <span className="inline-flex items-center px-2 py-1 text-sm rounded-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100">
                                        <KeyIcon className="h-3 w-3 mr-1" />
                                        {account.password_title}
                                    </span>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No linked password</p>
                                )}
                                {account.bill_title && (
                                    <span className="inline-flex items-center px-2 py-1 text-sm rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                                        <BanknotesIcon className="h-3 w-3 mr-1" />
                                        {account.bill_title}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDetail; 