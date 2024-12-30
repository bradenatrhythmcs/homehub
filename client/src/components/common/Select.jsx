import React from 'react';

const Select = ({ 
    id,
    name,
    value,
    onChange,
    required,
    className = '',
    children,
    ...props
}) => {
    const baseClasses = "w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none transition-colors duration-200 select-center";

    return (
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`${baseClasses} ${className}`}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select; 