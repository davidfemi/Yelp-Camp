require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('./models/product');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting configuration
const RATE_LIMIT = {
    REQUESTS_PER_MINUTE: 15,
    DELAY_BETWEEN_REQUESTS: 4500, // 4.5 seconds between requests
    MAX_RETRIES: 3
};

// Enhanced product description generator
const generateEnhancedProductDescription = async (product, retryCount = 0) => {
    if (!genAI) {
        console.log('❌ No Gemini API key found. Skipping enhancement.');
        return product.description;
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                topK: 50,
                maxOutputTokens: 400,
            }
        });

        // Category-specific prompt templates
        const promptTemplates = {
            apparel: `Create a compelling product description for this camping apparel item:

Product: ${product.name}
Category: ${product.category}
Price: $${product.price}
Current Description: ${product.description}

Write a 150-200 word description that:
1. Emphasizes comfort and durability for outdoor activities
2. Highlights practical features for camping, hiking, and outdoor adventures
3. Mentions quality materials and construction
4. Creates an emotional connection to outdoor experiences
5. Includes specific use cases (campfire evenings, trail hiking, etc.)

Make it feel premium and adventure-ready while being practical and informative.`,

            drinkware: `Write an engaging product description for this camping drinkware:

Product: ${product.name}
Category: ${product.category}
Price: $${product.price}
Current Description: ${product.description}

Create a 150-200 word description that:
1. Emphasizes durability and functionality for outdoor use
2. Highlights temperature retention or practical features
3. Mentions materials and construction quality
4. Connects to camping experiences (morning coffee, trail hydration, etc.)
5. Includes specific outdoor use scenarios

Focus on how this enhances the camping and outdoor experience.`,

            accessories: `Create an appealing product description for this camping accessory:

Product: ${product.name}
Category: ${product.category}
Price: $${product.price}
Current Description: ${product.description}

Write a 150-200 word description that:
1. Emphasizes practicality and usefulness for outdoor activities
2. Highlights unique features and quality construction
3. Mentions specific outdoor scenarios where it's valuable
4. Creates connection to adventure and exploration
5. Includes durability and reliability aspects

Make it feel like an essential companion for outdoor adventures.`,

            stationery: `Write a compelling product description for this outdoor-themed stationery:

Product: ${product.name}
Category: ${product.category}
Price: $${product.price}
Current Description: ${product.description}

Create a 150-200 word description that:
1. Connects to outdoor journaling and memory-keeping
2. Emphasizes quality and durability for outdoor use
3. Mentions specific camping and adventure use cases
4. Highlights the importance of documenting outdoor experiences
5. Creates emotional connection to adventure memories

Focus on how this helps capture and preserve outdoor adventures.`
        };

        const prompt = promptTemplates[product.category] || promptTemplates.accessories;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let enhancedText = response.text();

        // Clean up formatting and ensure reasonable length
        enhancedText = enhancedText
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s*/g, '')
            .trim();

        // Ensure description isn't too long (max 300 words)
        const words = enhancedText.split(' ');
        if (words.length > 300) {
            enhancedText = words.slice(0, 300).join(' ') + '...';
        }

        // Ensure minimum length (at least 100 words)
        if (words.length < 100) {
            console.log(`⚠️  Generated description for ${product.name} is too short, keeping original`);
            return product.description;
        }

        return enhancedText;

    } catch (error) {
        // Handle rate limiting with exponential backoff
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            if (retryCount < RATE_LIMIT.MAX_RETRIES) {
                const waitTime = Math.pow(2, retryCount) * 30000; // 30s, 60s, 120s
                console.log(`⏳ Rate limit hit for ${product.name}. Waiting ${waitTime/1000}s before retry ${retryCount + 1}/${RATE_LIMIT.MAX_RETRIES}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return generateEnhancedProductDescription(product, retryCount + 1);
            } else {
                console.error(`❌ Max retries exceeded for ${product.name}. Using original description.`);
                return product.description;
            }
        }
        
        console.error(`❌ Gemini AI error for ${product.name}:`, error.message);
        return product.description; // Fallback to original
    }
};

// Add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main enhancement function
const enhanceAllProductDescriptions = async () => {
    try {
        // Connect to database
        const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/myFirstDatabase';
        await mongoose.connect(dbUrl);
        console.log('✅ Connected to database');

        // Get all products
        const products = await Product.find({});
        console.log(`📊 Found ${products.length} products to enhance`);

        if (!process.env.GEMINI_API_KEY) {
            console.log('❌ GEMINI_API_KEY not found in environment variables');
            console.log('💡 Please add GEMINI_API_KEY to your .env file');
            process.exit(1);
        }

        console.log(`\n🔄 Processing ${products.length} products`);
        console.log(`⏱️  Rate limiting: ${RATE_LIMIT.DELAY_BETWEEN_REQUESTS/1000}s between requests`);

        let totalEnhanced = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            
            console.log(`\n[${i + 1}/${products.length}] Processing: ${product.name}`);
            console.log(`Category: ${product.category} | Price: $${product.price}`);
            console.log(`Current description: ${product.description.substring(0, 100)}...`);

            try {
                // Check if description seems already enhanced (longer than 200 chars and detailed)
                if (product.description.length > 200 && 
                    (product.description.includes('perfect for') || 
                     product.description.includes('outdoor') || 
                     product.description.includes('adventure'))) {
                    console.log('⏭️  Description appears already enhanced, skipping');
                    totalSkipped++;
                    continue;
                }

                // Generate enhanced description
                const enhancedDescription = await generateEnhancedProductDescription(product);
                
                if (enhancedDescription !== product.description) {
                    // Update product in database
                    await Product.findByIdAndUpdate(product._id, {
                        description: enhancedDescription
                    });
                    
                    console.log('✅ Enhanced description generated and saved');
                    console.log(`New description: ${enhancedDescription.substring(0, 150)}...`);
                    totalEnhanced++;
                } else {
                    console.log('⚠️  No enhancement generated, keeping original');
                    totalSkipped++;
                }

                // Add delay between requests to respect rate limits
                if (i < products.length - 1) {
                    await delay(RATE_LIMIT.DELAY_BETWEEN_REQUESTS);
                }

            } catch (error) {
                console.error(`❌ Error processing ${product.name}:`, error.message);
                totalErrors++;
            }
        }

        // Final statistics
        console.log('\n' + '='.repeat(60));
        console.log('📊 ENHANCEMENT COMPLETE!');
        console.log('='.repeat(60));
        console.log(`✅ Enhanced: ${totalEnhanced} products`);
        console.log(`⏭️  Skipped: ${totalSkipped} products`);
        console.log(`❌ Errors: ${totalErrors} products`);
        console.log(`📦 Total processed: ${products.length} products`);
        
        if (totalEnhanced > 0) {
            console.log('\n🎉 Product descriptions have been enhanced with engaging, adventure-focused content!');
            console.log('💡 Enhanced descriptions now include:');
            console.log('   • Outdoor adventure themes');
            console.log('   • Quality and durability emphasis');
            console.log('   • Specific camping use cases');
            console.log('   • Emotional connection to outdoor experiences');
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Product Description Enhancement Script');
console.log('=====================================');
console.log('This script will enhance ALL product descriptions using Gemini AI.');
console.log('It will generate engaging, adventure-focused descriptions for camping merchandise.');
console.log('');
console.log('Features:');
console.log('• Category-specific descriptions (apparel, drinkware, accessories, stationery)');
console.log('• Outdoor adventure themes and use cases');
console.log('• Quality and durability emphasis');
console.log('• Emotional connection to camping experiences');
console.log('• Rate limiting to respect API limits');
console.log('');

rl.question('Do you want to proceed with enhancing product descriptions? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.close();
        enhanceAllProductDescriptions();
    } else {
        console.log('❌ Enhancement cancelled');
        rl.close();
    }
}); 