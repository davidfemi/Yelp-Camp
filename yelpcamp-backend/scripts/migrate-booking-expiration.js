const mongoose = require('mongoose');
const Booking = require('../models/booking');

// Database connection
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/myFirstDatabase';

/**
 * Migration script to add checkInDate and checkOutDate to existing bookings
 * This handles bookings created before the expiration system was implemented
 */
async function migrateBookingExpiration() {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose.connect(dbUrl);
        console.log('✅ Database connected');

        // Find all bookings without expiration fields
        const bookingsToMigrate = await Booking.find({
            $or: [
                { checkInDate: { $exists: false } },
                { checkInDate: null },
                { checkOutDate: { $exists: false } },
                { checkOutDate: null }
            ]
        });

        console.log(`📊 Found ${bookingsToMigrate.length} bookings to migrate`);

        if (bookingsToMigrate.length === 0) {
            console.log('✅ All bookings already have expiration fields');
            return;
        }

        let migratedCount = 0;
        let errorCount = 0;

        for (const booking of bookingsToMigrate) {
            try {
                // Calculate check-in and check-out dates based on creation date and days
                const createdAt = new Date(booking.createdAt);
                
                // For existing bookings, assume they were meant to start the day they were created
                const checkInDate = new Date(createdAt);
                checkInDate.setHours(14, 0, 0, 0); // 2 PM check-in
                
                // Calculate check-out date
                const checkOutDate = new Date(checkInDate);
                checkOutDate.setDate(checkOutDate.getDate() + booking.days);
                checkOutDate.setHours(11, 0, 0, 0); // 11 AM check-out

                // Update the booking
                const result = await Booking.findByIdAndUpdate(
                    booking._id,
                    {
                        checkInDate: checkInDate,
                        checkOutDate: checkOutDate
                    },
                    { new: true }
                );

                if (result) {
                    console.log(`✅ Migrated booking ${booking._id}: ${checkInDate.toDateString()} to ${checkOutDate.toDateString()}`);
                    migratedCount++;
                } else {
                    console.log(`❌ Failed to update booking ${booking._id}`);
                    errorCount++;
                }

            } catch (error) {
                console.error(`❌ Error migrating booking ${booking._id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n🎉 Migration completed!');
        console.log(`📊 Total bookings processed: ${bookingsToMigrate.length}`);
        console.log(`✅ Successfully migrated: ${migratedCount}`);
        console.log(`❌ Errors: ${errorCount}`);

        // Now run expiration cleanup to handle any bookings that should be expired
        console.log('\n🧹 Running expiration cleanup on migrated bookings...');
        const expiredCount = await Booking.expireBookings();
        if (expiredCount > 0) {
            console.log(`✅ Expired ${expiredCount} old bookings and freed up spots`);
        } else {
            console.log('✅ No bookings needed to be expired');
        }

    } catch (error) {
        console.error('💥 Migration failed:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔐 Database connection closed');
        process.exit(0);
    }
}

// Run the migration
if (require.main === module) {
    migrateBookingExpiration();
}

module.exports = { migrateBookingExpiration }; 