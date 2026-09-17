const express = require('express');
const bcrypt = require('bcryptjs');
const md5 = require('md5');
const { User, Profile, Following } = require('./models');
const sessionUser = {};
const cookieKey = 'sid';
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

async function register(req, res) {
    const { username, password, email, phone, zipcode } = req.body;

    if (!username || !password || !email || !phone || !zipcode) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(409).send({ error: 'Username already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const userCount = await User.countDocuments();
    // userid should be unique, so we use the count of existing users + 1
    const newUser = new User({ username, userid: userCount + 1, salt, hash, isThirdParty: false, thirdPartyId: '' });
    const newProfile = new Profile({ username, headline: 'New User', email, phone, zipcode, avatar: '' });

    newUser.save().then(user => {
        newProfile.save().then(() => {
            res.status(201).send({ message: 'success', username });
        });
    }).catch(err => {
        res.status(500).send({ error: 'Error registering user' });
    });
}

function login(req, res) {
    const { username, password } = req.body;
    
    User.findOne({ username }).then(user => {
        if (user) {
            if (bcrypt.compareSync(password, user.hash)) {
                const sessionKey = md5(new Date().getTime() + username);
                sessionUser[sessionKey] = user;
                console.log('Generated Session Key:', sessionKey);
                res.cookie(cookieKey, sessionKey, { maxAge: 3600 * 1000, httpOnly: true, sameSite: 'None', secure: process.env.NODE_ENV === 'production' });
                console.log('Secure:', process.env.NODE_ENV === 'production');
                res.status(200).send({ message: 'Login successful', username: user.username, avatar: user.avatar, headline: user.headline });
            } else {
                res.status(401).send({ error: 'Invalid username or password' });
            }
        } else {
            res.status(401).send({ error: 'Invalid username or password' });
        }
    }).catch(err => {
        res.status(500).send({ error: 'Error logging in' });
    });
}

function logout(req, res) {
    const sessionKey = req.cookies[cookieKey];
    if (sessionKey && sessionUser[sessionKey]) {
        delete sessionUser[sessionKey];
        res.clearCookie(cookieKey);
        res.status(200).send({ message: 'Logged out successfully' });
    } else {
        res.status(400).send({ error: 'No user is logged in' });
    }
}

function isLoggedIn(req, res, next) {
    console.log('Cookies:', req.cookies);
    const sessionKey = req.cookies[cookieKey];
    console.log('Session Key:', sessionKey);
    console.log('Session User:', sessionUser);

    if (sessionKey && sessionUser[sessionKey]) {
        req.user = sessionUser[sessionKey];
        return next();
    }
    res.status(401).send({ error: 'Unauthorized' });
}

// function changePassword(req, res) {
//     const { password } = req.body;
//     const salt = md5(req.user.username + new Date().getTime());
//     const hash = bcrypt.hashSync(password + salt, 10);

//     User.findOneAndUpdate({ username: req.user.username }, { salt, hash }, { new: true }).then(user => {
//         res.status(200).send({ username: user.username, result: 'success' });
//     }).catch(err => {
//         res.status(500).send({ error: 'Error changing password' });
//     });
// }

function updatePassword(req, res) {
    const { password } = req.body;
    const salt = md5(req.user.username + new Date().getTime());
    const hash = bcrypt.hashSync(password + salt, 10);

    User.findOneAndUpdate({ username: req.user.username }, { salt, hash }, { new: true }).then(user => {
        res.status(200).send({ username: user.username, result: 'success' });
    });
}


function passportConfig(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = {
                'name' : profile.displayName,
                'id'   : profile.id,
                'image': profile.photos[0].value,
                'token': accessToken
            };
            // You can perform any necessary actions with your user at this point,
            // e.g. internal verification against a users table,
            // creating new user entries, etc.

            // Check if user already exists
            const existingUser = await User.findOne({ username: user.name });
            if (existingUser) {
                return done(null, existingUser);
            }

            const userCount = await User.countDocuments();

            // Create a new user if not found
            const newUser = new User({
                userid: userCount + 1,
                username: user.name,
                avatar: user.image,
                headline: 'New User',
                salt: '',
                hash: '',
                isThirdParty: true,
            });

            const newProfile = new Profile({
                username: user.name,
                email: '',
                phone: '',
                zipcode: '',
                avatar: user.image,
                following: [],
            });

            const newFollowing = new Following({
                username: user.name,
                following: [],
            });

            const savedUser = await newUser.save();
            const savedProfile = await newProfile.save();
            const savedFollowings = await newFollowing.save();
            return done(null, savedUser, savedProfile, savedFollowings);
        } catch (err) {
            return done(err);
        }
    }));
    // Redirect the user to Google for authentication.  When complete,
    // Google will redirect the user back to the application at
    //     /auth/google/callback
    app.get('/auth/google', passport.authenticate('google',{ scope: ['https://www.googleapis.com/auth/plus.login'] })); // could have a passport auth second arg {scope: 'email'}

    // Google will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get('/auth/google/callback', 
        passport.authenticate('google', { 
            failureRedirect: '/' 
        }),
        (req, res) => {
            const { username, avatar, headline, isThirdParty } = req.user;
            // console.log('req.user', req.user);
        
            // Set isLoggedIn for third-party users
            const sessionKey = md5(new Date().getTime() + username);
            sessionUser[sessionKey] = req.user;
            res.cookie(cookieKey, sessionKey, { maxAge: 3600 * 1000, httpOnly: true, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' });

            res.redirect(`https://ricebook-jc316.surge.sh/main?username=${username}&avatar=${avatar}&headline=${headline}&isThirdParty=${isThirdParty}`);
        }
    );
}

module.exports = (app) => {
    app.post('/register', register);
    app.post('/login', login);
    app.put('/logout', isLoggedIn, logout);
    app.put('/password', isLoggedIn, updatePassword);
};

module.exports.passportConfig = passportConfig;
module.exports.isLoggedIn = isLoggedIn;
