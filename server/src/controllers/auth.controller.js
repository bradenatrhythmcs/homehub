const jwt = require('jsonwebtoken');
const User = require('../models/user');

class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const validUser = await User.validatePassword(username, password);
            if (!validUser) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username, 
                    account_type: user.account_type,
                    is_admin: user.is_admin
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    account_type: user.account_type,
                    is_admin: user.is_admin,
                    display_name: user.display_name,
                    email: user.email,
                    theme_preference: user.theme_preference,
                    language_preference: user.language_preference,
                    avatar_url: user.avatar_url
                } 
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    static async register(req, res) {
        try {
            const { 
                username, 
                password, 
                date_of_birth, 
                account_type = null,
                display_name = null,
                email = null
            } = req.body;
            
            if (!username || !password || !date_of_birth) {
                return res.status(400).json({ 
                    message: 'Username, password, and date of birth are required' 
                });
            }

            // Validate date of birth
            const birthDate = new Date(date_of_birth);
            if (isNaN(birthDate.getTime())) {
                return res.status(400).json({ 
                    message: 'Invalid date of birth format. Please use YYYY-MM-DD' 
                });
            }

            // Calculate age and determine account type
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // Set account type based on age
            const determinedAccountType = age >= 18 ? 'PARENT' : 'CHILD';

            // Create the user with the determined account type
            const userId = await User.create({ 
                username, 
                password, 
                date_of_birth, 
                account_type: determinedAccountType,
                display_name,
                email
            });

            // Get the created user to check if they were made admin
            const user = await User.findById(userId);

            res.status(201).json({ 
                message: 'User created successfully', 
                userId,
                is_admin: user.is_admin,
                account_type: user.account_type
            });
        } catch (error) {
            console.error('Registration error:', error);
            if (error.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Username already exists' });
            }
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = AuthController; 