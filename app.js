// const express = require('express');
// const fs = require('fs');
// const { readFile, writeFile } = require('fs/promises');
// const cookieParser = require('cookie-parser');

// const app = express();
// const PORT = 3000;

// app.set('view engine', 'ejs');
// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json({ extended: true }));
// app.use(cookieParser());

// // app.use(session({
// //     secret: 'keyboard cat',
// //     resave: false,
// //     saveUninitialized: true
// // }));

// /**
//  * LOG request time and path in file
//  * file name: access_logs.txt
//  */
// app.use((req, res, next) => {
//     const msg = `Request Time: ${new Date()} :::: Request Path: ${req.url}\n`;

//     // write to file
//     fs.appendFile('access_logs.txt', msg, (err) => {
//         if (err) throw err;
//     });
//     next();
// })

// /**
//  * Create a new user funtion Validation
//  */
// function validateUser(req, res, next) {
//     /**
//      * Validate required fields
//      */
//     if(!req.body.firstName || !req.body.lastName || !req.body.username || !req.body.email || !req.body.password) {
//         res.render('register', {error: 'All fields are required'});
//         return;
//     }

//     next();
// }


// app.get('/register', (req, res) => {
//     res.render('register', {error: ''});
// });


// app.post('/register', validateUser, async (req, res) => {

//     console.log(req.body);
    
//     // Read existing users from file
//     let users = await readFile('data/users.json', 'utf-8');
    
//     // Parse users or initialize empty array if file is empty 
//     users = users ? JSON.parse(users) : [];

//     // create new user object
//     const newUser = {
//         id: Date.now().toString(),
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         username: req.body.username,
//         email: req.body.email,
//         password: req.body.password,
//         age: req.body.age,
//         gender: req.body.gender
//     }

//     // Add new user to users array
//     users.push(newUser);

//     // Save users array to file
//     await writeFile('data/users.json', JSON.stringify(users));

//     res.redirect('/login');

// })

// /**
//  * Login Validation function
//  */
// function validateLogin(req, res, next) {

//     if(!req.body.email || !req.body.password) {
//         res.render('login', {error: 'All fields are required'});
//         return;
//     }
//     next();
// }

// /**
//  * Login
//  */
// app.get('/login', (req, res) => {
//     res.render('login', {error: ''});
// });


// /**
//  * user login
//  */
// app.post('/login', validateLogin, async (req, res) => {

//     // Read users
//     const users = await readFile('data/users.json', 'utf-8');
//     // Find user
//     const user = JSON.parse(users).find(user => user.email === req.body.email && user.password === req.body.password);
//     console.log(user);
//     // Check user
//     if(!user) {
//         res.render('login', {error: 'Invalid email or password'});
//         return;
//     }

//     // create cookie user id
//     // res.cookie('userId', user.id);

//     // session sote mainualy in cookie

//     res.redirect('/profile');


// })





// app.get('/', (req, res) => {
//     // res.cookie('name', 'John Doe');
//     res.send('Hello World');
// });

// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


































/**
 * ============================================================================================================
 * ============================================================================================================
 * ============================================================================================================
 */


const express = require('express');
const fs = require('fs/promises');
const { readFile, writeFile } = require('fs/promises');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const MY_SECRET_KEY = 'secret1q2w3e4r';

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// user file path
const userFilePath = path.join(__dirname, "data", "users.json");

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
 * Read All existing users from file (Middleware)
 */
async function readAllUsers() {
    let users = await readFile('data/users.json', 'utf8');
    users = users ? JSON.parse(users) : [];
    return users;
}

/**
 * Get User Find user by ID (Middleware)
 */
function getUser(users, userID) {
    return users.find(user => user.id === userID);
}

/**
 * Get User Index (Middleware)
 */
function getUserIndex(users, userID) {
    return users.findIndex(user => user.id === userID);
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
 * Middleware to validate login credentials
 */
function checkLoginValidator(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }
    next();
}



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
    const token = jwt.sign({ userID: user.id }, MY_SECRET_KEY, { expiresIn: '1h' });

    // res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=3600`);

    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600 * 1000
    });

    res.send({
        message: 'Login successful',
        token: token,
        user
    });

})

/**
 * Verify Token Middleware
 */
function verifyToken(req, res, next) {
    const token = req.cookies.token; // ✅ fixed: cookies instead of cookie
    if (!token) {
        return res.status(401).send({ meesage: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, MY_SECRET_KEY);
        req.user = decoded; // optional: attach user info to req
        next();
    } catch (err) {
        return res.status(401).send({ meesage: 'Unauthorized: Invalid token' });
    }
}


/**
 * Dashboard
 */
app.get('/dashbaord', verifyToken, (req, res) => {
    res.send(`Dashbaord `);
})


/**
 * After login show user profile
 */
app.get('/profile', verifyToken, async (req, res) => {

    try {

        const users = await readAllUsers();
        const user = getUser(users, req.user.userID);

        // Send user profile
        res.send({ message: 'User profile', user });
    } catch (err) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }

})


/**
 * UPDATE USER BY LOGGED IN USER ID
 */
app.post('/profile/update', verifyToken, async (req, res) => {

    const users = await readAllUsers();
    const user = getUserIndex(users, req.user.userID);

    // Update user information
    const updatedUser = { ...users[user], ...req.body };
    users[user] = updatedUser;

    // Save updated users to file
    await fs.writeFile(userFilePath, JSON.stringify(users, null, 2), 'utf8')

    res.send({ message: 'Profile updated successfully', user: updatedUser });
})


/**
 * User logout
 */
app.post('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token', { httpOnly: true, path: '/' })
    res.send({ message: 'Logout successful' });
})



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
