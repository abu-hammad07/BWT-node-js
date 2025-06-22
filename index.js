const express = require('express');
const fs = require('fs');
const { readFile, writeFile } = require('fs/promises');
const cookies = require('cookies');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

let users = [];

/**
 * LOG request time and path in file
 * file name: access_logs.txt
 */
app.use((req, res, next) => {
    const msg = `Request Time: ${new Date()} :::: Request Path: ${req.path} \n`;

    // WRITE
    fs.appendFile('access_logs.txt', msg, (err) => {
        if (err) throw err;
    });

    next();
});


/**
 * Create a new user function
 */
async function createUserValidator(req, res, next) {
    /**
     * Validate required fields
     */
    if (!req.body.name || !req.body.username || !req.body.email || !req.body.password || !req.body.age || !req.body.gender) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    /**
     * Check if the user already exists (username or email)
     */
    let existingUsers = await readFile('data/users.json', 'utf8');
    existingUsers = existingUsers ? JSON.parse(existingUsers) : [];
    const userExists = existingUsers.some(user => user.username === req.body.username || user.email === req.body.email);
    if (userExists) {
        return res.status(400).send({ message: 'Username or Email already exists' });
    }

    next();
}

/**
 * Post route to create a new user
 */
app.post('/users', createUserValidator, async (req, res) => {

    // Read existing users from file
    let users = await readFile('data/users.json', 'utf8');

    // Parse users or initialize an empty array if no users exist
    users = users ? JSON.parse(users) : [];

    // Create a new user object
    const user = {
        id: Date.now() + Math.floor(Math.random() * 1000), // Unique ID
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age,
        gender: req.body.gender
    }

    // Add the new user to the users array
    users.push(user);

    // Write the updated users array back to the file
    await writeFile('data/users.json', JSON.stringify(users), 'utf8', (err) => {
        if (err) throw err;
    })

    // Send response back to client
    res.status(201).send({ message: 'User created successfully', user });

})

/**
 * READ ALL USERS
 */
app.get('/users', async (req, res) => {

    // Read existing users from file
    let users = await readFile('data/users.json', 'utf8');
    users = users ? JSON.parse(users) : [];

    // If no users exist, return an empty array
    if (users.length === 0) {
        return res.send({ message: 'No users found' });
    }

    res.send(users);
})


/**
 * Read a user by ID
 */

app.get('/users/:id', async (req, res) => {

    // Read existing users from file
    let users = await readFile('data/users.json', 'utf8');
    users = users ? JSON.parse(users) : [];

    // Find user by ID
    const user = users.find(user => user.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    res.send(user);
})




/**
 * Login user
 */
app.post('/login', checkLoginValidator, async (req, res) => {

    // Read existing users from file
    let users = await readFile('data/users.json', 'utf8');
    users = users ? JSON.parse(users) : [];

    // Find user by username and password
    const user = users.find(user => user.username === req.body.username && user.password === req.body.password);
    if (!user) {
        return res.status(401).send({ message: 'Invalid username or password' });
    }

    // Cookie or session management can be added here
    // cookies.set('userId', user.id, { httpOnly: true });

    res.setHeader('Set-Cookie', `userId=${user.id}; HttpOnly; Path=/; Max-Age=3600`);
    res.send({ message: 'Login successful', user });

})

/** 
 * Middleware to validate login credentials
 */
function checkLoginValidator(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }
    next();
}


/**
 * After login show user profile
 */
app.get('/profile', async (req, res) => {

    // check userID from cookies
    console.log('Request Headers:', req.headers.cookie);

    // Extract userId from cookies
    const userId = req.headers.cookie ? req.headers.cookie.split('; ').find(row => row.startsWith('userId=')).split('=')[1] : null;
    if (!userId) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    // Read existing users from file
    let users = await readFile('data/users.json', 'utf8');
    users = users ? JSON.parse(users) : [];

    // Find user by ID
    const user = users.find(user => user.id === parseInt(userId));
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    // Send user profile
    res.send({ message: 'User profile', user });

})


/**
 * UPDATE USER BY LOGGED IN USER ID
 */
app.post('/profile/update', async (req, res) => {

    // Check userID from cookies
    const userId = req.headers.cookie ? req.headers.cookie.split('; ').find(row => row.startsWith('userId=')).split('=')[1] : null;
    if (!userId) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    // Read existing users from file
    let users = await readFile('data/users.json', 'utf8');
    users = users ? JSON.parse(users) : [];
    // Find user by ID
    const userIndex = users.findIndex(user => user.id === parseInt(userId));
    if (userIndex === -1) {
        return res.status(404).send({ message: 'User not found' });
    }

    // Update user information
    const updatedUser = { ...users[userIndex], ...req.body };
    users[userIndex] = updatedUser;

    // Save updated users to file
    await writeFile('data/users.json', JSON.stringify(users, null, 2));

    res.send({ message: 'Profile updated successfully', user: updatedUser });
})


/**
 * User logout
 */
app.post('/logout', (req, res) => {
    // Clear userId cookie
    res.setHeader('Set-Cookie', 'userId=; HttpOnly; Path=/; Max-Age=0');
    res.send({ message: 'Logout successful' });
})



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
