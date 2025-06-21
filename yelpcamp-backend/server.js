require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const BookingCleanupService = require('./utils/bookingCleanup');

// Import models
const User = require('./models/user');
const Campground = require('./models/campground');
const Review = require('./models/review');
const Booking = require('./models/booking');

// Import utilities
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { validateApiToken, apiRateLimit } = require('./utils/apiKeyAuth');

// Import Mapbox geocoding
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const app = express();

// Database connection - removed deprecated options
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/myFirstDatabase';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("✅ Database connected");
});
mongoose.set('strictQuery', true);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from the frontend URLs
        const allowedOrigins = [
            'https://thecampground.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173'
        ];
        
        // If FRONTEND_URL environment variable is set, use it
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }
        
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`❌ CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.use(mongoSanitize({ replaceWith: '_' }));

// Session configuration - improved for production
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

// Enhanced session configuration for cross-origin deployment
const sessionConfig = {
    store,
    name: 'thecampgrounds.session',
    secret: secret,
    resave: false,
    saveUninitialized: true, // Changed to true for production
    rolling: true, // Reset expiration on each request
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        path: '/' // Explicitly set path
    }
};

app.use(session(sessionConfig));

// Force session cookie middleware for production
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        // Ensure session is touched to force cookie creation
        req.session.touch();
        
        // Override res.json to ensure Set-Cookie header is set
        const originalJson = res.json;
        res.json = function(data) {
            // Force session cookie to be set
            if (!res.headersSent && req.session) {
                const cookieHeader = req.sessionStore.name || 'thecampgrounds.session';
                console.log(`🔧 Forcing session cookie creation for ${req.path}`);
                
                // Manually set the session cookie if it's not already set
                if (!res.getHeader('Set-Cookie')) {
                    const sessionCookie = `${cookieHeader}=${req.sessionID}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`;
                    res.setHeader('Set-Cookie', sessionCookie);
                    console.log(`🍪 Manually set session cookie: ${sessionCookie}`);
                }
            }
            return originalJson.call(this, data);
        };
    }
    next();
});

// Enhanced session debugging middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        console.log(`🔐 Session Debug - Path: ${req.path}, Session ID: ${req.sessionID || 'none'}, Authenticated: ${req.isAuthenticated ? req.isAuthenticated() : false}`);
        console.log(`🍪 Cookie Debug - Headers: ${JSON.stringify(req.headers.cookie || 'no cookies')}`);
        console.log(`🌐 Origin Debug - Origin: ${req.headers.origin || 'no origin'}, Host: ${req.headers.host}`);
        
        // Enhanced response debugging
        const originalSend = res.send;
        const originalJson = res.json;
        
        res.send = function(data) {
            console.log(`📤 Response Debug - Set-Cookie: ${JSON.stringify(res.getHeaders()['set-cookie'] || 'no set-cookie headers')}`);
            return originalSend.call(this, data);
        };
        
        res.json = function(data) {
            console.log(`📤 Response Debug - Set-Cookie: ${JSON.stringify(res.getHeaders()['set-cookie'] || 'no set-cookie headers')}`);
            return originalJson.call(this, data);
        };
    }
    next();
});

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false // Allow cross-origin requests
}));

// Authentication middleware
const isLoggedIn = (req, res, next) => {
    console.log(`🔒 Auth check for ${req.path} - Session ID: ${req.sessionID}, User: ${req.user ? req.user._id : 'none'}`);
    
    if (!req.isAuthenticated()) {
        console.log(`❌ Authentication failed for ${req.path} - User not authenticated`);
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    console.log(`✅ Authentication successful for ${req.path} - User: ${req.user._id}`);
    next();
};

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        return res.status(404).json({
            success: false,
            error: 'Campground not found'
        });
    }
    if (!campground.author.equals(req.user._id)) {
        return res.status(403).json({
            success: false,
            error: 'Permission denied'
        });
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: 'Review not found'
        });
    }
    if (!review.author.equals(req.user._id)) {
        return res.status(403).json({
            success: false,
            error: 'Permission denied'
        });
    }
    next();
};

// API Routes

// Auth Routes
app.post('/api/auth/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        
        req.login(registeredUser, (err) => {
            if (err) throw err;
            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: registeredUser._id,
                        username: registeredUser.username,
                        email: registeredUser.email
                    }
                },
                message: 'Registration successful'
            });
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));

app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    console.log(`✅ Login successful for user: ${req.user.username} (ID: ${req.user._id})`);
    console.log(`🔐 Session ID after login: ${req.sessionID}`);
    console.log(`🍪 Session cookie config: ${JSON.stringify(req.session.cookie)}`);
    
    // Force session save and send response
    req.session.save((err) => {
        if (err) {
            console.error('❌ Session save error:', err);
            return res.status(500).json({
                success: false,
                error: 'Session save failed'
            });
        }
        
        console.log(`💾 Session saved successfully`);
        console.log(`🔄 Headers before response: ${JSON.stringify(res.getHeaders())}`);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    username: req.user.username,
                    email: req.user.email
                }
            },
            message: 'Login successful'
        });
    });
});

app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    username: req.user.username,
                    email: req.user.email
                }
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Not authenticated'
        });
    }
});

// User Profile Route
app.get('/api/users/profile', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).select('-salt -hash');
    
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Get user's campground count
    const campgroundCount = await Campground.countDocuments({ author: req.user._id });
    
    // Get user's booking count
    const bookingCount = await Booking.countDocuments({ user: req.user._id });
    
    // Get user's review count
    const reviewCount = await Review.countDocuments({ author: req.user._id });

    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt || new Date(),
                stats: {
                    campgrounds: campgroundCount,
                    bookings: bookingCount,
                    reviews: reviewCount
                }
            }
        }
    });
}));

// Campgrounds Routes
app.get('/api/campgrounds', catchAsync(async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        search, 
        location, 
        minPrice, 
        maxPrice,
        sortBy = 'title',
        sortOrder = 'asc'
    } = req.query;

    const query = {};
    
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
        ];
    }

    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const campgrounds = await Campground.find(query)
        .populate('author', 'username')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    // Add booking statistics to each campground
    const campgroundsWithBookingStats = campgrounds.map(campground => {
        const campgroundObj = campground.toObject();
        campgroundObj.bookingPercentage = campground.capacity > 0 ? Math.round((campground.peopleBooked / campground.capacity) * 100) : 0;
        campgroundObj.availableSpots = Math.max(0, campground.capacity - campground.peopleBooked);
        return campgroundObj;
    });

    const total = await Campground.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
        success: true,
        data: {
            campgrounds: campgroundsWithBookingStats,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCampgrounds: total,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1,
                limit: parseInt(limit)
            }
        }
    });
}));

app.get('/api/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate('author', 'username email')
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
                select: 'username'
            },
            options: { sort: { createdAt: -1 } }
        });

    if (!campground) {
        return res.status(404).json({
            success: false,
            error: 'Campground not found'
        });
    }

    const avgRating = campground.reviews.length > 0 
        ? campground.reviews.reduce((sum, review) => sum + review.rating, 0) / campground.reviews.length
        : 0;

    // Add booking statistics
    const bookingPercentage = campground.capacity > 0 ? Math.round((campground.peopleBooked / campground.capacity) * 100) : 0;
    const availableSpots = Math.max(0, campground.capacity - campground.peopleBooked);

    res.json({
        success: true,
        data: {
            campground,
            stats: {
                averageRating: Math.round(avgRating * 10) / 10,
                totalReviews: campground.reviews.length,
                capacity: campground.capacity,
                peopleBooked: campground.peopleBooked,
                bookingPercentage: bookingPercentage,
                availableSpots: availableSpots
            }
        }
    });
}));

app.post('/api/campgrounds', isLoggedIn, catchAsync(async (req, res) => {
    const { title, description, location, price, images } = req.body;
    
    // Basic validation
    if (!title || !description || !location || price === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: title, description, location, and price are required'
        });
    }

    try {
        // Geocode the location
        const geoData = await geocoder.forwardGeocode({
            query: location,
            limit: 1
        }).send();

        if (!geoData.body.features || geoData.body.features.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Location not found. Please enter a valid location.'
            });
        }

        // Create the campground
        const campgroundData = {
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            price: Number(price),
            images: images || [],
            geometry: geoData.body.features[0].geometry,
            author: req.user._id
        };

        const campground = new Campground(campgroundData);
        await campground.save();
        
        await campground.populate('author', 'username');
        
        res.status(201).json({
            success: true,
            data: { campground },
            message: 'Campground created successfully'
        });
    } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        return res.status(400).json({
            success: false,
            error: 'Invalid location. Please enter a valid location that can be found on the map.'
        });
    }
}));

app.put('/api/campgrounds/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('author', 'username');

    res.json({
        success: true,
        data: { campground },
        message: 'Campground updated successfully'
    });
}));

app.delete('/api/campgrounds/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.json({
        success: true,
        message: 'Campground deleted successfully'
    });
}));

// Reviews Routes
app.post('/api/campgrounds/:id/reviews', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        return res.status(404).json({
            success: false,
            error: 'Campground not found'
        });
    }

    const review = new Review(req.body);
    review.author = req.user._id;
    campground.reviews.push(review);
    
    await review.save();
    await campground.save();
    
    await review.populate('author', 'username');

    res.status(201).json({
        success: true,
        data: { review },
        message: 'Review added successfully'
    });
}));

app.delete('/api/campgrounds/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    res.json({
        success: true,
        message: 'Review deleted successfully'
    });
}));

// Booking Routes
app.post('/api/campgrounds/:id/bookings', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { days, checkInDate } = req.body;

    console.log(`🔄 Booking request - Campground ID: ${id}, Days: ${days}, CheckIn: ${checkInDate}, User: ${req.user._id}`);

    if (!days || days < 1) {
        console.log('❌ Invalid days parameter:', days);
        return res.status(400).json({
            success: false,
            error: 'Number of days must be at least 1'
        });
    }

    // Validate check-in date
    const checkIn = new Date(checkInDate || new Date());
    const now = new Date();
    
    if (checkIn < now) {
        console.log('❌ Invalid check-in date:', checkInDate);
        return res.status(400).json({
            success: false,
            error: 'Check-in date cannot be in the past'
        });
    }

    // Calculate check-out date
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + days);

    try {
        // Run booking expiration cleanup before creating new booking
        console.log('🧹 Running booking expiration cleanup...');
        const expiredCount = await Booking.expireBookings();
        if (expiredCount > 0) {
            console.log(`✅ Expired ${expiredCount} bookings and freed up spots`);
        }

        const campground = await Campground.findById(id);
        if (!campground) {
            console.log('❌ Campground not found:', id);
            return res.status(404).json({
                success: false,
                error: 'Campground not found'
            });
        }

        console.log(`📊 Campground found: ${campground.title}`);
        console.log(`📊 Current capacity: ${campground.capacity}, peopleBooked: ${campground.peopleBooked}`);

        // Ensure capacity and peopleBooked fields exist with defaults
        if (campground.capacity === undefined || campground.capacity === null) {
            console.log('⚠️ Capacity field missing, setting default to 50');
            campground.capacity = 50;
            await campground.save();
        }

        if (campground.peopleBooked === undefined || campground.peopleBooked === null) {
            console.log('⚠️ PeopleBooked field missing, setting default to 0');
            campground.peopleBooked = 0;
            await campground.save();
        }

        // Check if campground has capacity
        if (campground.peopleBooked >= campground.capacity) {
            console.log('❌ Campground fully booked');
            return res.status(400).json({
                success: false,
                error: 'Campground is fully booked'
            });
        }

        const totalPrice = campground.price * days;
        console.log(`💰 Calculated total price: ${totalPrice}`);
        console.log(`📅 Check-in: ${checkIn.toISOString()}, Check-out: ${checkOut.toISOString()}`);

        const booking = new Booking({
            user: req.user._id,
            campground: id,
            days: days,
            totalPrice: totalPrice,
            checkInDate: checkIn,
            checkOutDate: checkOut
        });

        console.log('💾 Saving booking...');
        await booking.save();
        
        // Increment the peopleBooked count
        console.log('📈 Incrementing peopleBooked count...');
        await Campground.findByIdAndUpdate(id, { 
            $inc: { peopleBooked: 1 } 
        });

        console.log('🔄 Populating booking data...');
        await booking.populate('user', 'username email');
        await booking.populate('campground', 'title location price capacity peopleBooked');

        // Create a clean response object to avoid JSON serialization issues
        const cleanBooking = {
            _id: booking._id,
            user: {
                _id: booking.user._id,
                username: booking.user.username,
                email: booking.user.email
            },
            campground: {
                _id: booking.campground._id,
                title: booking.campground.title,
                location: booking.campground.location,
                price: booking.campground.price,
                capacity: booking.campground.capacity,
                peopleBooked: booking.campground.peopleBooked + 1, // Add 1 since we just incremented
                availableSpots: Math.max(0, booking.campground.capacity - (booking.campground.peopleBooked + 1))
            },
            days: booking.days,
            totalPrice: booking.totalPrice,
            status: booking.status,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            createdAt: booking.createdAt
        };

        console.log('✅ Booking created successfully');
        res.status(201).json({
            success: true,
            data: { booking: cleanBooking },
            message: 'Booking created successfully'
        });

    } catch (error) {
        console.error('💥 Booking creation error:', error);
        console.error('Error stack:', error.stack);
        throw error; // Let catchAsync handle it
    }
}));

app.get('/api/bookings', isLoggedIn, catchAsync(async (req, res) => {
    console.log(`🔄 Fetching bookings for user: ${req.user._id}`);
    
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('campground', 'title location price images')
            .sort({ createdAt: -1 });

        console.log(`📊 Found ${bookings.length} bookings for user`);
        
        // Clean the booking data to avoid serialization issues
        const cleanBookings = bookings.map(booking => {
            const bookingObj = booking.toObject();
            
            // Ensure campground data is clean
            if (bookingObj.campground) {
                bookingObj.campground = {
                    _id: bookingObj.campground._id,
                    title: bookingObj.campground.title || 'Untitled Campground',
                    location: bookingObj.campground.location || 'Unknown Location',
                    price: bookingObj.campground.price || 0,
                    images: bookingObj.campground.images || []
                };
            }
            
            return bookingObj;
        });

        console.log('✅ Bookings data cleaned and ready to send');
        
        res.json({
            success: true,
            data: { bookings: cleanBookings }
        });
    } catch (error) {
        console.error('💥 Error fetching bookings:', error);
        throw error;
    }
}));

// API Token Protected Endpoint - Get bookings by user_id
app.get('/api/booking/:user_id', apiRateLimit, validateApiToken, catchAsync(async (req, res) => {
    const { user_id } = req.params;
    
    console.log(`🔄 API request: Fetching bookings for user_id: ${user_id}`);
    
    try {
        // Validate user_id format
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user_id format'
            });
        }

        // Check if user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get bookings for the specified user
        const bookings = await Booking.find({ user: user_id })
            .populate('campground', 'title location price images')
            .populate('user', 'username email')
            .sort({ createdAt: -1 });

        console.log(`📊 Found ${bookings.length} bookings for user_id: ${user_id}`);
        
        // Clean the booking data
        const cleanBookings = bookings.map(booking => {
            const bookingObj = booking.toObject();
            
            // Ensure campground data is clean
            if (bookingObj.campground) {
                bookingObj.campground = {
                    _id: bookingObj.campground._id,
                    title: bookingObj.campground.title || 'Untitled Campground',
                    location: bookingObj.campground.location || 'Unknown Location',
                    price: bookingObj.campground.price || 0,
                    images: bookingObj.campground.images || []
                };
            }
            
            // Clean user data
            if (bookingObj.user) {
                bookingObj.user = {
                    _id: bookingObj.user._id,
                    username: bookingObj.user.username,
                    email: bookingObj.user.email
                };
            }
            
            return bookingObj;
        });

        console.log('✅ API request: Bookings data cleaned and ready to send');
        
        res.json({
            success: true,
            data: { 
                bookings: cleanBookings,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                },
                total: cleanBookings.length
            }
        });
    } catch (error) {
        console.error('💥 API request error:', error);
        throw error;
    }
}));

// Search and Category Routes
app.get('/api/campgrounds/search/:term', catchAsync(async (req, res) => {
    const { term } = req.params;
    const { limit = 10 } = req.query;

    const campgrounds = await Campground.find({
        $or: [
            { title: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
            { location: { $regex: term, $options: 'i' } }
        ]
    })
    .populate('author', 'username')
    .limit(parseInt(limit))
    .select('title location price images description');

    res.json({
        success: true,
        data: {
            searchTerm: term,
            results: campgrounds.length,
            campgrounds
        }
    });
}));

app.get('/api/campgrounds/category/:type', catchAsync(async (req, res) => {
    const { type } = req.params;
    const { limit = 20 } = req.query;

    const categoryKeywords = {
        ocean: ['ocean', 'sea', 'bay', 'beach', 'coast', 'bayshore'],
        mountain: ['mountain', 'peak', 'summit', 'alpine', 'ridge'],
        desert: ['desert', 'sand', 'dune', 'mesa', 'canyon'],
        river: ['river', 'creek', 'stream', 'rapids', 'waterfall', 'creekside'],
        lake: ['lake', 'pond', 'reservoir', 'lagoon'],
        forest: ['forest', 'woods', 'trees', 'woodland']
    };

    const keywords = categoryKeywords[type.toLowerCase()];
    if (!keywords) {
        return res.status(400).json({
            success: false,
            error: 'Invalid category type',
            validTypes: Object.keys(categoryKeywords)
        });
    }

    const regex = new RegExp(keywords.join('|'), 'i');
    const campgrounds = await Campground.find({ title: regex })
        .populate('author', 'username')
        .limit(parseInt(limit))
        .select('title location price images description');

    res.json({
        success: true,
        data: {
            category: type,
            results: campgrounds.length,
            campgrounds
        }
    });
}));

// Booking Cleanup Routes
app.post('/api/admin/cleanup-bookings', catchAsync(async (req, res) => {
    console.log('🧹 Manual booking cleanup requested');
    
    try {
        const result = await BookingCleanupService.runCleanup();
        
        res.json({
            success: true,
            data: result,
            message: `Cleanup completed: Expired ${result.expiredCount} bookings, freed ${result.freedSpots} spots`
        });
    } catch (error) {
        console.error('💥 Manual cleanup failed:', error);
        res.status(500).json({
            success: false,
            error: 'Cleanup failed',
            details: error.message
        });
    }
}));

app.get('/api/admin/booking-expiration-stats', catchAsync(async (req, res) => {
    try {
        const stats = await BookingCleanupService.getExpirationStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('💥 Failed to get expiration stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get expiration statistics',
            details: error.message
        });
    }
}));

app.post('/api/admin/validate-booking-counts', catchAsync(async (req, res) => {
    console.log('🔍 Manual booking count validation requested');
    
    try {
        const fixedCount = await BookingCleanupService.validateBookingCounts();
        
        res.json({
            success: true,
            data: { fixedCount },
            message: `Validation completed: Fixed ${fixedCount} campground booking counts`
        });
    } catch (error) {
        console.error('💥 Booking count validation failed:', error);
        res.status(500).json({
            success: false,
            error: 'Validation failed',
            details: error.message
        });
    }
}));

// Stats Route
app.get('/api/stats', catchAsync(async (req, res) => {
    const totalCampgrounds = await Campground.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    const priceStats = await Campground.aggregate([
        {
            $group: {
                _id: null,
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        }
    ]);

    const locationStats = await Campground.aggregate([
        {
            $group: {
                _id: '$location',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    res.json({
        success: true,
        data: {
            totalCampgrounds,
            totalReviews,
            pricing: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 },
            topLocations: locationStats
        }
    });
}));

// SEO Routes
app.get('/sitemap.xml', catchAsync(async (req, res) => {
    // Use environment variable for frontend URL, with appropriate fallback based on environment
    const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
            ? `https://${req.get('host').replace('yelpcamp-vvv2.onrender.com', 'thecampground.vercel.app')}`
            : 'http://localhost:3000'
        );
    
    // Get all campgrounds for the sitemap
    const campgrounds = await Campground.find({}, '_id title updatedAt').sort({ updatedAt: -1 });
    
    // Generate XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Main Pages -->
    <url>
        <loc>${frontendUrl}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${frontendUrl}/campgrounds</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${frontendUrl}/login</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>
    <url>
        <loc>${frontendUrl}/register</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>
    <!-- Campground Pages -->`;

    // Add each campground to sitemap
    campgrounds.forEach(campground => {
        const lastmod = campground.updatedAt ? campground.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        sitemap += `
    <url>
        <loc>${frontendUrl}/campgrounds/${campground._id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
}));

