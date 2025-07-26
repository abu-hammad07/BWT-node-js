const { readFile, writeFile } = require('fs/promises');
const { USER_FILE_PATH } = require('../config/constants.js')

class UserModel {
    static async readAllUsers() {
        let users = await readFile(USER_FILE_PATH, 'utf8');
        return users ? JSON.parse(users) : [];
    }

    static async getUserById(userID) {
        const users = await this.readAllUsers();
        return users.find(user => user.id === userID);
    }

    static async getUserByUsername(username) {
        const users = await this.readAllUsers();
        return users.find(user => user.username === username);
    }

    static async createUser(userData) {
        const users = await this.readAllUsers();
        const user = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            ...userData
        };
        users.push(user);
        await writeFile(USER_FILE_PATH, JSON.stringify(users), 'utf8');
        return user;
    }

    static async updateUser(userID, updateData) {
        const users = await this.readAllUsers();
        const userIndex = users.findIndex(user => user.id === userID);
        if (userIndex === -1) return null;
        
        users[userIndex] = { ...users[userIndex], ...updateData };
        await writeFile(USER_FILE_PATH, JSON.stringify(users), 'utf8');
        return users[userIndex];
    }
}

module.exports = UserModel;