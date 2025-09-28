# PharmaLearn - Pharmacy Educational Game Platform

A comprehensive educational platform for pharmacy students featuring interactive games, progress tracking, and administrative tools.

## Features

### Student Features
- **Authentication**: Secure login/registration system
- **Dashboard**: Personal learning dashboard with progress overview
- **Quiz Game**: Interactive pharmacy knowledge quizzes
- **Flashcard Game**: Study flashcards for drug information
- **Progress Tracking**: Track learning progress and scores
- **Analytics**: View detailed performance analytics and score history

### Admin Features
- **Admin Dashboard**: Comprehensive overview of all students
- **Student Management**: View and manage student accounts
- **Question Management**: Add, edit, and organize quiz questions
- **Analytics**: View platform-wide statistics and student performance

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts for analytics
- **Authentication**: JWT-based auth system

### Backend (Separate API)
- **Location**: `/backend` folder
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **API**: RESTful endpoints

## Project Structure

\`\`\`
pharmalearn/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── student/           # Student dashboard and games
│   ├── admin/             # Admin dashboard
│   └── api/               # Next.js API routes (if needed)
├── components/            # Reusable React components
├── lib/                   # Utility functions
├── backend/               # Separate backend API
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── controllers/       # Route controllers
│   └── config/            # Database config
└── public/                # Static assets
\`\`\`

## Backend Setup Instructions

The backend is located in the `/backend` folder and needs to be configured separately:

### 1. Install Dependencies
\`\`\`bash
cd backend
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
\`\`\`

### 2. Environment Variables
Create a `.env` file in the backend folder:
\`\`\`
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
\`\`\`

### 3. Start Backend Server
\`\`\`bash
cd backend
npm start
\`\`\`

### 4. Frontend Configuration
Update the frontend API base URL in `/lib/api.ts` to point to your backend server (default: http://localhost:5000)

## Database Schema

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: String, // 'student' or 'admin'
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Questions Collection
\`\`\`javascript
{
  _id: ObjectId,
  question: String,
  options: [String],
  correctAnswer: Number,
  category: String,
  difficulty: String, // 'easy', 'medium', 'hard'
  createdAt: Date
}
\`\`\`

### Scores Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId,
  gameType: String, // 'quiz' or 'flashcard'
  score: Number,
  totalQuestions: Number,
  timeSpent: Number,
  createdAt: Date
}
\`\`\`

## Getting Started

1. Clone the repository
2. Install frontend dependencies: `npm install`
3. Set up the backend following the instructions above
4. Start the development server: `npm run dev`
5. Visit `http://localhost:3000`

## Default Admin Account

After setting up the backend, create an admin account through the registration form and manually update the role to 'admin' in the database.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
