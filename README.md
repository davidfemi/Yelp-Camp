# YelpCamp 🏕️

A full-stack web application for discovering and reviewing campgrounds around the world. Built with modern technologies and featuring user authentication, image uploads, interactive maps, and AI-enhanced descriptions.

![YelpCamp](yelpcamp-frontend/Yelpcamp.png)

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

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Bootstrap 5** & React Bootstrap for UI
- **Mapbox GL JS** for interactive maps
- **Axios** for API communication
- **React Toastify** for notifications

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
   git clone https://github.com/yourusername/yelpcamp.git
   cd yelpcamp
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

### Environment Variables

Create a `.env` file in the `yelpcamp-backend` directory with the following variables:

```env
# Database
DB_URL=mongodb://localhost:27017/yelpcamp
# OR for MongoDB Atlas:
# DB_URL=mongodb+srv://username:password@cluster.mongodb.net/yelpcamp

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

## 📚 API Documentation

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

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🏗️ Project Structure

```
yelpcamp/
├── yelpcamp-backend/           # Express.js API server
│   ├── controllers/            # Route controllers
│   ├── models/                 # Mongoose models
│   ├── utils/                  # Utility functions
│   ├── cloudinary/             # Cloudinary configuration
│   ├── middleware.js           # Custom middleware
│   ├── schemas.js              # Joi validation schemas
│   └── server.js               # Main server file
├── yelpcamp-frontend/          # React TypeScript app
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   └── public/                 # Static assets
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. **Set environment variables** in your hosting platform
2. **Deploy from GitHub** or use CLI tools
3. **Set start command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Build the app**: `npm run build`
2. **Deploy the build folder**
3. **Set environment variables** if needed

### Environment Variables for Production

Make sure to set all the environment variables from the `.env` file in your production environment, updating URLs and secrets as needed.

## 🧪 Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run enhance-descriptions` - Run AI description enhancement

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

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