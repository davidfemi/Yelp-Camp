const mongoose = require('mongoose')
const Review = require('./review')
const User = require('./user')
const Schema = mongoose.Schema


// https://res.cloudinary.com/david-codes/image/upload/v1637986926/YelpCamp/i1vunonm1takp5z7zelr.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    capacity: {
        type: Number,
        default: 50,
        min: 1,
        max: 500
    },
    peopleBooked: {
        type: Number,
        default: 0,
        min: 0
    }
}, opts)

CampgroundSchema.virtual('properties.popUpMarkUp').get(function () {
    const safeDescription = this.description || '';
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title || 'Untitled'}</a><strong>
    <p>${safeDescription.substring(0, 20)}...</p >`
})

CampgroundSchema.virtual('bookingPercentage').get(function () {
    return this.capacity > 0 ? Math.round((this.peopleBooked / this.capacity) * 100) : 0
})

CampgroundSchema.virtual('availableSpots').get(function () {
    return Math.max(0, this.capacity - this.peopleBooked)
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)