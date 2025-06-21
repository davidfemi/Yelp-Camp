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

// Import models
const User = require('./models/user');
const Campground = require('./models/campground');
const Review = require('./models/review');

// Import utilities
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

// Import Mapbox geocoding
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const app = express();

// Database connection
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/myFirstDatabase';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("✅ Database connected");
});
mongoose.set('strictQuery', true);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(mongoSanitize({ replaceWith: '_' }));

// Session configuration
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    name: 'thecampgrounds.session',
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for API
}));

// Authentication middleware
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
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

    const total = await Campground.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
        success: true,
        data: {
            campgrounds,
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

    res.json({
        success: true,
        data: {
            campground,
            stats: {
                averageRating: Math.round(avgRating * 10) / 10,
                totalReviews: campground.reviews.length
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
    
    res.status(statusCode).json({
        success: false,
        error: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 The Campgrounds Backend API running on port ${port}`);
    console.log(`📡 API available at: http://localhost:${port}/api`);
}); 