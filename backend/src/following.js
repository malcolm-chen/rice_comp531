const { Following } = require('./models');
const { isLoggedIn } = require('./auth');
const { User } = require('./models');

function getFollowing(req, res) {
    console.log('fetching following for user', req.user.username);
    Following.findOne({ username: req.user.username }).then(following => {
        res.status(200).send(following);
    }).catch(err => {
        res.status(200).send({ following: [] });
    });
}

function followUser(req, res) {
    const { userToFollow } = req.body;
    console.log(userToFollow);
    // find the user to follow
    User.findOne({ username: userToFollow }).then(user => {
        Following.findOneAndUpdate(
            { username: req.user.username },
            { $push: { following: { userid: user.userid, username: user.username, avatar: user.avatar, headline: user.headline } } },
            { new: true, upsert: true }
        ).then(following => {
            res.status(200).send(following);
        }).catch(err => {
            res.status(500).send({ error: 'Error following user' });
        });
    }).catch(err => {
        res.status(500).send({ error: 'Error finding user to follow' });
    });
}

function unfollowUser(req, res) {
    const { userToUnfollow } = req.body;
    Following.findOneAndUpdate(
        { username: req.user.username },
        { $pull: { following: { userid: userToUnfollow.userid, username: userToUnfollow.username, avatar: userToUnfollow.avatar, headline: userToUnfollow.headline } } },
        { new: true }
    ).then(following => {
        res.status(200).send(following);
    }).catch(err => {
        res.status(500).send({ error: 'Error unfollowing user' });
    });
}


// function getFollowing(req, res) {
//     res.status(200).send({ message: 'Following list retrieved (stub)', user: req.params.user || 'current user' });
// }

// function followUser(req, res) {
//     res.status(200).send({ message: 'User followed (stub)', user: req.params.user });
// }

// function unfollowUser(req, res) {
//     res.status(200).send({ message: 'User unfollowed (stub)', user: req.params.user });
// }

module.exports = (app) => {
    app.get('/following', isLoggedIn, getFollowing);
    app.put('/following', isLoggedIn, followUser);
    app.delete('/following', isLoggedIn, unfollowUser);
};