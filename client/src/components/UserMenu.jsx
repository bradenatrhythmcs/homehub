import React, { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircleIcon, ChevronDownIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = ({ user: initialUser }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(initialUser);
    const { logout } = useAuth();

    useEffect(() => {
        // Update user state if initialUser changes or if we need to get it from localStorage
        if (!initialUser) {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                setUser(storedUser);
            }
        } else {
            setUser(initialUser);
        }
    }, [initialUser]);

    const handleLogout = () => {
        logout();
    };

    if (!user) return null;

    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors duration-200">
                <UserCircleIcon className="h-8 w-8" />
                <span className="text-sm font-medium hidden md:block">{user.username}</span>
                <ChevronDownIcon className="h-5 w-5 hidden md:block" />
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    to="/profile/settings"
                                    className={`${
                                        active ? 'bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                                    } flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                                >
                                    <UserCircleIcon className="h-5 w-5 mr-3" />
                                    Profile Settings
                                </Link>
                            )}
                        </Menu.Item>

                        {user.is_admin === 1 && (
                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        to="/admin"
                                        className={`${
                                            active ? 'bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                                        } flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                                    >
                                        <Cog6ToothIcon className="h-5 w-5 mr-3" />
                                        Admin Panel
                                    </Link>
                                )}
                            </Menu.Item>
                        )}
                    </div>
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    className={`${
                                        active ? 'bg-gray-50 dark:bg-gray-700 text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'
                                    } flex items-center px-4 py-2 text-sm w-full transition-colors duration-150`}
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                                    Logout
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default UserMenu; 