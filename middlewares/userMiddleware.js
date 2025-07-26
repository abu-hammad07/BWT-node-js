module.exports.createUserValidator = (req, res, next) => {
    if (!req.body.name || !req.body.username || !req.body.email || !req.body.password || !req.body.age || !req.body.gender) {
        return res.status(400).send({ message: 'All fields are required' });
    }
    next();
}