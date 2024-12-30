import React from 'react';
import Navbar from '../Navbar';

const AuthenticatedLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default AuthenticatedLayout; 