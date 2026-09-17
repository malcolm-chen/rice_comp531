const request = require('supertest');
const app = require('../index');

let cookie; // Variable to store the session cookie

describe('POST /register', () => {
    it('should update the list of registered users', (done) => {
        request(app)
            .post('/register')
            .send({
                username: 'newuser',
                password: 'newpassword'
            })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.result).toBe('success');
                expect(res.body.username).toBe('newuser');
                done();
            });
    });
});

describe('POST /login', () => {
    it('should log in a user', (done) => {
        request(app)
            .post('/login')
            .send({ username: 'Bret', password: 'Kulas Light' })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                cookie = res.headers['set-cookie']; // Capture the session cookie
                done();
            });
    });
});

describe('PUT /logout', () => {
    beforeEach((done) => {
        // Ensure the user is logged in before testing logout
        request(app)
            .post('/login')
            .send({ username: 'Bret', password: 'Kulas Light' })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                cookie = res.headers['set-cookie']; // Capture the session cookie
                done();
            });
    });

    it('should log out a user', (done) => {
        request(app)
            .put('/logout')
            .set('Cookie', cookie) // Use the session cookie
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).toBe('Logged out successfully');
                done();
            });
    });
});