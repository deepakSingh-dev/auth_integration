Features Implemented
- OAuth Authentication (Google & GitHub)
- JWT-based Authentication for API calls
- Session Management with NextAuth.js

Steps to Run 

Backend

- In backend directory run `npm install` This will install all the required packeges
- Start the backend server by runing `npm start`
- Setup `.env` File in `backend/.env`
```
MONGO_URI=
JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

CLIENT_URL=http://localhost:3000
```
Frontend

- In frontend directory run `npm install` This will install all the required packeges if this fails try `npm install --legacy-peer-deps`
- Start the frontend server by runing `npm run dev`
- Setup `.env.local` File in `fe/.env.local`
```
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=


NEXT_PUBLIC_API_URL=http://localhost:5000
```
