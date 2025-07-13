const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        required: [true, 'Product image is required']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['apparel', 'accessories', 'drinkware', 'stationery'],
        default: 'accessories'
    },
    inStock: {
        type: Boolean,
        default: true
    },
    stockQuantity: {
        type: Number,
        default: 100,
        min: [0, 'Stock quantity cannot be negative']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 