const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'USA'
        }
    },
    orderNumber: {
        type: String,
        unique: true
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
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        this.orderNumber = 'TC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// Also generate on validation to ensure it's always present
orderSchema.pre('validate', function(next) {
    if (!this.orderNumber) {
        this.orderNumber = 'TC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema); 