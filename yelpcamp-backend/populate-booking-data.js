const mongoose = require('mongoose');
const Campground = require('./models/campground');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yelp-camp');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Generate realistic capacity based on campground characteristics
const generateCapacity = (title, price) => {
    const baseCapacity = 50;
    
    // Higher priced campgrounds tend to have lower capacity (more exclusive)
    let capacityModifier = 1;
    if (price > 100) capacityModifier = 0.6;
    else if (price > 50) capacityModifier = 0.8;
    else if (price < 20) capacityModifier = 1.3;
    
    // Certain keywords suggest different capacities
    const titleLower = title.toLowerCase();
    if (titleLower.includes('luxury') || titleLower.includes('premium')) capacityModifier *= 0.5;
    else if (titleLower.includes('family') || titleLower.includes('group')) capacityModifier *= 1.5;
    else if (titleLower.includes('backcountry') || titleLower.includes('remote')) capacityModifier *= 0.7;
    else if (titleLower.includes('rv') || titleLower.includes('resort')) capacityModifier *= 1.8;
    
    // Random variation between 0.8 and 1.2
    const randomFactor = 0.8 + (Math.random() * 0.4);
    
    const finalCapacity = Math.round(baseCapacity * capacityModifier * randomFactor);
    return Math.max(10, Math.min(500, finalCapacity)); // Ensure between 10 and 500
};

// Generate realistic peopleBooked count
const generatePeopleBooked = (capacity) => {
    // Generate a booking percentage between 30% and 90% for realistic occupancy
    const minBookingPercentage = 0.3;
    const maxBookingPercentage = 0.9;
    const bookingPercentage = minBookingPercentage + (Math.random() * (maxBookingPercentage - minBookingPercentage));
    
    return Math.floor(capacity * bookingPercentage);
};

const populateBookingData = async () => {
    try {
        await connectDB();
        
        console.log('🔄 Starting to populate booking data...\n');
        
        // Get all campgrounds
        const campgrounds = await Campground.find({});
        console.log(`📊 Found ${campgrounds.length} campgrounds to update\n`);
        
        let updatedCount = 0;
        
        for (const campground of campgrounds) {
            // Generate capacity and peopleBooked
            const capacity = generateCapacity(campground.title, campground.price);
            const peopleBooked = generatePeopleBooked(capacity);
            
            // Update the campground
            await Campground.findByIdAndUpdate(campground._id, {
                capacity: capacity,
                peopleBooked: peopleBooked
            });
            
            updatedCount++;
            
            const bookingPercentage = Math.round((peopleBooked / capacity) * 100);
            const availableSpots = capacity - peopleBooked;
            
            console.log(`✅ ${campground.title}`);
            console.log(`   💰 Price: $${campground.price}/night`);
            console.log(`   👥 Capacity: ${capacity} people`);
            console.log(`   📅 Booked: ${peopleBooked} people (${bookingPercentage}%)`);
            console.log(`   🆓 Available: ${availableSpots} spots`);
            console.log('');
        }
        
        console.log(`🎉 Successfully updated ${updatedCount} campgrounds with booking data!`);
        console.log('\n📈 Summary:');
        
        // Get updated statistics
        const stats = await Campground.aggregate([
            {
                $group: {
                    _id: null,
                    avgCapacity: { $avg: '$capacity' },
                    minCapacity: { $min: '$capacity' },
                    maxCapacity: { $max: '$capacity' },
                    avgBooked: { $avg: '$peopleBooked' },
                    totalCapacity: { $sum: '$capacity' },
                    totalBooked: { $sum: '$peopleBooked' }
                }
            }
        ]);
        
        if (stats.length > 0) {
            const stat = stats[0];
            const overallBookingPercentage = Math.round((stat.totalBooked / stat.totalCapacity) * 100);
            
            console.log(`   📊 Average capacity: ${Math.round(stat.avgCapacity)} people`);
            console.log(`   📊 Capacity range: ${stat.minCapacity} - ${stat.maxCapacity} people`);
            console.log(`   📊 Average booked: ${Math.round(stat.avgBooked)} people`);
            console.log(`   📊 Overall booking rate: ${overallBookingPercentage}%`);
        }
        
    } catch (error) {
        console.error('❌ Error populating booking data:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔐 Database connection closed');
        process.exit(0);
    }
};

// Run the script
if (require.main === module) {
    populateBookingData();
}

module.exports = { populateBookingData, generateCapacity, generatePeopleBooked }; 