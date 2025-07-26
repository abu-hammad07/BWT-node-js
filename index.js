const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logMiddleware = require('./middlewares/logMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { PORT, SECRET_KEY } = require('./config/constants');

const jwt = require('jsonwebtoken')

const app = express();


// view engine setup
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(logMiddleware);

app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log('Decoded Token:', decoded, decoded.userID, token);
    } catch (err) {
      console.log('Invalid Token:', err);
    }
  }
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);





// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
