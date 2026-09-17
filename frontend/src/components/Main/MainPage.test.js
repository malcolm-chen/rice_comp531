import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import MainView from './MainPage';


const mockUser = {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "Sincere@april.biz",
    address: {
        street: "Kulas Light",
        suite: "Apt. 556",
        city: "Gwenborough",
        zipcode: "92998-3874",
        geo: {
            "lat": "-37.3159",
            "lng": "81.1496"
        }
    },
    phone: "1-770-736-8031 x56442",
    website: "hildegard.org",
    company: {
        name: "Romaguera-Crona",
        catchPhrase: "Multi-layered client-server neural-net",
        bs: "harness real-time e-markets"
    },
    followings: [
        {
            id: 1,
            name: "Leanne Graham",
            image: "https://via.placeholder.com/50",
            company: {
                catchPhrase: "Multi-layered client-server neural-net"
            }
        },
        {
            id: 2,
            name: "Ervin Howell",
            image: "https://via.placeholder.com/50",
            company: {
                catchPhrase: "Proactive didactic contingency"
            }
        },
        {
            id: 3,
            name: "Clementine Bauch",
            image: "https://via.placeholder.com/50",
            company: {
                catchPhrase: "Face to face bifurcated interface"
            }
        }
    ]
}

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('MainView Component', () => {

    beforeEach(() => {
        render(
            <MemoryRouter initialEntries={[{ state: { user: mockUser } }]}>
                <MainView />
            </MemoryRouter>
        );

        global.URL.createObjectURL = jest.fn(() => 'mockedUrl');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch all articles for the current logged-in user', async () => {
        const articles = await screen.findAllByText(/Show Comment/i);
        expect(articles.length).toBe(30);
    });

    test('should fetch subset of articles for the current logged-in user given search keyword', async () => {
        fireEvent.change(screen.getByPlaceholderText('What are you looking for?'), { target: { value: 'sunt' } });
        const filteredArticles = await screen.findAllByText(/sunt/i);
        expect(filteredArticles.length).toBeGreaterThanOrEqual(1);
    });

    test('should add articles when adding a follower', async () => {
        const initialArticle = await screen.findAllByText(/Show Comment/i);
        const initialArticleCount = initialArticle.length;

        fireEvent.change(screen.getByPlaceholderText('Add new follower'), { target: { value: 'test' } });
        fireEvent.click(screen.getByText('Follow'));
        await waitFor(async () => {
            expect(screen.getByText('User not found. Please try again.')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('Add new follower'), { target: { value: 'Delphine' } });
        fireEvent.click(screen.getByText('Follow'));

        const updatedArticleCount = initialArticleCount + 10;

        await waitFor(async () => {
            const updatedArticles = await screen.findAllByText(/Show Comments/i); // Await the updated articles
            expect(updatedArticles.length).toBe(updatedArticleCount); // Assert the updated count
        });
    });

    test('should remove articles when removing a follower', async () => {
        const initialArticle = await screen.findAllByText(/Show Comments/i);
        const initialArticleCount = initialArticle.length;
        const unfollowButtons = screen.getAllByText('Unfollow', { selector: 'button' });
        fireEvent.click(unfollowButtons[0]); 

        const updatedArticleCount = initialArticleCount - 10;

        await waitFor(async () => {
            const updatedArticles = await screen.findAllByText(/Show Comments/i); // Await the updated articles
            expect(updatedArticles.length).toBe(updatedArticleCount); // Assert the updated count
        });
    });

    test('should log out a user (login state should be cleared', async () => {
        fireEvent.click(screen.getByRole('button', { name: /Log Out/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('should be able to post new articles', async () => {
        fireEvent.click(screen.getByText('Cancel'));

        fireEvent.change(screen.getByPlaceholderText('New article title'), { target: { value: 'test title' } });
        fireEvent.change(screen.getByPlaceholderText('New article body'), { target: { value: 'test body' } });
        const fileInput = screen.getByTestId('file-input');
        const file = new File(['1'], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        fireEvent.click(screen.getByText('Post'));

        await waitFor(async () => {
            const newArticle = await screen.findByText('test title');
            expect(newArticle).toBeInTheDocument();
        });
    });

    test('should be able to show/hide comments for an article', async () => {
        const showCommentsButton = await screen.findAllByText(/Show Comment/i);
        fireEvent.click(showCommentsButton[0]);

        await waitFor(async () => {
            let comments = await screen.findAllByTestId('comment');
            expect(comments.length).toBe(1);
        });

        const hideCommentsButton = screen.getByText('Hide Comments', { selector: 'button' });
        fireEvent.click(hideCommentsButton);
    });

    test('should be able to navigate to the profile page', async () => {
        fireEvent.click(screen.getByText('Profile Page'));
        expect(mockNavigate).toHaveBeenCalledWith('/profile', { state: { user: mockUser } });
    });

    /*let users, user, followings;
    beforeAll(async () => {
        // Fetch users once before running tests
        users = await fetch('https://jsonplaceholder.typicode.com/users').then(response => response.json());

        user = users.find(
            u => u.username === 'Bret' && u.address.street === 'Kulas Light'
        );

        followings = users.slice(0, 3).map(u => ({
            id: u.id,
            name: u.name,
            image: 'https://via.placeholder.com/50', // Placeholder image
            company: { catchPhrase: u.company.catchPhrase }
        }));

        user.followings = followings;
    });

    beforeEach(() => {
        render(
            <MemoryRouter initialEntries={[{ state: { user } }]}>
                <MainView />
            </MemoryRouter>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch all articles for current logged in user', async () => {
        const articles = screen.getAllByText(/Post/i);
        expect(articles.length).toBe(12); // Ensure 12 posts were loaded initially
    });

    test('should fetch subset of articles for current logged in user given search keyword', () => {
        fireEvent.change(screen.getByPlaceholderText('What are you looking for?'), { target: { value: 'Post 1' } });

        const filteredArticles = screen.getAllByText(/Post 1/i);
        expect(filteredArticles.length).toBeGreaterThanOrEqual(1); // Only "Post 1" and similar appear
    });

    test('should add articles when adding a follower', async () => {
        // Store initial article count
        const initialArticleCount = screen.getAllByText(/Post/i).length;

        fireEvent.change(screen.getByPlaceholderText('Add new follower'), { target: { value: 'Bob' } });
        fireEvent.click(screen.getByText('Follow'));

        // Fetch articles again (simulate increase)
        const updatedArticleCount = initialArticleCount + 5; // Assume new follower adds 5 posts
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(
                Array.from({ length: updatedArticleCount }, (_, i) => ({ id: i + 1, title: `Post ${i + 1}`, body: `Content ${i + 1}` }))
            )
        });
        
        await waitFor(() => expect(screen.getAllByText(/Post/i).length).toBe(updatedArticleCount));
    });

    test('should remove articles when removing a follower', async () => {
        const initialArticleCount = screen.getAllByText(/Post/i).length;

        // Simulate "Unfollow" action
        fireEvent.click(screen.getByText('Unfollow', { selector: 'button' }));

        // Mocking articles reduction (simulate decrease)
        const reducedArticleCount = initialArticleCount - 3; // Assume removing a follower decreases by 3 posts
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(
                Array.from({ length: reducedArticleCount }, (_, i) => ({ id: i + 1, title: `Post ${i + 1}`, body: `Content ${i + 1}` }))
            )
        });

        await waitFor(() => expect(screen.getAllByText(/Post/i).length).toBe(reducedArticleCount));
    });*/
});
