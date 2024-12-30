import React from 'react';
import { ErrorTypes } from '../utils/errorUtils';

const Error = ({ message, onRetry, type = ErrorTypes.UNKNOWN }) => {
    const getErrorIcon = () => {
        switch (type) {
            case ErrorTypes.NETWORK:
                return '🌐';
            case ErrorTypes.AUTH:
                return '🔒';
            case ErrorTypes.VALIDATION:
                return '⚠️';
            case ErrorTypes.SERVER:
                return '🔧';
            case ErrorTypes.NOT_FOUND:
                return '🔍';
            default:
                return '❌';
        }
    };

    return (
        <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg
                        transition-shadow duration-200">
            <div className="text-4xl mb-4">{getErrorIcon()}</div>
            <div className="text-red-500 mb-4 text-lg font-medium">{message}</div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full
                              text-white transition-colors duration-200 ease-in-out
                              focus:outline-none focus:ring-2 focus:ring-blue-400
                              shadow-md hover:shadow-lg"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default Error; 