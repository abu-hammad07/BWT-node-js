const UserModel = require('../models/userModel');

class UserController {
    static async getAllUsers(req, res) {
        try {
            const users = await UserModel.readAllUsers();
            if (users.length === 0) {
                return res.send({ message: 'No users found' });
            }
            res.send(users);
        } catch (error) {
            res.status(500).send({ message: 'Server error' });
        }
    }

    static async getUser(req, res) {
        try {
            const user = await UserModel.getUserById(parseInt(req.params.id));
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.send(user);
        } catch (error) {
            res.status(500).send({ message: 'Server error' });
        }
    }

    static async createUser(req, res) {
        try {
            const existingUsers = await UserModel.readAllUsers();
            const userExists = existingUsers.some(
                user => user.username === req.body.username || user.email === req.body.email
            );
            
            if (userExists) {
                return res.status(400).send({ message: 'Username or Email already exists' });
            }

            const user = await UserModel.createUser(req.body);
            res.status(201).send({ message: 'User created successfully', user });
        } catch (error) {
            res.status(500).send({ message: 'Server error' });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await UserModel.getUserById(req.user.userID);
            res.send({ message: 'User profile', user });
        } catch (error) {
            res.status(500).send({ message: 'Server error' });
        }
    }

    static async updateProfile(req, res) {
        try {
            const updatedUser = await UserModel.updateUser(req.user.userID, req.body);
            if (!updatedUser) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.send({ message: 'Profile updated successfully', user: updatedUser });
        } catch (error) {
            res.status(500).send({ message: 'Server error' });
        }
    }
}

module.exports = UserController;