const { Profile } = require('./models');
const { isLoggedIn } = require('./auth');
const uploadImage = require('./uploadCloudinary')

function getHeadline(req, res) {
    const username = req.params.user || req.user.username;
    Profile.findOne({ username }).then(profile => {
        if (profile) {
            res.status(200).send({ username: profile.username, headline: profile.headline });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    }).catch(err => {
        res.status(500).send({ error: 'Error retrieving headline' });
    });
}

function updateHeadline(req, res) {
    const { headline } = req.body;
    Profile.findOneAndUpdate({ username: req.user.username }, { headline }, { new: true }).then(profile => {
        res.status(200).send({ username: profile.username, headline: profile.headline });
    }).catch(err => {
        res.status(500).send({ error: 'Error updating headline' });
    });
}

function getEmail(req, res) {
    const username = req.params.user || req.user.username;
    Profile.findOne({ username }).then(profile => {
        if (profile) {
            res.status(200).send({ username: profile.username, email: profile.email });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    }).catch(err => {
        res.status(500).send({ error: 'Error retrieving email' });
    });
}

function updateEmail(req, res) {
    const { email } = req.body;
    Profile.findOneAndUpdate({ username: req.user.username }, { email }, { new: true }).then(profile => {
        res.status(200).send({ username: profile.username, email: profile.email });
    }).catch(err => {
        res.status(500).send({ error: 'Error updating email' });
    });
}

// function getEmail(req, res) {
//     res.status(200).send({ message: 'Email retrieved (stub)', user: req.params.user || 'current user' });
// }

// function updateEmail(req, res) {
//     res.status(200).send({ message: 'Email updated (stub)' });
// }

function getZipcode(req, res) {
    const username = req.params.user || req.user.username;
    Profile.findOne({ username }).then(profile => {
        if (profile) {
            res.status(200).send({ username: profile.username, zipcode: profile.zipcode });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    }).catch(err => {
        res.status(500).send({ error: 'Error retrieving zipcode' });
    });
}

// function getZipcode(req, res) {
//     res.status(200).send({ message: 'Zipcode retrieved (stub)', user: req.params.user || 'current user' });
// }

// function updateZipcode(req, res) {
//     res.status(200).send({ message: 'Zipcode updated (stub)' });
// }

function updateZipcode(req, res) {
    const { zipcode } = req.body;
    Profile.findOneAndUpdate({ username: req.user.username }, { zipcode }, { new: true }).then(profile => {
        res.status(200).send({ username: profile.username, zipcode: profile.zipcode });
    }).catch(err => {
        res.status(500).send({ error: 'Error updating zipcode' });
    });
}

function getDob(req, res) {
    const username = req.params.user || req.user.username;
    Profile.findOne({ username }).then(profile => {
        if (profile) {
            res.status(200).send({ username: profile.username, dob: profile.dob });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    }).catch(err => {
        res.status(500).send({ error: 'Error retrieving date of birth' });
    });
}

// function getDob(req, res) {
//     res.status(200).send({ message: 'Date of birth retrieved (stub)' });
// }

function getAvatar(req, res) {
    const username = req.params.user || req.user.username;
    Profile.findOne({ username }).then(profile => {
        if (profile) {
            res.status(200).send({ username: profile.username, avatar: profile.avatar });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    }).catch(err => {
        res.status(500).send({ error: 'Error retrieving avatar' });
    });
}

function uploadAvatar(req, res) {
    if (!req.fileurl) {
        return res.status(400).send({ error: 'No file uploaded' });
    }

    // Update the user's profile with the new avatar URL
    console.log('req.fileurl', req.fileurl);
    Profile.findOneAndUpdate(
        { username: req.user.username },
        { avatar: req.fileurl },
        { new: true }
    )
    .then(profile => {
        if (profile) {
            res.status(200).send({ avatar: profile.avatar });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    })
    .catch(err => {
        console.error('Error updating avatar:', err);
        res.status(500).send({ error: 'Error updating avatar' });
    });
}

// function getAvatar(req, res) {
//     res.status(200).send({ message: 'Avatar retrieved (stub)', user: req.params.user || 'current user' });
// }

// function updateAvatar(req, res) {
//     res.status(200).send({ message: 'Avatar updated (stub)' });
// }

function getPhone(req, res) {
    const username = req.params.user || req.user.username;
    Profile.findOne({ username }).then(profile => {
        if (profile) {
            res.status(200).send({ username: profile.username, phone: profile.phone });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    }).catch(err => {
        res.status(500).send({ error: 'Error retrieving phone number' });
    });
}

function updatePhone(req, res) {
    const { phone } = req.body;
    Profile.findOneAndUpdate({ username: req.user.username }, { phone }, { new: true }).then(profile => {
        res.status(200).send({ username: profile.username, phone: profile.phone });
    }).catch(err => {
        res.status(500).send({ error: 'Error updating phone number' });
    });
}

// function getPhone(req, res) {
//     res.status(200).send({ message: 'Phone number retrieved (stub)', user: req.params.user || 'current user' });
// }

// function updatePhone(req, res) {
//     res.status(200).send({ message: 'Phone number updated (stub)' });
// }

function getProfile(req, res) {
    const username = req.params.username;
    console.log(username);
    Profile.findOne({ username: username }).then(profile => {
        res.status(200).send(profile);
    }).catch(err => {
        res.status(500).send({ error: 'Error retrieving profile' });
    });
}

function updateProfile(req, res) {
    const { username, headline, email, phone, zipcode, avatar } = req.body;
    Profile.findOneAndUpdate({ username }, { headline, email, phone, zipcode, avatar }, { new: true }).then(profile => {
        res.status(200).send(profile);
    });
}

module.exports = (app) => {
    app.get('/profile/:username', isLoggedIn, getProfile);
    app.put('/profile', isLoggedIn, updateProfile);
    app.get('/headline/:user?', isLoggedIn, getHeadline);
    app.put('/headline', isLoggedIn, updateHeadline);
    app.get('/email/:user?', isLoggedIn, getEmail);
    app.put('/email', isLoggedIn, updateEmail);
    app.get('/zipcode/:user?', isLoggedIn, getZipcode);
    app.put('/zipcode', isLoggedIn, updateZipcode);
    app.get('/dob/:user?', isLoggedIn, getDob);
    app.get('/avatar/:user?', isLoggedIn, getAvatar);
    app.put('/avatar', uploadImage('avatar'), isLoggedIn, uploadAvatar);
    app.get('/phone/:user?', isLoggedIn, getPhone);
    app.put('/phone', isLoggedIn, updatePhone);
};

