const Account = require('../models/account');

const accountController = {
    async getAll(req, res) {
        try {
            const accounts = await Account.findAll(req.user.id, req.user.account_type === 'child');
            res.json(accounts);
        } catch (error) {
            console.error('Error in getAll accounts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getById(req, res) {
        try {
            const account = await Account.findById(req.params.id, req.user.id);
            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }
            res.json(account);
        } catch (error) {
            console.error('Error in getById account:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async create(req, res) {
        try {
            if (req.user.account_type === 'child') {
                return res.status(403).json({ message: 'Children cannot create accounts' });
            }

            const accountData = {
                ...req.body,
                created_by: req.user.id
            };

            const id = await Account.create(accountData);
            const account = await Account.findById(id, req.user.id);
            res.status(201).json(account);
        } catch (error) {
            console.error('Error in create account:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async update(req, res) {
        try {
            if (req.user.account_type === 'child') {
                return res.status(403).json({ message: 'Children cannot update accounts' });
            }

            const account = await Account.findById(req.params.id, req.user.id);
            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }

            await Account.update(req.params.id, req.body);
            const updatedAccount = await Account.findById(req.params.id, req.user.id);
            res.json(updatedAccount);
        } catch (error) {
            console.error('Error in update account:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async delete(req, res) {
        try {
            if (req.user.account_type === 'child') {
                return res.status(403).json({ message: 'Children cannot delete accounts' });
            }

            const account = await Account.findById(req.params.id, req.user.id);
            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }

            await Account.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.error('Error in delete account:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getCategories(req, res) {
        try {
            const categories = await Account.getCategories(req.user.id);
            res.json(categories);
        } catch (error) {
            console.error('Error in getCategories:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = accountController; 