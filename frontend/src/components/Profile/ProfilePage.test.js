import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './ProfilePage';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('ProfilePage Component', () => {
    const mockUser = {
        username: 'testUser',
        email: 'testuser@example.com',
        phone: '1234567890',
        address: { street: '123 Main St', city: 'Anytown', zipcode: '12345' }
    };

    beforeEach(() => {
        render(
            <MemoryRouter initialEntries={[{ state: { user: mockUser } }]}>
                <ProfilePage />
            </MemoryRouter>
        );
    });

    beforeAll(() => {
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        global.URL.createObjectURL = jest.fn(() => 'mockedUrl');
    });
    
    afterAll(() => {
        window.alert.mockRestore();
    });

    test('should fetch and display the logged-in user\'s profile username', () => {
        const usernameInput = screen.getByLabelText(/Username:/i);
        expect(usernameInput).toHaveValue(mockUser.username);
    });

    test('should validate new information', () => {
        const emailInput = screen.getByLabelText(/Email:/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const phoneInput = screen.getByLabelText(/Phone:/i);
        fireEvent.change(phoneInput, { target: { value: '123' } });

        const zipcodeInput = screen.getByLabelText(/Zipcode:/i);
        fireEvent.change(zipcodeInput, { target: { value: '1234' } });

        const passwordInput = screen.getByLabelText(/Password:/i);
        fireEvent.change(passwordInput, { target: { value: '' } });

        const updateButton = screen.getByRole('button', { name: /Update Profile/i });
        fireEvent.click(updateButton);

        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/Invalid phone number/i)).toBeInTheDocument();
        expect(screen.getByText(/Invalid ZIP code/i)).toBeInTheDocument();
        expect(screen.getByText(/Password cannot be empty/i)).toBeInTheDocument();
    });

    test('should alert the user when the profile is updated successfully', () => {
        const emailInput = screen.getByLabelText(/Email:/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

        const phoneInput = screen.getByLabelText(/Phone:/i);
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });

        const zipcodeInput = screen.getByLabelText(/Zipcode:/i);
        fireEvent.change(zipcodeInput, { target: { value: '12345' } });

        const passwordInput = screen.getByLabelText(/Password:/i);
        fireEvent.change(passwordInput, { target: { value: '12345' } });

        const updateButton = screen.getByRole('button', { name: /Update Profile/i });
        fireEvent.click(updateButton);

        expect(window.alert).toHaveBeenCalledWith('Profile updated successfully (changes are temporary)');
    });

    test('should display the profile picture and update it when a new file is selected', () => {
        const profileImg = screen.getByAltText(/Profile/i);
        expect(profileImg).toHaveAttribute('src', 'https://i.iheart.com/v3/catalog/artist/33221?ops=fit(720%2C720)');

        const fileInput = screen.getByTestId('file-input');
        const file = new File(['1'], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(profileImg.src).not.toBe('https://i.iheart.com/v3/catalog/artist/33221?ops=fit(720%2C720)');
    });

    test('should navigate back to main page on "Back to Main" button click', async () => {
        const backButton = screen.getByRole('button', { name: /Back to Main/i });
        fireEvent.click(backButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/main', { state: { user: mockUser } });
        });
    });
});
