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
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    payment: {
        method: {
            type: String,
            enum: ['simulated', 'stripe', 'paypal', 'credit_card'],
            default: 'simulated'
        },
        transactionId: String,
        paymentIntentId: String, // Stripe payment intent ID
        paid: {
            type: Boolean,
            default: false
        },
        paidAt: Date
    },
    refund: {
        status: {
            type: String,
            enum: ['none', 'pending', 'processed', 'failed'],
            default: 'none'
        },
        amount: {
            type: Number,
            default: 0
        },
        refundId: String, // Stripe refund ID
        reason: String,
        processedAt: Date,
        failureReason: String
    }
});

module.exports = mongoose.model('Booking', BookingSchema); 