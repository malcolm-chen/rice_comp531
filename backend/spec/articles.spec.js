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

describe('GET /articles/:id?', () => {
    it('should return all articles', (done) => {
        request(app)
            .get('/articles')
            .set('Cookie', cookie)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.articles).toBeInstanceOf(Array);
                done();
            });
    });
});

describe('GET /articles/:id?', () => {
    it('should return one article', (done) => {
        request(app)
            .get('/articles/1')
            .set('Cookie', cookie)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.articles).toBeInstanceOf(Object);
                done();
            });
    });
});

describe('POST /article', () => {
    it('should post an article', (done) => {
        const newArticle = {
            title: 'Test Article',
            text: 'This is a test article'
        }; 
        request(app)
            .post('/article')
            .set('Cookie', cookie)
            .send(newArticle)
            .expect(201);
        done();
    });
});

