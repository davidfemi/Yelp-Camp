const Booking = require('../models/booking');
const Campground = require('../models/campground');

// Intercom API helper (optional - only if you want server-side tracking)
const trackIntercomEvent = async (userId, eventName, metadata) => {
    // Only track if Intercom server-side token is available
    if (!process.env.INTERCOM_ACCESS_TOKEN) return;
    
    try {
        const fetch = require('node-fetch');
        await fetch('https://api.intercom.io/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                event_name: eventName,
                user_id: userId,
                metadata: metadata,
                created_at: Math.floor(Date.now() / 1000)
            })
        });
        console.log(`📊 Tracked server-side Intercom event: ${eventName} for user ${userId}`);
    } catch (error) {
        console.warn('Failed to track Intercom event:', error.message);
    }
};

/**
 * Booking Cleanup Service
 * Handles expiration of bookings and freeing up campground capacity
 */
class BookingCleanupService {
    
    /**
     * Run cleanup for expired bookings
     * @returns {Promise<{expiredCount: number, freedSpots: number}>}
     */
    static async runCleanup() {
        console.log('🧹 Starting booking cleanup service...');
        
        try {
            const now = new Date();
            
            // Find all confirmed bookings that have passed their checkout date
            const expiredBookings = await Booking.find({
                status: 'confirmed',
                checkOutDate: { $lt: now }
            }).populate('campground', 'title capacity peopleBooked');

            console.log(`📊 Found ${expiredBookings.length} expired bookings to process`);

            let expiredCount = 0;
            let freedSpots = 0;

            // Process expired bookings
            for (const booking of expiredBookings) {
                try {
                    // Update booking status to expired
                    booking.status = 'expired';
                    await booking.save();
                    
                    // Track booking expiration in Intercom (if configured)
                    if (booking.user) {
                        await trackIntercomEvent(booking.user.toString(), 'booking_expired', {
                            booking_id: booking._id.toString(),
                            campground_name: booking.campground?.title,
                            campground_location: booking.campground?.location,
                            booking_value: booking.totalPrice,
                            stay_duration: booking.days,
                            check_out_date: booking.checkOutDate,
                            freed_spots: 1
                        });
                    }
                    
                    // Decrement the peopleBooked count for the campground
                    if (booking.campground) {
                        const result = await Campground.findByIdAndUpdate(
                            booking.campground._id,
                            { 
                                $inc: { peopleBooked: -1 },
                                $max: { peopleBooked: 0 } // Ensure peopleBooked doesn't go below 0
                            },
                            { new: true }
                        );
                        
                        if (result) {
                            console.log(`✅ Expired booking for "${booking.campground.title}" - freed 1 spot`);
                            freedSpots++;
                        }
                    }
                    
                    expiredCount++;
                } catch (error) {
                    console.error(`❌ Error processing expired booking ${booking._id}:`, error);
                }
            }

            const result = {
                expiredCount,
                freedSpots,
                processedAt: new Date()
            };

            if (expiredCount > 0) {
                console.log(`🎉 Cleanup completed: Expired ${expiredCount} bookings, freed ${freedSpots} spots`);
            } else {
                console.log('✅ No expired bookings found');
            }

            return result;
        } catch (error) {
            console.error('💥 Error during booking cleanup:', error);
            throw error;
        }
    }

    /**
     * Get statistics about upcoming expirations
     * @returns {Promise<{expiringToday: number, expiringThisWeek: number}>}
     */
    static async getExpirationStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const oneWeekFromNow = new Date(now);
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

        const [expiringToday, expiringThisWeek] = await Promise.all([
            Booking.countDocuments({
                status: 'confirmed',
                checkOutDate: { $lte: today, $gte: now }
            }),
            Booking.countDocuments({
                status: 'confirmed',
                checkOutDate: { $lte: oneWeekFromNow, $gte: now }
            })
        ]);

        return {
            expiringToday,
            expiringThisWeek
        };
    }

    /**
     * Schedule automatic cleanup (can be called periodically)
     * @param {number} intervalMinutes - How often to run cleanup (default: 60 minutes)
     */
    static scheduleCleanup(intervalMinutes = 60) {
        console.log(`⏰ Scheduling booking cleanup every ${intervalMinutes} minutes`);
        
        // Run initial cleanup
        this.runCleanup();
        
        // Schedule recurring cleanup
        setInterval(async () => {
            try {
                await this.runCleanup();
            } catch (error) {
                console.error('💥 Scheduled cleanup failed:', error);
            }
        }, intervalMinutes * 60 * 1000);
    }

    /**
     * Validate and fix campground booking counts
     * Useful for data integrity checks
     */
    static async validateBookingCounts() {
        console.log('🔍 Validating campground booking counts...');
        
        try {
            const campgrounds = await Campground.find({});
            let fixedCount = 0;

            for (const campground of campgrounds) {
                // Count actual confirmed bookings for this campground
                const actualBookings = await Booking.countDocuments({
                    campground: campground._id,
                    status: 'confirmed',
                    checkOutDate: { $gte: new Date() } // Only count non-expired bookings
                });

                // If counts don't match, fix them
                if (campground.peopleBooked !== actualBookings) {
                    console.log(`🔧 Fixing booking count for "${campground.title}": ${campground.peopleBooked} → ${actualBookings}`);
                    
                    await Campground.findByIdAndUpdate(campground._id, {
                        peopleBooked: actualBookings
                    });
                    
                    fixedCount++;
                }
            }

            console.log(`✅ Validation completed: Fixed ${fixedCount} campground booking counts`);
            return fixedCount;
        } catch (error) {
            console.error('💥 Error during booking count validation:', error);
            throw error;
        }
    }
}

module.exports = BookingCleanupService; 