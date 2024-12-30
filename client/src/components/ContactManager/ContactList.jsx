import React, { useState } from 'react';
import { TrashIcon, MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ContactList = ({ contacts = [], onDelete, onEdit, showAll = true }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    const filteredContacts = Array.isArray(contacts) ? contacts.filter(contact => {
        const searchString = `${contact.first_name} ${contact.last_name} ${contact.email || ''} ${contact.phone_number || ''} ${contact.contact_type}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    }) : [];

    const displayContacts = showAll ? filteredContacts : filteredContacts.slice(0, 4);

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString() : 'Not provided';
    };

    const getContactTypeBadge = (type) => {
        const colors = {
            'Family': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'Friend': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'Business': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'Vendor': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
            'Other': 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}>
                {type}
            </span>
        );
    };

    return (
        <div className="mt-4">
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search contacts..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {displayContacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <div>
                                        {contact.first_name} {contact.last_name}
                                        {contact.date_of_birth && (
                                            <span className="text-gray-500 dark:text-gray-400 text-xs block">
                                                DOB: {formatDate(contact.date_of_birth)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {getContactTypeBadge(contact.contact_type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div>
                                        {contact.email && (
                                            <a href={`mailto:${contact.email}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block">
                                                {contact.email}
                                            </a>
                                        )}
                                        {contact.phone_number && (
                                            <a href={`tel:${contact.phone_number}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block">
                                                {contact.phone_number}
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {contact.street_address && (
                                        <div className="whitespace-normal">
                                            <div>{contact.street_address}</div>
                                            <div>
                                                {contact.city && `${contact.city}, `}
                                                {contact.state} {contact.postal_code}
                                            </div>
                                            {contact.country && <div>{contact.country}</div>}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex space-x-2">
                                        {contact.created_by === user.id && (
                                            <>
                                                <button
                                                    onClick={() => onEdit(contact)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                                    title="Edit contact"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(contact.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                    title="Delete contact"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactList; 