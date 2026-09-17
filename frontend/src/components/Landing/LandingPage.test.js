import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));


describe('LandingPage Component', () => {

    beforeEach( async () => {

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([
                    {
                        "id": 1,
                        "name": "Leanne Graham",
                        "username": "Bret",
                        "email": "Sincere@april.biz",
                        "address": {
                        "street": "Kulas Light",
                        "suite": "Apt. 556",
                        "city": "Gwenborough",
                        "zipcode": "92998-3874",
                        "geo": {
                            "lat": "-37.3159",
                            "lng": "81.1496"
                        }
                        },
                        "phone": "1-770-736-8031 x56442",
                        "website": "hildegard.org",
                        "company": {
                        "name": "Romaguera-Crona",
                        "catchPhrase": "Multi-layered client-server neural-net",
                        "bs": "harness real-time e-markets"
                        }
                    }
                ])
            })
        );
        
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/']}>
                    <LandingPage />
                </MemoryRouter>
            );
        });
    })

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    test('should log in a previously registered user (not new users, login state should be set)', async () => {
        fireEvent.click(screen.getByText('Log In'));
        fireEvent.click(screen.getByText('Cancel'));
        fireEvent.click(screen.getByText('Log In'));

        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'Bret' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Kulas Light' } });

        fireEvent.click(screen.getByText('Submit Login'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/main', {"state": {"user": {"address": {"city": "Gwenborough", "geo": {"lat": "-37.3159", "lng": "81.1496"}, "street": "Kulas Light", "suite": "Apt. 556", "zipcode": "92998-3874"}, "company": {"bs": "harness real-time e-markets", "catchPhrase": "Multi-layered client-server neural-net", "name": "Romaguera-Crona"}, "email": "Sincere@april.biz", "followings": [{"company": {"catchPhrase": "Multi-layered client-server neural-net"}, "id": 1, "image": "https://via.placeholder.com/50", "name": "Leanne Graham"}], "id": 1, "name": "Leanne Graham", "phone": "1-770-736-8031 x56442", "username": "Bret", "website": "hildegard.org"}}});
        });
    });

    test('should log in a registered user (new users, login state should be set)', async () => {
        fireEvent.click(screen.getByText('Register'));
        fireEvent.click(screen.getByText('Cancel'));
        fireEvent.click(screen.getByText('Register'));

        fireEvent.change(screen.getByPlaceholderText('Enter your username here'), { target: { value: 'testUser' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your password here'), { target: { value: 'testPassword' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'testPassword' } });
        fireEvent.change(screen.getByPlaceholderText('Enter phone number (10 digits)'), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your zip Code (5 digits)'), { target: { value: '12345' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: '123@test.com' } });

        fireEvent.click(screen.getByText('Register'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/main', {"state": {"user": {"email": "123@test.com", "followings": [], "phone": "1234567890", "username": "testUser", "zipcode": "12345"}}});
        });
    });

    test('should not log in an invalid user (error state should be set)', () => {
        fireEvent.click(screen.getByText('Log In'));

        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'invalidUser' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongPassword' } });

        fireEvent.click(screen.getByText('Submit Login'));

        expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });

    test('should not register an user who is existed, or enters unformatted information user', () => {
        fireEvent.click(screen.getByText('Register'));

        fireEvent.change(screen.getByPlaceholderText('Enter your username here'), { target: { value: 'Bret' } });
        
        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('All fields are required.')).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText('Enter your password here'), { target: { value: 'testPassword' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'testPassword' } });
        fireEvent.change(screen.getByPlaceholderText('Enter phone number (10 digits)'), { target: { value: '123456780' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your zip Code (5 digits)'), { target: { value: '1234' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: '1234' } });

        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('Please enter a valid phone number (10 digits).')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Enter phone number (10 digits)'), { target: { value: '1234567890' } });
        
        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('Please enter a valid zip code (5 digits).')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Enter your zip Code (5 digits)'), { target: { value: '12345' } });
        
        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: '1234@test.com' } });
        
        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('Username already exists. Please choose another.')).toBeInTheDocument();
    })

    /*test('should log out a user (login state should be cleared)', async () => {
        fireEvent.click(screen.getByText('Log In'));
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'Bret' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Kulas Light' } });
        fireEvent.click(screen.getByText('Submit Login'));

        await waitFor(() => {
            fireEvent.click(screen.getByText('Log Out'));
            
        });
    });*/

});
