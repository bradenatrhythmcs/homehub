import React, { useState } from 'react';
import { WifiIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';

const WifiNetworkCard = ({ network }) => {
    const [showPassword, setShowPassword] = useState(false);

    const generateWifiQR = (network) => {
        return `WIFI:S:${network.ssid};T:${network.security_type};P:${network.password};;`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    WiFi Details
                </h2>
                <WifiIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="grid grid-cols-[1fr,auto] gap-8">
                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Network Name:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {network.ssid}
                        </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Password:</span>
                        <div className="relative inline-block">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={network.password}
                                readOnly
                                className="text-sm font-mono bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 pr-10 text-gray-900 dark:text-gray-100 w-full"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    {network.notes && (
                        <div className="flex flex-col space-y-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Notes:</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                {network.notes}
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <QRCodeSVG 
                            value={generateWifiQR(network)}
                            size={120}
                            level="H"
                            className="dark:bg-white rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WifiNetworkCard; 