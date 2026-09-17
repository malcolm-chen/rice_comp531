const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./src/auth');
const profileRoutes = require('./src/profile');
const articlesRoutes = require('./src/articles');
const followingRoutes = require('./src/following');
const passportConfig = require('./src/auth').passportConfig;

const app = express();
const port = process.env.PORT || 5001;

// CORS
app.use(cors({
    origin: 'https://ricebook-jc316.surge.sh',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session
app.use(session({
    secret: 'DoNotGuessTheSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'None'
    }
}));

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);

// Routes
passportConfig(app);

authRoutes(app);
profileRoutes(app);
articlesRoutes(app);
followingRoutes(app);

app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

app.listen(port, () => {
    console.log(`Server running at https://jc316-ricebook-05f8969ba16c.herokuapp.com`);
});

module.exports = app;