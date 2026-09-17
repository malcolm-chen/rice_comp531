# Rice COMP531 Web App

A social feed application (Ricebook) built for Rice COMP531. React frontend, Express + MongoDB backend.

```
frontend/   Create React App (port 3000)
backend/    Express API (port 5000)
```

## Prerequisites

- Node.js 18+ (developed on v22)
- A MongoDB database (MongoDB Atlas free tier works)
- A Cloudinary account — used for image uploads
- A Google Cloud OAuth 2.0 client — used for "Sign in with Google"

## 1. Install dependencies

Both packages install separately:

```bash
cd backend  && npm install
cd ../frontend && npm install
```

## 2. Configure credentials

No credentials are committed to this repo. Create `backend/.env` from the template:

```bash
cd backend
cp .env.example .env
```

Then fill in the values:

| Variable | Where to get it |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas → your cluster → **Connect** → **Drivers**. Format: `mongodb+srv://<user>:<password>@<cluster>/<db>` |
| `CLOUDINARY_URL` | Cloudinary dashboard → **API Environment variable**. Format: `cloudinary://<api_key>:<api_secret>@<cloud_name>` |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) → create an **OAuth 2.0 Client ID** (type: Web application) |
| `GOOGLE_CLIENT_SECRET` | Same OAuth client as above |
| `GOOGLE_CALLBACK_URL` | Leave as `/auth/google/callback` |
| `PORT` | Leave as `5000` |
| `NODE_ENV` | `development` for local work |

When creating the Google OAuth client, add this **Authorized redirect URI**, or the login will fail:

```
http://localhost:5000/auth/google/callback
```

The frontend needs no `.env`.

> `backend/.env` is gitignored. Keep it that way — it holds live secrets.

## 3. Seed the database

The app expects users and posts to exist. This script imports sample data from JSONPlaceholder:

```bash
cd backend
node importData.js
```

It creates 10 users. Each user's password is their JSONPlaceholder street name — for example:

| Username | Password |
| --- | --- |
| `Bret` | `Kulas Light` |

You can also register a new account from the landing page.

## 4. Run

Two terminals:

```bash
# terminal 1
cd backend && npm start      # http://localhost:5000

# terminal 2
cd frontend && npm start     # http://localhost:3000
```

### Pointing the frontend at your local backend

The API base URL is currently **hardcoded to a deployed Heroku instance**, so a fresh `npm start` talks to production (which may be offline). To run fully locally, replace `https://jc316-ricebook-05f8969ba16c.herokuapp.com` with `http://localhost:5000` in:

- `frontend/src/components/Landing/LandingPage.js`
- `frontend/src/components/Main/MainPage.js`
- `frontend/src/components/Profile/ProfilePage.js`

```bash
cd frontend
grep -rl 'jc316-ricebook-05f8969ba16c.herokuapp.com' src \
  | xargs sed -i '' 's|https://jc316-ricebook-05f8969ba16c.herokuapp.com|http://localhost:5000|g'
```

Also update the CORS origin in `backend/index.js` to match the local frontend, otherwise the browser will block every request:

```js
app.use(cors({
    origin: 'http://localhost:3000',   // was: https://ricebook-jc316.surge.sh
    ...
}));
```

## Tests

```bash
cd backend  && npm test      # Jasmine — API integration tests
cd frontend && npm test      # Jest + React Testing Library
```

The backend tests log in as `Bret`, so run the seed script first.

## Build for production

```bash
cd frontend && npm run build   # outputs to frontend/build/
```
