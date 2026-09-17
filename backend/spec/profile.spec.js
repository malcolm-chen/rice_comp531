const request = require('supertest');
const app = require('../index');

let cookie;

beforeAll((done) => {
    request(app)
        .post('/login')
        .send({ username: 'Bret', password: 'Kulas Light' })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            cookie = res.headers['set-cookie'];
            done();
        });
});

describe('GET /headline/:user?', () => {
    it('should return the headline', (done) => {
        request(app)
            .get('/headline/Bret')
            .set('Cookie', cookie)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.username).toBe('Bret');
                expect(res.body.headline).toBeDefined();
                done();
            });
    });
});

describe('PUT /headline', () => {
    it('should update the headline', (done) => {
        request(app)
            .put('/headline')
            .set('Cookie', cookie)
            .send({ headline: 'New Headline' })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.headline).toBe('New Headline');
                done();
            });
    });
});