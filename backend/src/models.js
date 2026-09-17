// models.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    avatar: { type: String, default: '' },
    userid: { type: Number, required: true },
    headline: { type: String, default: '' },
    salt: { type: String, required: false },
    hash: { type: String, required: false },
    isThirdParty: { type: Boolean, default: false },
});

const profileSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    headline: { type: String, default: 'New User' },
    email: { type: String, default: '' },
    zipcode: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    following: { type: [Object], default: [] }
});

const articleSchema = new mongoose.Schema({
    pid: { type: Number, required: true },
    userid: { type: Number, required: true },
    author: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    comments: { type: [Object], default: [] },
    image: { type: [String], default: [] }
});

const followingSchema = new mongoose.Schema({
    username: { type: String, required: true },
    following: { type: [Object], required: true }
});

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Article = mongoose.model('Article', articleSchema);
const Following = mongoose.model('Following', followingSchema);

module.exports = { User, Profile, Article, Following };
