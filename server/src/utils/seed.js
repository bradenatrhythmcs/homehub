const User = require('../models/user');
const WifiNetwork = require('../models/wifi-network');

async function seedDatabase() {
    try {
        // Create test users
        const parentUser = await User.create({
            username: 'parent',
            password: 'Parent123',
            dateOfBirth: '1990-01-01',
            displayName: 'Parent User'
        });

        const childUser = await User.create({
            username: 'child',
            password: 'Child123',
            dateOfBirth: '2010-01-01',
            displayName: 'Child User'
        });

        // Create some test WiFi networks
        await WifiNetwork.create({
            ssid: 'Home Network',
            password: 'homepass123',
            encryptionType: 'WPA2',
            isHidden: false,
            createdBy: parentUser
        });

        await WifiNetwork.create({
            ssid: 'Guest Network',
            password: 'guestpass123',
            encryptionType: 'WPA2',
            isHidden: false,
            createdBy: parentUser
        });

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

// Run the seed function if this file is run directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase; 