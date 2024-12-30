import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WifiIcon } from '@heroicons/react/24/outline';

const WifiNetworkList = ({ networks, onDelete }) => {
    const generateWifiQR = (network) => {
        // Handle different security types appropriately
        let securityType = network.encryptionType?.toUpperCase() || 'WPA';
        
        // Map security types to QR code format
        const securityMap = {
            'WPA3': 'WPA3',
            'WPA3-SAE': 'SAE',
            'WPA2': 'WPA2',
            'WPA': 'WPA',
            'WEP': 'WEP',
            'NONE': 'nopass'
        };

        const mappedType = securityMap[securityType] || securityType;
        
        // Escape special characters in SSID and password
        const escapedSsid = network.ssid.replace(/[;:,\\]/g, '\\$&');
        const escapedPassword = network.password.replace(/[;:,\\]/g, '\\$&');
        
        return `WIFI:T:${mappedType};S:${escapedSsid};P:${escapedPassword};;`;
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            {networks.map(network => (
                <div key={network.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {network.ssid}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {network.encryptionType}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <WifiIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <button
                                onClick={() => onDelete(network.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent rounded-xl text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <QRCodeSVG 
                            value={generateWifiQR(network)}
                            size={128}
                            level="H"
                            className="dark:bg-white dark:p-2 dark:rounded-lg"
                        />
                    </div>
                </div>
            ))}
            {networks.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            No Networks
                        </h3>
                        <WifiIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No WiFi networks have been added yet.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WifiNetworkList; 