# QuirkyRoomie - Backend

This is the backend of QuirkyRoomie, a flatmate conflict management system built using Node.js, Express, and MongoDB.

## 🌍 API Base URL
[Backend Deployed on Render](https://quirkyroomie-backend.onrender.com)

## 📦 Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

## 📑 Features
- Secure authentication (JWT)
- CRUD for complaints
- Voting & leaderboard logic
- Punishment system based on votes

## 🛠️ Installation & Setup
Install dependencies:
- npm install
## Create a .env file:
- MONGO_URI=your-mongodb-connection-string

## Run the server:
npm start

## API Endpoints (Method	Endpoint	Description)
- POST	/api/auth/register	       Register a new user
- POST	/api/auth/login	           Login & get JWT
- POST	/api/complaints	           File a complaint
- GET	/api/complaints	             Get all active complaints
- PUT	/api/complaints/{id}	       Resolve a complaint
- POST	/api/complaints/{id}/vote	 Upvote/downvote
