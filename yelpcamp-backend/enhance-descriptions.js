require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Campground = require('./models/campground');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting configuration
const RATE_LIMIT = {
    REQUESTS_PER_MINUTE: 15,
    BATCH_SIZE: 10, // Process 10 campgrounds per batch
    DELAY_BETWEEN_REQUESTS: 4500, // 4.5 seconds between requests (15 requests/minute = 4 seconds, adding buffer)
    DELAY_BETWEEN_BATCHES: 60000, // 1 minute between batches
    MAX_RETRIES: 3
};

// Enhanced description generator with retry logic
const generateEnhancedDescription = async (campground, index = 0, retryCount = 0) => {
    if (!genAI) {
        console.log('❌ No Gemini API key found. Skipping enhancement.');
        return campground.description;
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.9,
                topP: 0.9,
                topK: 50,
                maxOutputTokens: 500, // Increased for 300-word descriptions
            }
        });

        // Updated prompt templates for ~300 word descriptions
        const promptTemplates = [
            // Template 1: Adventure-focused
            `Write a compelling 300-word campground description for adventurers visiting:

Campground: ${campground.title}
Location: ${campground.location}
Nightly Rate: $${campground.price}
Current Info: ${campground.description}

Create exactly 3 paragraphs (~100 words each):
1. Opening paragraph: Set the scene with vivid imagery of the landscape and atmosphere
2. Middle paragraph: Focus on outdoor adventures, hiking trails, wildlife encounters, and activities
3. Closing paragraph: Describe evening experiences - campfires, stargazing, and the peaceful night atmosphere

Use sensory details and make it feel like an escape into nature's playground. Target exactly 300 words.`,

            // Template 2: Family-focused
            `Create a welcoming 300-word family campground description for:

Name: ${campground.title}
Where: ${campground.location}
Cost: $${campground.price} per night
Background: ${campground.description}

Structure as 3 paragraphs (~100 words each):
1. Welcome families with descriptions of safe, spacious camping areas and family-friendly amenities
2. Detail activities for all ages - playgrounds, nature walks, educational opportunities, swimming areas
3. Emphasize memory-making moments - family campfires, storytelling, children's laughter mixing with nature sounds

Focus on creating lasting memories together. Target exactly 300 words.`,

            // Template 3: Romantic/Couples-focused
            `Craft a romantic 300-word getaway description for this campground:

Destination: ${campground.title}
Setting: ${campground.location}
Price: $${campground.price}/night
Details: ${campground.description}

Write 3 romantic paragraphs (~100 words each):
1. Set a romantic scene with secluded spots, beautiful views, and intimate atmosphere
2. Describe romantic activities - sunrise hikes, quiet picnics, photography opportunities
3. Focus on evening romance - starlit dinners, cozy campfires for two, peaceful nights together

Use romantic, peaceful language that appeals to couples seeking quality time. Target exactly 300 words.`,

            // Template 4: Nature/Wildlife-focused
            `Describe this 300-word nature lover's paradise:

Campground: ${campground.title}
Region: ${campground.location}
Fee: $${campground.price} nightly
Info: ${campground.description}

Create 3 nature-focused paragraphs (~100 words each):
1. Describe the ecosystem, native plants, and natural features of the area
2. Detail wildlife viewing opportunities, bird watching, and seasonal natural phenomena
3. Explain conservation efforts, Leave No Trace principles, and connecting with nature

Make readers feel the deep connection to the natural world. Target exactly 300 words.`,

            // Template 5: Relaxation/Retreat-focused
            `Write a 300-word description of this peaceful retreat destination:

Haven: ${campground.title}
Located: ${campground.location}
Rate: $${campground.price} per night
Current: ${campground.description}

Structure as 3 calming paragraphs (~100 words each):
1. Describe the tranquil setting and stress-relieving atmosphere
2. Detail relaxation activities - meditation spots, quiet reading areas, gentle nature walks
3. Focus on digital detox, mental wellness, and the healing power of nature

Emphasize tranquility and disconnecting from daily life. Target exactly 300 words.`,

            // Template 6: Explorer/Discovery-focused
            `Create a 300-word explorer's guide to:

Discovery: ${campground.title}
Territory: ${campground.location}
Investment: $${campground.price} nightly
Background: ${campground.description}

Write 3 discovery-themed paragraphs (~100 words each):
1. Introduce the area's unique geological features and hidden gems
2. Detail exploration opportunities - secret trails, historical sites, local legends
3. Describe the sense of adventure and discoveries that await visitors

Make it sound like a place where adventures await around every corner. Target exactly 300 words.`
        ];

        // Select template based on index for variety
        const templateIndex = (index + Math.floor(Math.random() * 3)) % promptTemplates.length;
        const selectedPrompt = promptTemplates[templateIndex];

        // Add location-specific guidance
        const locationBasedAdditions = [
            "Include specific geographical features that make this location unique.",
            "Mention regional weather patterns and seasonal camping conditions.",
            "Reference local culture, history, and nearby attractions.",
            "Describe the landscape's unique characteristics and natural beauty.",
            "Focus on the area's distinctive sounds, scents, and atmosphere.",
            "Highlight what makes this location different from other campgrounds."
        ];

        const randomAddition = locationBasedAdditions[Math.floor(Math.random() * locationBasedAdditions.length)];
        const finalPrompt = `${selectedPrompt}\n\nAdditional guidance: ${randomAddition}\n\nIMPORTANT: Write exactly 300 words. Avoid generic camping phrases. Make each sentence specific to this location and experience.`;

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const enhancedText = response.text();
        
        // Clean up formatting and ensure it's a reasonable length
        const cleanedText = enhancedText.replace(/\*\*/g, '').replace(/\*/g, '').trim();
        return cleanedText;

    } catch (error) {
        // Handle rate limiting with exponential backoff
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            if (retryCount < RATE_LIMIT.MAX_RETRIES) {
                const waitTime = Math.pow(2, retryCount) * 30000; // 30s, 60s, 120s
                console.log(`⏳ Rate limit hit for ${campground.title}. Waiting ${waitTime/1000}s before retry ${retryCount + 1}/${RATE_LIMIT.MAX_RETRIES}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return generateEnhancedDescription(campground, index, retryCount + 1);
            } else {
                console.error(`❌ Max retries exceeded for ${campground.title}. Using fallback.`);
                return campground.description;
            }
        }
        
        console.error(`❌ Gemini AI error for ${campground.title}:`, error.message);
        return campground.description; // Fallback to original
    }
};

// Process campgrounds in batches
const processBatch = async (batch, batchNumber, totalBatches) => {
    console.log(`\n🔄 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} campgrounds)`);
    console.log(`📊 Campgrounds: ${batch.map(c => c.title).join(', ')}`);
    
    let enhanced = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < batch.length; i++) {
        const campground = batch[i];
        console.log(`\n   🏕️  [${i + 1}/${batch.length}] Processing: ${campground.title}`);
        
        try {
            // Generate enhanced description
            const enhancedDescription = await generateEnhancedDescription(campground, i);
            
            // Check if description was actually enhanced (different from original)
            if (enhancedDescription !== campground.description) {
                // Update in database
                await Campground.findByIdAndUpdate(campground._id, {
                    description: enhancedDescription
                });
                
                const wordCount = enhancedDescription.split(' ').length;
                console.log(`   ✅ Enhanced: ${campground.title} (${wordCount} words)`);
                console.log(`   📝 Preview: ${enhancedDescription.substring(0, 150)}...`);
                enhanced++;
            } else {
                console.log(`   ⏭️  Skipped: ${campground.title} (no enhancement needed)`);
                skipped++;
            }

            // Add delay between requests (except for last item in batch)
            if (i < batch.length - 1) {
                console.log(`   ⏱️  Waiting ${RATE_LIMIT.DELAY_BETWEEN_REQUESTS/1000}s before next request...`);
                await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.DELAY_BETWEEN_REQUESTS));
            }
            
        } catch (error) {
            console.error(`   ❌ Error processing ${campground.title}:`, error.message);
            errors++;
        }
    }

    return { enhanced, skipped, errors };
};

// Main enhancement function with batching
const enhanceAllDescriptions = async () => {
    try {
        // Connect to database
        const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp';
        await mongoose.connect(dbUrl);
        console.log('✅ Connected to database');

        // Get all campgrounds
        const campgrounds = await Campground.find({});
        console.log(`📊 Found ${campgrounds.length} campgrounds to enhance`);

        if (!process.env.GEMINI_API_KEY) {
            console.log('❌ GEMINI_API_KEY not found in environment variables');
            console.log('💡 Please add GEMINI_API_KEY to your .env file');
            process.exit(1);
        }

        // Create batches
        const batches = [];
        for (let i = 0; i < campgrounds.length; i += RATE_LIMIT.BATCH_SIZE) {
            batches.push(campgrounds.slice(i, i + RATE_LIMIT.BATCH_SIZE));
        }

        console.log(`\n🔄 Processing ${campgrounds.length} campgrounds in ${batches.length} batches of ${RATE_LIMIT.BATCH_SIZE}`);
        console.log(`⏱️  Rate limiting: ${RATE_LIMIT.DELAY_BETWEEN_REQUESTS/1000}s between requests, ${RATE_LIMIT.DELAY_BETWEEN_BATCHES/1000}s between batches`);

        let totalEnhanced = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        // Process each batch
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            const results = await processBatch(batch, batchIndex + 1, batches.length);
            
            totalEnhanced += results.enhanced;
            totalSkipped += results.skipped;
            totalErrors += results.errors;

            console.log(`\n📊 Batch ${batchIndex + 1} Summary:`);
            console.log(`   ✅ Enhanced: ${results.enhanced}`);
            console.log(`   ⏭️  Skipped: ${results.skipped}`);
            console.log(`   ❌ Errors: ${results.errors}`);

            // Add delay between batches (except for last batch)
            if (batchIndex < batches.length - 1) {
                console.log(`\n⏳ Waiting ${RATE_LIMIT.DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
                await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.DELAY_BETWEEN_BATCHES));
            }
        }

        // Final summary
        console.log('\n🎉 Enhancement Complete!');
        console.log('==========================================');
        console.log(`✅ Total Enhanced: ${totalEnhanced} campgrounds`);
        console.log(`⏭️  Total Skipped: ${totalSkipped} campgrounds`);
        console.log(`❌ Total Errors: ${totalErrors} campgrounds`);
        console.log(`📊 Success Rate: ${Math.round((totalEnhanced / campgrounds.length) * 100)}%`);
        
        await mongoose.connection.close();
        console.log('📊 Database connection closed');
        
    } catch (error) {
        console.error('❌ Script error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🤖 Batched Campground Description Enhancement Script');
console.log('==================================================');
console.log('This script will enhance ALL campground descriptions using Gemini AI.');
console.log('📝 Each description will be approximately 300 words.');
console.log('⚡ Processing in batches to respect API rate limits (15 requests/minute).');
console.log('⏱️  Estimated time: ~4-5 minutes per batch of 10 campgrounds.');
console.log('⚠️  This will permanently modify your database.');
console.log('');

rl.question('Do you want to continue? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        rl.close();
        enhanceAllDescriptions();
    } else {
        console.log('❌ Operation cancelled');
        rl.close();
        process.exit(0);
    }
}); 