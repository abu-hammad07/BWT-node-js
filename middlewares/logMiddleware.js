const fs = require('fs/promises');

module.exports = async (req, res, next) => {
    const msg = `Request Time: ${new Date()} :::: Request Path: ${req.path} \n`;
    await fs.appendFile('access_logs.txt', msg);
    next();
};