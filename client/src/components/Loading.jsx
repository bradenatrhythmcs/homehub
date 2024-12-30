import React from 'react';

const Loading = ({ fullScreen = false }) => {
    const content = (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-800">Loading...</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-blue-50 bg-opacity-75 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
};

export default Loading; 