import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { CssBaseline, Box, Typography, FormControl, FormLabel, Input, Button, Sheet, IconButton } from '@mui/joy';
import InputFileUpload from '../fileUploadBtn';

const ProfilePage = () => {
    const location = useLocation();
    const { username, avatar, headline } = location.state;
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({});
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`https://jc316-ricebook-05f8969ba16c.herokuapp.com/profile/${username}`, { withCredentials: true });
                if (response.status === 200) {
                    console.log('fetching profile data', response.data);
                    setProfileData(response.data);
                } else {
                    console.error(response.error);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };
        fetchProfileData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value,
        });
    };

    const validateForm = () => {
        let formErrors = {};
        // If user did not enter password, indicate the password should be entered to confirm the user wants to change anything
        if (profileData.password == '') {
            console.log('password is empty');
            formErrors.password = 'Enter your password to confirm changes';
            return false;
        }

        const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!emailPattern.test(profileData.email)) {
            formErrors.email = 'Invalid email address';
        }

        const phonePattern = /^[0-9\s-]+$/;
        if (!phonePattern.test(profileData.phone) || profileData.phone.length < 10) {
            formErrors.phone = 'Invalid phone number (at least 10 digits required)';
        }

        if (profileData.zipcode.length !== 5 || isNaN(profileData.zipcode)) {
            formErrors.zipcode = 'Invalid ZIP code (5 digits required)';
        }

        // if (profileData.password.length < 1) {
        //     formErrors.password = 'Password cannot be empty';
        // }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const response = await axios.put('https://jc316-ricebook-05f8969ba16c.herokuapp.com/profile', { ...profileData }, { withCredentials: true });
            console.log(response.data);
            alert('Profile updated successfully!');
        }
    };


    const handleFileChange = async (e) => {
        console.log('File selected:', e.target.files[0]);
        const formData = new FormData();
        formData.append('image', e.target.files[0]);
        console.log('formData', formData);
        try {
            // send user's username to backend
            const response = await axios.put('https://jc316-ricebook-05f8969ba16c.herokuapp.com/avatar', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response.data);

            if (response.status === 200) {
                setProfileData({
                    ...profileData,
                    avatar: response.data.avatar,
                });
            } else {
                alert('Error uploading avatar!');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    };

    return (
        <div className='profile-page'>
            <IconButton className='back-btn' onClick={() => navigate('/main', { state: { user: username, avatar: avatar, headline: headline } })}><IoArrowBack style={{marginRight: '15px'}}></IoArrowBack> Back to Main</IconButton>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
                <CssBaseline />
                <Sheet
                        sx={{
                        width: 500,
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
                        <b>Profile</b>
                    </Typography>
                    {/* allow user to upload avatar */}
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', margin: '10px'}}>
                        <img src={profileData.avatar} alt="Profile" style={{width: '50px', height: '50px'}}/>
                        <InputFileUpload onChange={handleFileChange} />
                    </div>
                </div>
                    <FormControl>
                        <FormLabel>Username</FormLabel>
                        <Input
                            id="username"
                            type="text"
                            value={profileData.username}
                            name="username"
                            disabled
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.email && <p className="error" style={{ color: 'red' }}>{errors.email}</p>}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Phone</FormLabel>
                        <Input
                            id="phone"
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.phone && <p className="error" style={{ color: 'red' }}>{errors.phone}</p>}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Zipcode</FormLabel>
                        <Input
                            id="zipcode"
                            type="text"
                            name="zipcode"
                            value={profileData.zipcode}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.zipcode && <p className="error" style={{ color: 'red' }}>{errors.zipcode}</p>}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={profileData.password}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.password && <p className="error" style={{ color: 'red' }}>{errors.password}</p>}
                    </FormControl>
                    <Button type="submit" sx={{ mt: 1 }} onClick={handleUpdateProfile}>Update Profile</Button>
                </Sheet>
            </Box>
        </div>
    );
};

export default ProfilePage;
