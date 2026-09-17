import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useColorScheme } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import CssBaseline from '@mui/joy/CssBaseline';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import axios from 'axios';

const LandingPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('https://jc316-ricebook-05f8969ba16c.herokuapp.com/login', {
                username,
                password
            }, { withCredentials: true });

            if (response.data.message === 'Login successful') {
                console.log(response.data);
                navigate('/main', { state: { user: username, avatar: response.data.avatar, headline: response.data.headline, isThirdParty: false } });
            }
        } catch (error) {
            setError(error.response.data.error);
            setTimeout(() => {
                setError('');
            }, 3000);
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        const validationError = validateRegistration();
        if (validationError) {
            setError(validationError);
            setTimeout(() => {
                setError('');
            }, 3000);
            return;
        } 
        try {
            const response = await axios.post('https://jc316-ricebook-05f8969ba16c.herokuapp.com/register', {
                username,
                password,
                email,
                phone,
                zipcode,
            }, { withCredentials: true });
            console.log(response.data);
            if (response.data.message === 'success') {
                console.log('success');
                // back to login page, show success message
                setError('Registration successful! Please login.');
                setTimeout(() => {
                    setError('');
                }, 3000);
                setIsRegistering(false);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                // Error message should appear for 3 seconds
                setError(error.response.data.error); 
                setTimeout(() => {
                    setError('');
                }, 3000);
            } else {
                console.error('Error registering:', error);
                setError('An unexpected error occurred. Please try again.');
                setTimeout(() => {
                    setError('');
                }, 3000);
            }
        }
        
    };

    const validateRegistration = () => {
        if (!username || !password || !confirm_password || !phone || !zipcode || !email) {
            return 'All fields are required.';
        }
        if (password !== confirm_password) {
            return 'Passwords do not match.';
        }
        if (!/^\d{10}$/.test(phone)) {
            return 'Please enter a valid phone number (10 digits).';
        }
        if (!/^\d{5}$/.test(zipcode)) {
            return 'Please enter a valid zip code (5 digits).';
        }
        if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            return 'Please enter a valid email address.';
        }
        return '';
    };

    const handleGoogleLogin = async () => {
        window.location.href = 'https://jc316-ricebook-05f8969ba16c.herokuapp.com/auth/google';
    };

    return (
        <div className="landing-page">
            <h1>Welcome to BondWave</h1>
            <img className="background-img" src="./imgs/background.jpg" alt="Background" />
            {!isRegistering && (
                <Box>
                    <CssBaseline />
                    <Sheet
                        sx={{
                        width: 300,
                        mx: 'auto', // margin left & right
                        my: 4, // margin top & bottom
                        py: 3, // padding top & bottom
                        px: 2, // padding left & right
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderRadius: 'sm',
                        boxShadow: 'md',
                        }}
                        variant="outlined"
                    >
                        <div>
                        <Typography level="h4" component="h1">
                            <b>Welcome!</b>
                        </Typography>
                        <Typography level="body-sm">Sign in to continue.</Typography>
                        </div>
                        <FormControl>
                        <FormLabel>Username</FormLabel>
                        <Input
                            name="username"
                            type="username"
                            placeholder="Enter your username"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        </FormControl>
                        <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            // html input attribute
                            name="password"
                            type="password"
                            placeholder="password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        </FormControl>
                        {error && <p className="error" style={{ color: '#E89292' }}>{error}</p>}
                        <Button sx={{ mt: 1 /* margin top */ }} onClick={handleLogin}>Log in</Button>
                        <Typography
                        endDecorator={<Button variant="outlined" size="sm" onClick={(e) => setIsRegistering(true)}>Sign up</Button>}
                        sx={{ fontSize: 'sm', alignSelf: 'center' }}
                        >
                        Don&apos;t have an account?
                        </Typography>
                        <Typography level="body-sm" sx={{ fontSize: 'sm', alignSelf: 'center' }}>
                            <Button variant="soft" color="neutral" size="sm" onClick={(e) => handleGoogleLogin()}>Sign in with Google</Button>
                        </Typography>
                    </Sheet>
                </Box>
            )}
            {isRegistering && (
                <Box>
                    <CssBaseline />
                    <Sheet
                        sx={{
                        width: 400,
                        mx: 'auto', // margin left & right
                        my: 4, // margin top & bottom
                        py: 3, // padding top & bottom
                        px: 2, // padding left & right
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderRadius: 'sm',
                        boxShadow: 'md',
                        }}
                        variant="outlined"
                    >
                        <div>
                        <Typography level="h4" component="h1">
                            <b>Welcome!</b>
                        </Typography>
                        <Typography level="body-sm">Register new account.</Typography>
                        </div>
                        <FormControl>
                        <FormLabel>Username</FormLabel>
                        <Input
                            name="username"
                            type="username"
                            placeholder="Enter your username"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        </FormControl>
                        <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            // html input attribute
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        </FormControl>
                        <FormControl>
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                            // html input attribute
                            name="confirm_password"
                            type="password"
                            placeholder="Confirm your password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        </FormControl>
                        <FormControl>
                        <FormLabel>Phone</FormLabel>
                        <Input
                            // html input attribute
                            name="phone"
                            type="phone"
                            placeholder="Enter your phone number"
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        </FormControl>
                        <FormControl>
                        <FormLabel>Zip Code</FormLabel>
                        <Input
                            name="zipcode"
                            type="zipcode"
                            placeholder="Enter your zip code"
                            onChange={(e) => setZipcode(e.target.value)}
                            required
                        />
                        </FormControl>
                        <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        </FormControl>
                        {error && <p className="error" style={{ color: '#E89292' }}>{error}</p>}
                        <Button sx={{ mt: 1 /* margin top */ }} onClick={handleRegister}>Register</Button>
                    </Sheet>
                    <Button onClick={() => setIsRegistering(false)}>Cancel</Button>
                </Box>
            //     <form className="register-form" onSubmit={handleRegister}>
            //     <label>Username</label>
            //     <input
            //         type="text"
            //         placeholder="Enter your username here"
            //         value={username}
            //         onChange={(e) => setUsername(e.target.value)}
            //         required
            //     /> <br />
            //     <label>Password</label>
            //     <input
            //         type="password"
            //         placeholder="Enter your password here"
            //         value={password}
            //         onChange={(e) => setPassword(e.target.value)}
            //         required
            //     /> <br />
            //     <label>Confirm Password</label>
            //     <input
            //         type="password"
            //         placeholder="Confirm your password"
            //         value={confirm_password}
            //         onChange={(e) => setConfirmPassword(e.target.value)}
            //         required
            //     /> <br />
            //     <label>Phone</label>
            //     <input
            //         type="text"
            //         placeholder="Enter phone number (10 digits)"
            //         value={phone}
            //         onChange={(e) => setPhone(e.target.value)}
            //         required
            //     /> <br />
            //     <label>Zip Code</label>
            //     <input
            //         type="text"
            //         placeholder="Enter your zip Code (5 digits)"
            //         value={zipcode}
            //         onChange={(e) => setZipcode(e.target.value)}
            //         required
            //     /> <br />
            //     <label>Email</label>
            //     <input
            //         type="email"
            //         placeholder="Enter your email"
            //         value={email}
            //         onChange={(e) => setEmail(e.target.value)}
            //         required
            //     />
            //     <div className='login-btns'>
            //         <button type="submit">Register</button>
            //         <button type="button" onClick={() => setIsRegistering(false)}>Cancel</button>
            //     </div>
            // </form>
        )}
        </div>
    );
};

export default LandingPage;
