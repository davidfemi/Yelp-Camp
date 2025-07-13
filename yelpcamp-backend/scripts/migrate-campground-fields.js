require('dotenv').config();
const mongoose = require('mongoose');
const Campground = require('../models/campground');

// Database connection
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/myFirstDatabase';

async function migrateCampgroundFields() {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose.connect(dbUrl);
        console.log('✅ Database connected');

        // Find all campgrounds to check their current state
        const allCampgrounds = await Campground.find({}).select('title price capacity peopleBooked');
        console.log(`📊 Total campgrounds in database: ${allCampgrounds.length}`);

        // Identify campgrounds missing required fields
        const campgroundsToUpdate = allCampgrounds.filter(campground => 
            campground.capacity === undefined || 
            campground.capacity === null || 
            campground.peopleBooked === undefined || 
            campground.peopleBooked === null
        );

        console.log(`📊 Found ${campgroundsToUpdate.length} campgrounds that need field updates`);

        if (campgroundsToUpdate.length === 0) {
            console.log('✅ All campgrounds already have required fields');
            return;
        }

        // Show sample of what's missing
        console.log('Sample campground field status:');
        campgroundsToUpdate.slice(0, 3).forEach(camp => {
            console.log(`  - "${camp.title}": capacity=${camp.capacity}, peopleBooked=${camp.peopleBooked}`);
        });

        let updatedCount = 0;

        // Process campgrounds in batches for better performance
        const batchSize = 50;
        for (let i = 0; i < campgroundsToUpdate.length; i += batchSize) {
            const batch = campgroundsToUpdate.slice(i, i + batchSize);
            
            for (const campground of batch) {
                const updates = {};
                
                // Set default capacity if missing
                if (campground.capacity === undefined || campground.capacity === null) {
                    // Generate realistic capacity based on price and title
                    const baseCapacity = 50;
                    let capacityModifier = 1;
                    
                    // Higher priced campgrounds tend to have lower capacity (more exclusive)
                    if (campground.price > 100) capacityModifier = 0.6;
                    else if (campground.price > 50) capacityModifier = 0.8;
                    else if (campground.price < 20) capacityModifier = 1.3;
                    
                    // Adjust based on title keywords
                    const titleLower = (campground.title || '').toLowerCase();
                    if (titleLower.includes('luxury') || titleLower.includes('premium')) capacityModifier *= 0.5;
                    else if (titleLower.includes('family') || titleLower.includes('group')) capacityModifier *= 1.5;
                    else if (titleLower.includes('backcountry') || titleLower.includes('remote')) capacityModifier *= 0.7;
                    else if (titleLower.includes('rv') || titleLower.includes('resort')) capacityModifier *= 1.8;
                    
                    const finalCapacity = Math.round(baseCapacity * capacityModifier);
                    updates.capacity = Math.max(10, Math.min(500, finalCapacity));
                }
                
                // Set default peopleBooked if missing
                if (campground.peopleBooked === undefined || campground.peopleBooked === null) {
                    // Generate realistic booking numbers (30-80% of capacity)
                    const capacity = updates.capacity || campground.capacity || 50;
                    const bookingPercentage = 0.3 + Math.random() * 0.5; // 30-80%
                    updates.peopleBooked = Math.floor(capacity * bookingPercentage);
                }

                if (Object.keys(updates).length > 0) {
                    try {
                        await Campground.findByIdAndUpdate(
                            campground._id, 
                            { $set: updates },
                            { new: true }
                        );
                        updatedCount++;
                        
                        if (updatedCount <= 5) { // Show first 5 updates
                            console.log(`✅ Updated "${(campground.title || 'Untitled').substring(0, 30)}...":`, updates);
                        } else if (updatedCount % 50 === 0) { // Progress indicator
                            console.log(`📈 Progress: ${updatedCount}/${campgroundsToUpdate.length} campgrounds updated`);
                        }
                    } catch (updateError) {
                        console.error(`❌ Failed to update campground ${campground._id}:`, updateError.message);
                    }
                }
            }
        }

        console.log(`🎉 Migration completed! Updated ${updatedCount} campgrounds`);

        // Verify the migration
        const verifyCount = await Campground.countDocuments({
            capacity: { $exists: true, $ne: null, $gte: 1 },
            peopleBooked: { $exists: true, $ne: null, $gte: 0 }
        });
        
        const totalCampgrounds = await Campground.countDocuments();
        console.log(`✅ Verification: ${verifyCount}/${totalCampgrounds} campgrounds have required fields`);

        if (verifyCount < totalCampgrounds) {
            console.log('⚠️ Some campgrounds may still need manual review');
        }

    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔚 Database connection closed');
        process.exit(0);
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateCampgroundFields();
}

module.exports = { migrateCampgroundFields }; 