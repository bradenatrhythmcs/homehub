import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ContactList from './ContactList';
import ContactForm from './ContactForm';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithError } from '../../utils/errorUtils';

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetchWithError('/api/contacts');
            setContacts(response.contacts || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddContact = async (contactData) => {
        try {
            const response = await fetchWithError('/api/contacts', {
                method: 'POST',
                body: JSON.stringify(contactData)
            });
            setContacts(prev => [...prev, response.contact]);
            return response.contact;
        } catch (error) {
            console.error('Error adding contact:', error);
            throw error;
        }
    };

    const handleEditContact = async (contactData) => {
        try {
            const response = await fetchWithError(`/api/contacts/${contactData.id}`, {
                method: 'PATCH',
                body: JSON.stringify(contactData)
            });
            setContacts(prev => prev.map(contact => 
                contact.id === response.contact.id ? response.contact : contact
            ));
            return response.contact;
        } catch (error) {
            console.error('Error updating contact:', error);
            throw error;
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;

        try {
            await fetchWithError(`/api/contacts/${contactId}`, {
                method: 'DELETE'
            });
            setContacts(prev => prev.filter(contact => contact.id !== contactId));
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const openAddForm = () => {
        setEditingContact(null);
        setIsFormOpen(true);
    };

    const openEditForm = (contact) => {
        setEditingContact(contact);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingContact(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Contacts
                </h2>
                {user?.account_type === 'PARENT' && (
                    <button
                        onClick={openAddForm}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add
                    </button>
                )}
            </div>

            <ContactList
                contacts={contacts}
                onDelete={handleDeleteContact}
                onEdit={openEditForm}
            />

            <ContactForm
                isOpen={isFormOpen}
                onClose={closeForm}
                onSubmit={editingContact ? handleEditContact : handleAddContact}
                initialData={editingContact}
            />
        </div>
    );
};

export default ContactManager; 