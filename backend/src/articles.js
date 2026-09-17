const { Article } = require('./models');
const { isLoggedIn } = require('./auth');
const uploadImage = require('./uploadCloudinary');

function getArticles(req, res) {
    const { id } = req.params;
    if (id) {
        Article.find({ userid: id }).then(articles => {
            // console.log(articles);
            res.status(200).send({ articles });
        }).catch(err => {
            res.status(500).send({ error: 'Error retrieving articles' });
        });
    } else {
        // if found, return articles, if cannot find, it means the user has no articles, so return empty array
        Article.find({ author: req.user.username }).then(articles => {
            res.status(200).send({ articles });
        }).catch(err => {
            res.status(200).send({ articles: [] });
        });
    }
}

function getArticle(req, res) {
    const { id } = req.params;

    // Validate the id
    if (!id) {
        return res.status(400).send({ error: 'Article ID is required' });
    }

    // Find the article by pid
    Article.findOne({ pid: id }).then(article => {
        if (!article) {
            return res.status(404).send({ error: 'Article not found' });
        }
        res.status(200).send({ article });
    }).catch(err => {
        console.error('Error retrieving article:', err); // Log the error
        res.status(500).send({ error: 'Error retrieving article' });
    });
}

function updateArticle(req, res) {
    const { id } = req.params;
    const { text, comments } = req.body;
    console.log(req.body);

    Article.findOne({ pid: id }).then(article => {
        article.text = text;
        article.comments = comments;
        console.log(article);
        article.save().then(updatedArticle => {
            res.status(200).send({ articles: [updatedArticle] });
        });
    }).catch(err => {
        res.status(500).send({ error: 'Error updating article' });
    });
}

function postArticle(req, res) {
    console.log(req.body);
    console.log(req.fileurl);
    const { title, text } = req.body;
    const image = req.fileurl; // Access the uploaded file

    // Check if the user is authenticated
    if (!req.user || !req.user.username) {
        return res.status(401).send({ error: 'Unauthorized: User not logged in' });
    }

    // Count the number of articles by the current user
    Article.countDocuments({ author: req.user.username })
        .then(count => {
            const pid = count + 1;

            const newArticle = new Article({
                author: req.user.username,
                userid: req.user.userid,
                title: title || '',
                text: text || '',
                pid,
                date: new Date(),
                comments: [],
                image: image ? image : '' // Save the file path or URL
            });

            return newArticle.save();
        })
        .then(article => {
            res.status(201).send({ article });
        })
        .catch(err => {
            console.error('Error posting article:', err);
            res.status(500).send({ error: 'Error posting article' });
        });
}

module.exports = (app) => {
    app.get('/articles/:id?', isLoggedIn, getArticles);
    app.put('/article/:id', isLoggedIn, updateArticle);
    app.post('/article', uploadImage('image'), isLoggedIn, postArticle);
};
