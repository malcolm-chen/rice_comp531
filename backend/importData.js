// n
const axios = require('axios');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { User, Profile, Article, Following } = require('./src/models');

async function importData() {
    try {
        // Connect to MongoDB
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);

        // Fetch users and posts from JSON Placeholder
        const [usersResponse, postsResponse] = await Promise.all([
            axios.get('https://jsonplaceholder.typicode.com/users'),
            axios.get('https://jsonplaceholder.typicode.com/posts')
        ]);

        const users = usersResponse.data;
        const posts = postsResponse.data;

        // add avatar to each user
        for (const user of users) {
            user.avatar = `https://avatar.iran.liara.run/public/boy?username=${user.username}`;
        }

        // Iterate over each user
        for (const user of users) {
            const { username, address } = user;
            const userid = user.id;
            const headline = user.company.catchPhrase;
            const password = address.street; // Use street name as password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            const avatar = `https://avatar.iran.liara.run/public/boy?username=${username}`;

            // Check if the user already exists
            const existingUser = await User.findOne({ username });
            if (!existingUser) {
                // Create and save User
                const newUser = new User({ username, avatar, userid, headline, salt, hash });
                await newUser.save();

                // Debugging: Log the users being considered for following
                const potentialFollowings = users.filter(u => u.id !== user.id);
                console.log(`Potential followings for ${username}:`, potentialFollowings.map(u => u.username));
                // add headline, avatar, userid to followingUsernames
                const followingUsernames = potentialFollowings
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(u => ({ username: u.username, avatar: u.avatar, userid: u.id, headline: u.company.catchPhrase }));

                console.log(`Selected followings for ${username}:`, followingUsernames);

                // Create and save Profile
                const newProfile = new Profile({
                    username,
                    headline: user.company.catchPhrase,
                    userid: user.id,
                    email: user.email,
                    zipcode: user.address.zipcode,
                    phone: user.phone,
                    avatar: avatar,
                    following: followingUsernames
                });

                const following = new Following({
                    username,
                    following: newProfile.following
                });
                await newProfile.save();
                await following.save();
            }

            // Filter and save posts for this user
            const userPosts = posts.filter(post => post.userId === user.id);
            for (const post of userPosts) {
                const newArticle = new Article({
                    pid: post.id,
                    userid: post.userId,
                    author: username,
                    text: post.body,
                    title: post.title,
                    date: new Date(),
                    image: `https://picsum.photos/id/${Math.floor(Math.random() * 100) + 1}/200/300`,
                    comments: []
                });
                await newArticle.save();
            }
        }

        console.log('Data imported successfully!');
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        mongoose.connection.close();
    }
}

importData();