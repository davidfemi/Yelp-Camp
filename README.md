# The Campgrounds 🏕️

A full-stack application ecosystem for discovering and reviewing campgrounds around the world. Built with modern technologies and featuring user authentication, image uploads, interactive maps, and AI-enhanced descriptions. Available as both a web application and mobile app.

![The Campgrounds](yelpcamp-frontend/Yelpcamp.png)

## 🌐 Live Demo

**🚀 [Visit The Campgrounds](https://thecampground.vercel.app)**

- **Web App**: https://thecampground.vercel.app
- **Mobile App**: React Native (iOS/Android)
- **Backend API**: https://yelpcamp-vvv2.onrender.com

*Try creating an account and exploring campgrounds from around the world on web or mobile!*

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login system
- **Campground Management**: Create, edit, and delete campground listings
- **Review System**: Rate and review campgrounds with a 5-star system
- **Interactive Maps**: Powered by Mapbox for location visualization
- **Image Uploads**: Cloudinary integration for high-quality image management
- **AI Descriptions**: Enhanced campground descriptions using Google Gemini AI
- **Responsive Design**: Modern UI with Bootstrap 5 and React Bootstrap

### User Features
- Browse campgrounds with detailed information
- Search and filter campgrounds
- View campground locations on interactive maps
- Leave reviews and ratings
- Manage personal campground listings
- Secure user profiles and sessions
- Cross-platform experience (Web & Mobile)
- Native mobile features (camera, location, push notifications)

## 🛠️ Tech Stack

### Frontend (Web)
- **React 19** with TypeScript
- **React Router** for navigation
- **Bootstrap 5** & React Bootstrap for UI
- **Mapbox GL JS** for interactive maps
- **Axios** for API communication
- **React Toastify** for notifications

### Mobile App
- **React Native** with TypeScript
- **Expo** development platform
- **React Navigation** for navigation
- **React Native Maps** for interactive maps
- **Expo Camera** for image capture
- **Expo Location** for GPS functionality
- **Intercom** for customer support
- **Axios** for API communication

### Backend
- **Node.js** & **Express.js**
- **MongoDB** with Mongoose ODM
- **Passport.js** for authentication
- **Cloudinary** for image storage
- **Mapbox SDK** for geocoding
- **Google Generative AI** (Gemini) for content enhancement
- **Helmet.js** & security middleware

### Tools & Services
- **Nodemon** for development
- **CORS** for cross-origin requests
- **Express Session** for user sessions
- **Joi** for data validation
- **Multer** for file uploads

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/the-campgrounds.git
   cd the-campgrounds
   ```

2. **Install backend dependencies**
   ```bash
   cd yelpcamp-backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../yelpcamp-frontend
   npm install
   ```

4. **Install mobile app dependencies**
   ```bash
   cd ../yelpcamp-mobile
   npm install
   ```

### Environment Variables

Create a `.env` file in the `yelpcamp-backend` directory with the following variables:

```env
# Database
DB_URL=mongodb://localhost:27017/thecampgrounds
# OR for MongoDB Atlas:
# DB_URL=mongodb+srv://username:password@cluster.mongodb.net/thecampgrounds

# Session Secret
SECRET=your-super-secret-session-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET=your-cloudinary-api-secret

# Mapbox (for maps and geocoding)
MAPBOX_TOKEN=your-mapbox-access-token

# Google Gemini AI (for enhanced descriptions)
GEMINI_API_KEY=your-gemini-api-key

# URLs
FRONTEND_URL=http://localhost:3000
PORT=5000

# Environment
NODE_ENV=development
```

### Service Setup

1. **MongoDB**: Set up a local MongoDB instance or use MongoDB Atlas
2. **Cloudinary**: Create account at [cloudinary.com](https://cloudinary.com)
3. **Mapbox**: Get API key at [mapbox.com](https://mapbox.com)
4. **Google AI**: Get API key at [ai.google.dev](https://ai.google.dev)

### Running the Application

1. **Start the backend server**
   ```bash
   cd yelpcamp-backend
   npm run dev
   ```
   Server runs on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd yelpcamp-frontend
   npm start
   ```
   App runs on `http://localhost:3000`

3. **Start the mobile app (optional)**
   ```bash
   cd yelpcamp-mobile
   npm start
   ```
   Follow Expo CLI instructions to run on iOS/Android simulator or physical device

## 📚 API Documentation

### Base URLs
- **Production**: `https://yelpcamp-vvv2.onrender.com`
- **Development**: `http://localhost:5000`

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Campground Endpoints
- `GET /api/campgrounds` - Get all campgrounds
- `POST /api/campgrounds` - Create new campground
- `GET /api/campgrounds/:id` - Get specific campground
- `PUT /api/campgrounds/:id` - Update campground
- `DELETE /api/campgrounds/:id` - Delete campground

### Review Endpoints
- `POST /api/campgrounds/:id/reviews` - Add review
- `DELETE /api/campgrounds/:id/reviews/:reviewId` - Delete review

### Example API Calls

**Get all campgrounds:**
```bash
curl https://yelpcamp-vvv2.onrender.com/api/campgrounds
```

**Register new user:**
```bash
curl -X POST https://yelpcamp-vvv2.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## 🏗️ Project Structure

```
the-campgrounds/
├── yelpcamp-backend/           # Express.js API server
│   ├── controllers/            # Route controllers
│   ├── models/                 # Mongoose models
│   ├── utils/                  # Utility functions
│   ├── cloudinary/             # Cloudinary configuration
│   ├── middleware.js           # Custom middleware
│   ├── schemas.js              # Joi validation schemas
│   └── server.js               # Main server file
├── yelpcamp-frontend/          # React TypeScript web app
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   └── public/                 # Static assets
├── yelpcamp-mobile/            # React Native mobile app
│   ├── src/
│   │   ├── components/         # React Native components
│   │   ├── screens/            # Screen components
│   │   ├── navigation/         # Navigation configuration
│   │   ├── contexts/           # React contexts
│   │   ├── services/           # API services
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   ├── android/                # Android native code
│   ├── ios/                    # iOS native code
│   └── assets/                 # Mobile assets
└── README.md
```

## 🚀 Deployment

### Production Deployment

The application is currently deployed and running live:

- **Frontend**: Deployed on Vercel at https://thecampground.vercel.app
- **Backend**: Deployed on Render at https://yelpcamp-vvv2.onrender.com
- **Database**: MongoDB Atlas (cloud-hosted)
- **Images**: Cloudinary (cloud storage)

### Backend Deployment (Render)

The backend is deployed on Render with the following configuration:
1. **Environment variables** set in Render dashboard
2. **Auto-deploy** from GitHub repository
3. **Start command**: `npm start`
4. **Node.js version**: Latest stable

### Frontend Deployment (Vercel)

The frontend is deployed on Vercel with:
1. **Auto-deploy** from GitHub repository
2. **Build command**: `npm run build`
3. **Output directory**: `build`
4. **Environment variables** configured in Vercel dashboard

### Environment Variables for Production

Key environment variables configured in production:
```env
# Backend (Render)
DB_URL=mongodb+srv://...
SECRET=production-secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_KEY=...
CLOUDINARY_SECRET=...
MAPBOX_TOKEN=...
GEMINI_API_KEY=...
FRONTEND_URL=https://thecampground.vercel.app
NODE_ENV=production

# Frontend (Vercel)
REACT_APP_API_URL=https://yelpcamp-vvv2.onrender.com
```

## 🧪 Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run enhance-descriptions` - Run AI description enhancement

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Mobile App Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [The Web Developer Bootcamp](https://www.udemy.com/course/the-web-developer-bootcamp/) by Colt Steele
- [Mapbox](https://mapbox.com) for mapping services
- [Cloudinary](https://cloudinary.com) for image management
- [Google AI](https://ai.google.dev) for content enhancement

## 📧 Support

If you have any questions or need help with setup, please open an issue in the GitHub repository.

---

**Happy Camping! 🏕️** 