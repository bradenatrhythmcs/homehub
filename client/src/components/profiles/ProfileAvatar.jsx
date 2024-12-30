import React from 'react';

const ProfileAvatar = ({ name, imageUrl }) => {
    if (imageUrl) {
        return (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-transparent 
                          group-hover:border-white transition-all">
                <img 
                    src={imageUrl} 
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // If no image, use first letter of name in a colored circle
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 
        'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    return (
        <div className={`w-32 h-32 rounded-full ${bgColor} flex items-center justify-center
                        border-4 border-transparent group-hover:border-white transition-all`}>
            <span className="text-4xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
            </span>
        </div>
    );
};

export default ProfileAvatar; 