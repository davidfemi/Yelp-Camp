# YelpCamp Frontend/Backend Setup Guide

Your YelpCamp project has been successfully separated into a modern frontend/backend architecture!

## 🏗️ Project Structure

```
YelpCamp/
├── yelpcamp-backend/          # Node.js Express API
│   ├── server.js             # Main server file
│   ├── models/               # MongoDB models
│   ├── utils/                # Utility functions
│   ├── controllers/          # Route controllers
│   ├── cloudinary/           # Cloudinary config
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
│
└── yelpcamp-frontend/         # React.js SPA
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/            # Page components
    │   ├── services/         # API service layer
    │   ├── context/          # React context (auth)
    │   └── App.tsx           # Main app component
    ├── package.json          # Frontend dependencies
    └── public/               # Static assets
```

## 🚀 Backend Setup (API Server)

### 1. Navigate to Backend Directory
```bash
cd yelpcamp-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Make sure your `.env` file contains:
```env
DB_URL=your_mongodb_connection_string
SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### 4. Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend API will run on `http://localhost:5000`

### 📡 Available API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Campgrounds
- `GET /api/campgrounds` - List campgrounds (with pagination/filtering)
- `GET /api/campgrounds/:id` - Get campground details
- `POST /api/campgrounds` - Create campground (auth required)
- `PUT /api/campgrounds/:id` - Update campground (auth required)
- `DELETE /api/campgrounds/:id` - Delete campground (auth required)

#### Reviews
- `POST /api/campgrounds/:id/reviews` - Add review (auth required)
- `DELETE /api/campgrounds/:id/reviews/:reviewId` - Delete review (auth required)

#### Search & Categories
- `GET /api/campgrounds/search/:term` - Search campgrounds
- `GET /api/campgrounds/category/:type` - Get by category
- `GET /api/stats` - Get statistics

## 🎨 Frontend Setup (React App)

### 1. Navigate to Frontend Directory
```bash
cd yelpcamp-frontend
```

### 2. Dependencies Already Installed
The following packages are included:
- React with TypeScript
- React Router DOM
- Bootstrap & React Bootstrap
- Axios for API calls
- React Toastify for notifications

### 3. Environment Variables (Optional)
Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start Frontend Development Server
```bash
npm start
```

The React app will run on `http://localhost:3000`

## 🔧 Key Features Implemented

### Backend Features
✅ **Complete API** - All CRUD operations for campgrounds and reviews
✅ **Authentication** - Session-based auth with Passport.js
✅ **Authorization** - Protected routes and ownership checks
✅ **Search & Filtering** - Advanced campground search capabilities
✅ **CORS Support** - Configured for frontend communication
✅ **Error Handling** - Consistent JSON error responses
✅ **Validation** - Input validation and sanitization

### Frontend Features
✅ **React with TypeScript** - Type-safe development
✅ **React Router** - Client-side routing
✅ **Authentication Context** - Global auth state management
✅ **Bootstrap UI** - Responsive, modern design
✅ **API Service Layer** - Centralized API communication
✅ **Protected Routes** - Authentication-based access control
✅ **Toast Notifications** - User feedback system

## 🔄 Development Workflow

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd yelpcamp-backend
npm run dev

# Terminal 2 - Frontend  
cd yelpcamp-frontend
npm start
```

### 2. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: See existing API_DOCUMENTATION.md

### 3. Development Features
- **Hot Reload**: Both frontend and backend support hot reloading
- **CORS**: Pre-configured for local development
- **TypeScript**: Frontend has full TypeScript support
- **Error Handling**: Comprehensive error handling on both ends

## 📱 Frontend Pages Created

1. **Home** (`/`) - Landing page with stats and features
2. **Login** (`/login`) - User authentication
3. **Register** (`/register`) - User registration
4. **Campgrounds** (`/campgrounds`) - Browse all campgrounds
5. **Campground Detail** (`/campgrounds/:id`) - View single campground
6. **New Campground** (`/campgrounds/new`) - Create campground (protected)
7. **Edit Campground** (`/campgrounds/:id/edit`) - Edit campground (protected)

## 🔒 Authentication Flow

1. **Registration/Login** - User authenticates via API
2. **Session Management** - Backend maintains sessions
3. **Frontend State** - React context tracks auth status
4. **Protected Routes** - Automatic redirect to login if needed
5. **API Requests** - Include credentials for authenticated endpoints

## 🚀 Next Steps

### Immediate Tasks
1. **Complete Frontend Pages** - Finish implementing all React components
2. **Test Integration** - Verify frontend-backend communication
3. **Add Image Upload** - Implement file upload functionality
4. **Styling** - Enhance UI/UX design

### Future Enhancements
- **JWT Authentication** - Replace sessions with JWT tokens
- **Real-time Features** - Add WebSocket support
- **Progressive Web App** - Add PWA capabilities
- **Mobile App** - React Native version
- **Deployment** - Production deployment guides

## 🐛 Troubleshooting

### Backend Issues
- **Database Connection**: Check MongoDB connection string
- **CORS Errors**: Verify FRONTEND_URL in .env
- **Authentication**: Ensure session secret is set

### Frontend Issues
- **API Calls Failing**: Check if backend is running on port 5000
- **CORS Issues**: Verify backend CORS configuration
- **Build Errors**: Check TypeScript types and imports

## 📚 Documentation

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Original Project**: Your existing YelpCamp files remain unchanged
- **Backend Code**: Fully functional Express API in `yelpcamp-backend/`
- **Frontend Code**: Modern React app in `yelpcamp-frontend/`

Your project is now ready for modern development with a clean separation of concerns! 