// Dynamic robots.txt endpoint
app.get('/robots.txt', (req, res) => {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('host');
    const sitemapUrl = `${protocol}://${host}/sitemap.xml`;
    
    const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
            ? `https://${host.replace('yelpcamp-vvv2.onrender.com', 'thecampground.vercel.app')}`
            : 'http://localhost:3000'
        );

    const robotsTxt = `# Robots.txt for The Campgrounds
User-agent: *
Allow: /

# Sitemap
Sitemap: ${sitemapUrl}

# Crawl-delay (optional - be respectful to search engines)
Crawl-delay: 1

# Frontend URLs that should not be crawled by search engines
# Note: These are frontend routes, not backend API routes
# Disallow: ${frontendUrl.replace(protocol + '://' + host, '')}/login
# Disallow: ${frontendUrl.replace(protocol + '://' + host, '')}/register
# Disallow: ${frontendUrl.replace(protocol + '://' + host, '')}/campgrounds/new
# Disallow: ${frontendUrl.replace(protocol + '://' + host, '')}/campgrounds/*/edit

# Allow all API endpoints for this backend
Allow: /api/
Allow: /sitemap.xml
`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
});

// Error handling middleware
app.all('*', (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        path: req.path
    });
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    
    // Enhanced error logging for debugging
    console.error('💥 Server Error:', {
        message: err.message,
        statusCode,
        path: req.path,
        method: req.method,
        params: req.params,
        body: req.body,
        user: req.user ? req.user._id : 'Not authenticated',
        timestamp: new Date().toISOString()
    });
    
    if (process.env.NODE_ENV === 'development') {
        console.error('Error stack:', err.stack);
    }
    
    res.status(statusCode).json({
        success: false,
        error: err.message,
        statusCode,
        path: req.path,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: {
                params: req.params,
                body: req.body
            }
        })
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 The Campgrounds Backend API running on port ${port}`);
    console.log(`📡 API available at: http://localhost:${port}/api`);
    
    // Initialize booking cleanup service
    console.log('🧹 Initializing booking cleanup service...');
    BookingCleanupService.scheduleCleanup(60); // Run cleanup every 60 minutes
}); 