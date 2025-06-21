const Campground = require('../models/campground');
const User = require('../models/user');
const Booking = require('../models/booking');

/**
 * Debug utility for booking issues
 */
class BookingDebug {
    
    static async validateCampground(campgroundId) {
        try {
            const campground = await Campground.findById(campgroundId);
            
            if (!campground) {
                return { valid: false, error: 'Campground not found', code: 'NOT_FOUND' };
            }

            const issues = [];
            
            // Check required fields
            if (!campground.title) issues.push('Missing title');
            if (!campground.price || campground.price <= 0) issues.push('Invalid price');
            if (campground.capacity === undefined || campground.capacity === null || campground.capacity <= 0) {
                issues.push('Invalid capacity');
            }
            if (campground.peopleBooked === undefined || campground.peopleBooked === null || campground.peopleBooked < 0) {
                issues.push('Invalid peopleBooked count');
            }

            // Check availability
            if (campground.peopleBooked >= campground.capacity) {
                issues.push('Campground is fully booked');
            }

            return {
                valid: issues.length === 0,
                campground: {
                    id: campground._id,
                    title: campground.title,
                    price: campground.price,
                    capacity: campground.capacity,
                    peopleBooked: campground.peopleBooked,
                    availableSpots: Math.max(0, campground.capacity - campground.peopleBooked)
                },
                issues: issues,
                code: issues.length > 0 ? 'VALIDATION_FAILED' : 'VALID'
            };
        } catch (error) {
            return { 
                valid: false, 
                error: error.message, 
                code: 'DATABASE_ERROR',
                stack: error.stack 
            };
        }
    }

    static async validateUser(userId) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                return { valid: false, error: 'User not found', code: 'NOT_FOUND' };
            }

            return {
                valid: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                },
                code: 'VALID'
            };
        } catch (error) {
            return { 
                valid: false, 
                error: error.message, 
                code: 'DATABASE_ERROR',
                stack: error.stack 
            };
        }
    }

    static validateBookingRequest(days, price) {
        const issues = [];
        
        if (!days || days < 1) {
            issues.push('Days must be at least 1');
        }
        
        if (!price || price <= 0) {
            issues.push('Invalid price for calculation');
        }

        const totalPrice = (days && price) ? days * price : 0;

        return {
            valid: issues.length === 0,
            booking: {
                days: days,
                pricePerNight: price,
                totalPrice: totalPrice
            },
            issues: issues,
            code: issues.length > 0 ? 'VALIDATION_FAILED' : 'VALID'
        };
    }

    static async getUserBookingHistory(userId, limit = 5) {
        try {
            const bookings = await Booking.find({ user: userId })
                .populate('campground', 'title location price')
                .sort({ createdAt: -1 })
                .limit(limit);

            return {
                success: true,
                bookings: bookings.map(booking => ({
                    id: booking._id,
                    campground: booking.campground.title,
                    days: booking.days,
                    totalPrice: booking.totalPrice,
                    status: booking.status,
                    createdAt: booking.createdAt
                })),
                count: bookings.length
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.message, 
                stack: error.stack 
            };
        }
    }

    static async getCampgroundBookingStats(campgroundId) {
        try {
            const campground = await Campground.findById(campgroundId);
            if (!campground) {
                return { success: false, error: 'Campground not found' };
            }

            const bookingCount = await Booking.countDocuments({ 
                campground: campgroundId,
                status: 'confirmed' 
            });

            const recentBookings = await Booking.find({ campground: campgroundId })
                .populate('user', 'username')
                .sort({ createdAt: -1 })
                .limit(5);

            return {
                success: true,
                stats: {
                    campgroundTitle: campground.title,
                    capacity: campground.capacity,
                    peopleBooked: campground.peopleBooked,
                    availableSpots: Math.max(0, campground.capacity - campground.peopleBooked),
                    totalBookings: bookingCount,
                    utilizationRate: campground.capacity > 0 ? 
                        Math.round((campground.peopleBooked / campground.capacity) * 100) : 0
                },
                recentBookings: recentBookings.map(booking => ({
                    user: booking.user.username,
                    days: booking.days,
                    totalPrice: booking.totalPrice,
                    createdAt: booking.createdAt
                }))
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.message, 
                stack: error.stack 
            };
        }
    }

    static logBookingAttempt(req, result) {
        const logData = {
            timestamp: new Date().toISOString(),
            campgroundId: req.params.id,
            userId: req.user ? req.user._id : 'Not authenticated',
            requestBody: req.body,
            result: result,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        };

        console.log('📋 Booking Attempt Log:', JSON.stringify(logData, null, 2));
        return logData;
    }
}

module.exports = BookingDebug; 