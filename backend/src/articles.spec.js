const request = require('supertest');
const app = require('../index');

let cookie; // Variable to store the session cookie

beforeAll((done) => {
    request(app)
        .post('/login')
        .send({ username: 'Bret', password: 'Kulas Light' })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            cookie = res.headers['set-cookie']; // Capture the session cookie from the response
            done();
        });
});

describe('GET /articles/:id?', () => {
    it('should return all articles', (done) => {
        request(app)
            .get('/articles')
            .set('Cookie', cookie) // Set the session cookie in the header
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).toBeInstanceOf(Array);
                done();
            });
    });
});

describe('PUT /articles/:id', () => {
    it('should update an article', (done) => {
        request(app)
            .put('/articles/1')
            .set('Cookie', cookie) // Set the session cookie in the header
            .send({ title: 'Updated Title', content: 'Updated Content' })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.title).toBe('Updated Title');
                done();
            });
    });
});

describe('POST /article', () => {
    it('should post an article', (done) => {
        request(app)
            .post('/article')
            .set('Cookie', cookie) // Set the session cookie in the header
            .send({
                title: 'Test Article',
                content: 'This is a test article'
            })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.title).toBe('Test Article');
                done();
            });
    });
});

