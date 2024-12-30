import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { fetchWithError } from '../../utils/errorUtils';
import { COLORS, COLOR_NAMES } from '../../utils/colorUtils';
import { TagIcon } from '@heroicons/react/24/outline';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', color: 'blue' });
    const [editingCategory, setEditingCategory] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await fetchWithError(`${API_BASE_URL}/admin/categories`);
            setCategories(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchWithError(`${API_BASE_URL}/admin/categories`, {
                method: 'POST',
                body: JSON.stringify(newCategory)
            });
            setNewCategory({ name: '', color: 'blue' });
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateName = async (category, newName) => {
        try {
            await fetchWithError(`${API_BASE_URL}/admin/categories/${category.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: newName })
            });
            setEditingCategory(null);
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateColor = async (category, newColor) => {
        try {
            await fetchWithError(`${API_BASE_URL}/admin/categories/${category.id}`, {
                method: 'PUT',
                body: JSON.stringify({ color: newColor })
            });
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await fetchWithError(`${API_BASE_URL}/admin/categories/${categoryId}`, {
                method: 'DELETE'
            });
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add New Category Form */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    Add New Category
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Category name"
                            required
                            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div className="w-32">
                        <select
                            value={newCategory.color}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white text-center"
                        >
                            {COLOR_NAMES.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                        Add Category
                    </button>
                </form>
            </div>

            {/* Categories List */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Color
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Bills
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Accounts
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {categories.map(category => (
                            <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingCategory?.id === category.id ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={editingCategory.name}
                                                onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                                                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white text-sm"
                                            />
                                            <button
                                                onClick={() => handleUpdateName(category, editingCategory.name)}
                                                className="px-2 py-1 text-xs bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingCategory(null)}
                                                className="px-2 py-1 text-xs bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <TagIcon className="h-5 w-5 text-gray-400" />
                                            <span className={`text-sm font-medium ${
                                                COLORS[category.color]?.light.split(' ')[1] || 'text-gray-900'
                                            } ${
                                                COLORS[category.color]?.dark.split(' ')[1] || 'dark:text-white'
                                            }`}>
                                                {category.name}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <select
                                        value={category.color || 'blue'}
                                        onChange={(e) => handleUpdateColor(category, e.target.value)}
                                        className="block w-32 mx-auto rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm dark:text-white text-center"
                                    >
                                        {COLOR_NAMES.map(color => (
                                            <option key={color} value={color} className="text-center">{color}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {category.is_predefined ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                            Predefined
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                            Custom
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                                        {category.bills_count}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                        {category.accounts_count}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-xl text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                                        >
                                            Edit
                                        </button>
                                        {!category.is_predefined && (
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent rounded-xl text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {error && (
                <div className="mt-4 text-red-500 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default CategoryManager; 