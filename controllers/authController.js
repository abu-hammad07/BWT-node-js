const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { SECRET_KEY } = require('../config/constants');

class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await UserModel.getUserByUsername(username);
            
            if (!user || user.password !== password) {
                return res.status(401).send({ message: 'Invalid username or password' });
            }

            const token = jwt.sign({ userID: user.id }, SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, maxAge: 3600 * 1000 });
            
            res.send({ message: 'Login successful', token, user });
        } catch (error) {
            res.status(500).send({ message: 'Server error' });
        }
    }

    static logout(req, res) {
        res.clearCookie('token', { httpOnly: true, path: '/' });
        res.send({ message: 'Logout successful' });
    }

    static getDashboard(req, res) {
        res.send('Dashboard');
    }
}

module.exports = AuthController;