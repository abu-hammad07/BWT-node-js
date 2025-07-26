const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config/constants.js')

module.exports.verifyToken = (req, res, next) => {
    const token = req.cookies.token; // ✅ fixed: cookies instead of cookie
    if (!token) {
        return res.status(401).send({ meesage: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // optional: attach user info to req
        next();
    } catch (err) {
        return res.status(401).send({ meesage: 'Unauthorized: Invalid token' });
    }
}


module.exports.checkLoginValidator = (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }
    next();
}