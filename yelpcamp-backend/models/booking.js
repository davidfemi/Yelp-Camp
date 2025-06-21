const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campground: {
        type: Schema.Types.ObjectId,
        ref: 'Campground',
        required: true
    },
    days: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'expired'],
        default: 'confirmed'
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual to check if booking is expired
BookingSchema.virtual('isExpired').get(function() {
    return new Date() > this.checkOutDate && this.status === 'confirmed';
});

// Static method to find and expire bookings
BookingSchema.statics.expireBookings = async function() {
    const now = new Date();
    
    // Find all confirmed bookings that have passed their checkout date
    const expiredBookings = await this.find({
        status: 'confirmed',
        checkOutDate: { $lt: now }
    }).populate('campground');

    let expiredCount = 0;
    
    for (const booking of expiredBookings) {
        // Update booking status to expired
        booking.status = 'expired';
        await booking.save();
        
        // Decrement the peopleBooked count for the campground
        if (booking.campground) {
            await mongoose.model('Campground').findByIdAndUpdate(
                booking.campground._id,
                { $inc: { peopleBooked: -1 } }
            );
        }
        
        expiredCount++;
    }
    
    return expiredCount;
};

// Ensure virtuals are included when converting to JSON
BookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', BookingSchema); 