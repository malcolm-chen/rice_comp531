import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import {Input, Card, CardContent, CardOverflow, AspectRatio, Typography, Textarea, Divider, IconButton, Button} from '@mui/joy'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios';
import InputFileUpload from '../fileUploadBtn';
import queryString from 'query-string';

const MockComments = () => [
    { id: 1, text: "Great article, thanks for sharing!" },
    { id: 2, text: "I found this very informative." },
    { id: 3, text: "Interesting perspective!" }
];

const MainView = () => {
    const [articles, setArticles] = useState([]);
    const [newArticle, setNewArticle] = useState({ title: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    // const [user, setUser] = useState({});
    const [followings, setFollowings] = useState([]);
    const [statusHeadline, setStatusHeadline] = useState('');
    const [newFollowing, setNewFollowing] = useState('');
    const navigate = useNavigate();

    const location = useLocation();
    const [user, setUser] = useState('');
    const [showComments, setShowComments] = useState({});
    const [uploadPicture, setUploadPicture] = useState(); 
    const [errorMessage, setErrorMessage] = useState('');
    const [avatar, setAvatar] = useState('');
    const [showEdit, setShowEdit] = useState({});
    const [editedArticle, setEditedArticle] = useState({});
    const [newComment, setNewComment] = useState({});
    const [headline, setHeadline] = useState('');
    const [isThirdParty, setIsThirdParty] = useState(false);
    const [image, setImage] = useState('');

    useEffect(() => {
        const queryParams = queryString.parse(location.search);

        // Set user, avatar, and headline from query parameters if available
        if (queryParams.username) {
            setUser(queryParams.username);
            setIsThirdParty(true);
        } else {
            setUser(location.state.user);
            setIsThirdParty(false);
        }
        if (queryParams.avatar) {
            setAvatar(queryParams.avatar);
        } else {
            setAvatar(location.state.avatar);
        }
        if (queryParams.headline) {
            setHeadline(queryParams.headline);
        } else {
            setHeadline(location.state.headline);
        }
        // If avatar is not set from query params, use the default avatar URL
        if (!queryParams.avatar && avatar === '') {
            setAvatar(`https://avatar.iran.liara.run/username?username=${user}`);
        }
    }, []);

    const updateFollowingsArticles = async () => {
        try {
            const allNewArticles = [];
            
            for (const following of followings) {
                const response = await axios.get(`https://jc316-ricebook-05f8969ba16c.herokuapp.com/articles/${following.userid}`, { withCredentials: true });

                const newArticles = response.data.articles.filter(article => 
                    !articles.some(a => a.pid === article.pid)
                );

                allNewArticles.push(...newArticles);
            }
            // Add new articles to articles array
            setArticles(prevArticles => {
                const updatedArticles = [...prevArticles, ...allNewArticles];
                console.log(updatedArticles);
                // For all the updated articles, remove the ones that are not in the current following or not the user's own articles
                const filteredArticles = [];
                for (const article of updatedArticles) {
                    if (article.author == user || followings.some(f => f.userid === article.userid)) {
                        filteredArticles.push(article);
                    }
                }
                return filteredArticles;
            });

        } catch (error) {
            console.error('Error fetching following articles:', error);
        }
    };

    useEffect(() => {
        if (followings.length > 0) {
            console.log(followings);
            console.log('updating followings articles');
            updateFollowingsArticles();
        }
    }, [followings]);

    useEffect(() => {
        console.log('fetching user, articles, and following', user);
        const fetchUser = async () => {
            const response = await axios.get(`https://jc316-ricebook-05f8969ba16c.herokuapp.com/profile/${user}`, { withCredentials: true });
            if (response.status === 200) {
                console.log('fetching user profile', response.data);
                if (response.data.avatar) {
                    setAvatar(response.data.avatar);
                    fetchArticles();
                    fetchFollowing();
                } else {
                    setAvatar(`https://avatar.iran.liara.run/username?username=${user}`);
                }
            }
        };
        const fetchArticles = async () => {
            try {
                const response = await axios.get('https://jc316-ricebook-05f8969ba16c.herokuapp.com/articles', { withCredentials: true });            
                if (response.status === 200) {
                    if (response.data.articles) {
                        console.log('fetching articles', response.data.articles);
                        setArticles(response.data.articles.map(article => ({
                            ...article,
                            title: article.title,
                            text: article.text,
                            author: article.author,
                            image: article.image,
                            comments: article.comments
                        })));
                    } else {
                        setArticles([]);
                    }
                } else {
                    console.error(response.error);
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        const fetchFollowing = async () => {
            try {
                const response = await axios.get('https://jc316-ricebook-05f8969ba16c.herokuapp.com/following', { withCredentials: true });
                if (response.status === 200) {
                    if (response.data.following) {
                        setFollowings(response.data.following);
                    } else {
                        setFollowings([]);
                    }
                } else {
                    console.error(response.error);
                }
            } catch (error) {
                console.error('Error fetching following:', error);
            }
        };
        if (user) {
            fetchUser();
        }
    }, [user]);


    const handlePostNewArticle = async () => {
        if (newArticle.title || newArticle.text || newArticle.image) { 
            const formData = new FormData();
            formData.append('title', newArticle.title);
            formData.append('text', newArticle.text);
            formData.append('image', uploadPicture); // Append the image file directly
            try {
                const response = await axios.post('https://jc316-ricebook-05f8969ba16c.herokuapp.com/article', formData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data
                    },
                });
                if (response.status === 201) {
                    setArticles([response.data.article, ...articles]);
                    setNewArticle({ title: '', text: '', image: '' });
                    setUploadPicture(null);
                } else {
                    console.error(response.error);
                }
            } catch (error) {
                console.error('Error posting new article:', error);
            }
        }
    };

    const handleCancelNewArticle = () => {
        setNewArticle({ title: '', text: '', image: '' });
    };

    const handleAddFollowing = async () => {
        try{
            const response = await axios.put(`https://jc316-ricebook-05f8969ba16c.herokuapp.com/following`, { userToFollow: newFollowing }, { withCredentials: true });
            if (response.status === 200) {
                setFollowings(response.data.following);
                setNewFollowing('');
            } else {
                setErrorMessage(response.error);
            }
        } catch (error) {
            console.error('Error adding follower:', error);
        }
    };

    const handleUnfollow = async (userId) => {
        try{
            const userToUnfollow = followings.find(following => following.userid === userId);
            const response = await axios.delete(`https://jc316-ricebook-05f8969ba16c.herokuapp.com/following`,
                { data: { userToUnfollow }, withCredentials: true });
            if (response.status === 200) {
                console.log(response.data.following);
                setFollowings(response.data.following);
            } else {
                setErrorMessage(response.error);
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewArticle({ ...newArticle, image: URL.createObjectURL(file) });
            setUploadPicture(file);
        }
    };

    const filteredArticles = articles.filter((article) => {
        if (!article) return false; // Skip undefined articles
        const title = article.title || ''; // Default to an empty string if undefined
        const text = article.text || '';   // Default to an empty string if undefined
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               text.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const toggleEdit = (articleId) => {
       // If showEdit is true, send the article to the server, and then set showEdit to false
       // Otherwise, set showEdit to true
       if (showEdit[articleId]) {
        handleSaveArticle(articleId);
       } else {
        setShowEdit((prevShowEdit) => ({
            ...prevShowEdit,
            [articleId]: true
        }));
        setEditedArticle((prevEditedArticle) => ({
            ...prevEditedArticle,
            [articleId]: articles.find(article => article.pid === articleId).text
        }));
       }
    };

    const handleSaveArticle = async (articleId) => {
        // Send the article to the server, and then set showEdit to false
        try{
            const response = await axios.put(
                `https://jc316-ricebook-05f8969ba16c.herokuapp.com/article/${articleId}`,
                { 
                    text: editedArticle[articleId],
                    comments: [...articles.find(article => article.pid === articleId).comments]
                },
                { withCredentials: true }
            );
            if (response.status === 200) {
                setArticles((prevArticles) => {
                    const updatedArticles = prevArticles.map((article) =>
                        article.pid === articleId ? { ...article, text: editedArticle[articleId] } : article
                    );
                    return updatedArticles;
                });
            } else {
                console.error(response.error);
            }
        } catch (error) {
            console.error('Error saving article:', error);
        }
        setShowEdit((prevShowEdit) => ({
            ...prevShowEdit,
            [articleId]: false
        }));
    };

    const handleSubmitComment = async (articleId) => {
        try {
            const response = await axios.put(
                 
                `https://jc316-ricebook-05f8969ba16c.herokuapp.com/article/${articleId}`,
                { 
                    text: articles.find(article => article.pid === articleId).text,
                    comments: [...articles.find(article => article.pid === articleId).comments, { commenter: user, text: newComment[articleId] }]
                },
                { withCredentials: true }
            );
            if (response.status === 200) {
                setArticles((prevArticles) => {
                    const updatedArticles = prevArticles.map((article) =>
                        article.pid === articleId ? { ...article, comments: [...article.comments, { commenter: user, text: newComment[articleId] }] } : article
                    );
                    return updatedArticles;
                });
            }
        } catch (error) {
            console.error('Error updating article:', error);
        }

        setNewComment({ ...newComment, [articleId]: '' });
    };

    return (
        <div className='main-page'>
        <div id="header">
            <div id='user-box'>
                <div id='user-greet'>
                    <h1>Welcome, {user}</h1>
                    <div id='user-btns' style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row'}}>
                        <button onClick={() => navigate('/profile', { state: { username: user, avatar: avatar, headline: headline } })}><i className="fa-solid fa-user"></i>  Profile Page</button>
                        <button onClick={() => navigate('/')}><i className="fa-solid fa-right-from-bracket"></i> Log Out</button>
                    </div>
                </div>
                <div id='user-info'>
                    <img src={avatar} alt="Profile" style={{width: '50px', height: '50px'}}/>
                    <p>Status: {headline}</p>
                    <button onClick={() => setHeadline(prompt('Update your status:', headline))}>
                        <i className="fa-solid fa-pen-nib"></i>  Update Status
                    </button>
                </div>
            </div>
            <div id="search-article">
                <IconButton><i className="fa-solid fa-magnifying-glass" style={{color: '#455EB5', marginRight: '10px'}}></i></IconButton>
                <Input
                    id="search"
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{width: '100%'}}
                />
            </div>
            <img className="background-img" src="./imgs/background.jpg"></img>
        </div>

        <div className='content'>
            <div id="aside-container">
                <div id='following-box'>
                    <h2>Following</h2>
                    <Input
                        type="text"
                        value={newFollowing}
                        onChange={(e) => setNewFollowing(e.target.value)}
                        placeholder="Add new follower"
                    />
                    {errorMessage && (
                        <div className="error-message">
                            {errorMessage}
                        </div>
                    )}
                    <Button variant='solid' onClick={handleAddFollowing} style={{margin: '10px'}}>Follow</Button>
                    <div id="followings">
                    {followings.length > 0 ? (
                        followings.map((following, index) => (
                            <div className="following" key={`${following.userid}-${following.username}`}>
                                <img src={following.avatar} alt="Following" style={{width: '50px', height: '50px'}}/>
                                <h3>{following.username}</h3>
                                <p style={{fontSize: '12px'}}>{following.headline}</p>
                                <Button variant='soft' onClick={() => handleUnfollow(following.userid)}>Unfollow</Button>
                            </div>
                        ))
                        ) : (
                            <p>Not following anyone.</p>
                        )}
                    </div>
                </div>
                
            </div>
            <div id="main-container">
                <div className="section">
                    <Card className="post">
                        <h2>Create a New Article</h2>
                            <Input
                            className="article-title"
                            placeholder="New article title"
                            value={newArticle.title}
                            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                        />
                        <Textarea
                            className="article-text"
                            placeholder="New article text"
                            value={newArticle.text}
                            onChange={(e) => setNewArticle({ ...newArticle, text: e.target.value })}
                            style= {{height: '100px'}}
                        />
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                            {/* if use uploads an image, set the image to newArticle.image, and display the image in this card for preview */}
                            {newArticle.image && <img src={newArticle.image} alt="New Article" style={{width: '100px', height: '100px'}}/>}
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>   
                                <InputFileUpload onChange={handleFileChange} />
                                <Button variant='solid' onClick={handlePostNewArticle} style={{margin: '10px'}}>Post</Button>
                                <Button variant='solid' onClick={handleCancelNewArticle} style={{margin: '10px'}}>Cancel</Button>
                            </div>
                        </div>
                    </Card>
                    {filteredArticles.map((article) => (
                        <Card className="post" data-testid="post" key={`${article.pid}-${article.author}`}>
                            {article.image.length > 0 && article.image[0] !== '' && <CardOverflow>
                                <AspectRatio ratio="2">
                                    <img
                                        src={article.image}
                                        loading="lazy"
                                        alt=""
                                    />
                                </AspectRatio>
                            </CardOverflow>}
                            <CardContent>
                                <Typography level="title-md">{article.title}</Typography>
                                <Typography level="body-sm">Post by <span>{article.author}</span></Typography>
                                {article.author === user && (
                                    <div className="edit-box">
                                        <IconButton onClick={() => toggleEdit(article.pid)}>
                                        <i className="fa-solid fa-pen-to-square" style={{color: '#455EB5', marginRight: '15px'}}></i>
                                        {showEdit[article.pid] ? 'Save' : 'Edit'}
                                    </IconButton> 
                                    {showEdit[article.pid] ? ( // Check if the current article is in edit mode
                                        <Textarea 
                                            value={editedArticle[article.pid]} 
                                            onChange={(e) => setEditedArticle({ ...editedArticle, [article.pid]: e.target.value })}
                                        />
                                    ) : (
                                        <p>{article.text}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                            
                            <Divider />

                            {/* If i use newcomment as value, every textarea will be the same, I need to use a different key for each textarea */}
                            <div className="comment-box" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                                <Textarea 
                                    key={article.pid}
                                    value={newComment[article.pid]}
                                    onChange={(e) => setNewComment({ ...newComment, [article.pid]: e.target.value })}
                                />
                                <IconButton onClick={() => handleSubmitComment(article.pid)}><i className="fa-solid fa-comment" style={{color: '#455EB5', marginRight: '15px'}}></i> Comment</IconButton>
                            </div>
                            {article.comments.length > 0 && (
                                <div className="comments-container" style={{display: 'flex', flexDirection: 'column', backgroundColor: '#F5F5F5', padding: '10px'}}>
                                    {article.comments.map((comment) => 
                                        <div className="comment" key={`${comment.commenter}-${comment.text}`}>
                                            <p style={{fontSize: '18px'}}>{comment.text}</p>
                                            <p style={{fontSize: '12px'}}>Comment by {comment.commenter}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
        
        </div>
    );
};

export default MainView;
