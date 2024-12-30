import React from 'react';
import { Link } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';
import { PlusIcon } from '@heroicons/react/24/solid';

const ProfileGrid = ({ profiles, onProfileClick }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-center mb-12">Who's using HomeHub?</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {profiles.map(profile => (
                        <button 
                            key={profile.id} 
                            onClick={() => onProfileClick(profile.username)}
                            className="flex flex-col items-center group"
                        >
                            <ProfileAvatar 
                                name={profile.display_name || profile.username}
                                imageUrl={profile.avatar_url}
                            />
                            <span className="mt-4 text-gray-400 group-hover:text-white transition-colors">
                                {profile.display_name || profile.username}
                            </span>
                        </button>
                    ))}
                    
                    {/* Add New Profile Button */}
                    <Link 
                        to="/register" 
                        className="flex flex-col items-center group"
                    >
                        <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center
                                      border-4 border-transparent group-hover:border-gray-400 transition-all
                                      group-hover:bg-gray-700">
                            <PlusIcon className="w-16 h-16 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="mt-4 text-gray-400 group-hover:text-white transition-colors">
                            Add Profile
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfileGrid; 