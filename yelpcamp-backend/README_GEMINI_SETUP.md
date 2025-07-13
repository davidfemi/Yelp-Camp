# Gemini AI Integration Setup

## Overview
This guide explains how to set up Google Gemini AI integration to automatically enhance all campground descriptions with more detailed, engaging content.

## Getting a Gemini API Key

1. **Visit Google AI Studio**: Go to [Google AI Studio](https://aistudio.google.com/)

2. **Sign in**: Use your Google account to sign in

3. **Get API Key**: 
   - Click "Get API Key" in the top right
   - Click "Create API Key in new project" or select an existing project
   - Copy the generated API key

4. **Set Environment Variable**: 
   Create a `.env` file in the `yelpcamp-backend` directory with:
   ```
   GEMINI_API_KEY=your_api_key_here
   DB_URL=mongodb://localhost:27017/yelpcamp
   SECRET=thisshouldbeabettersecret!
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

## Running the Enhancement Script

### One-Time Enhancement
To enhance all campground descriptions in your database:

```bash
cd yelpcamp-backend
npm run enhance-descriptions
```

The script will:
- Connect to your database
- Fetch all campgrounds
- Generate enhanced descriptions using Gemini AI
- Update the database with improved descriptions
- Show progress and statistics

### What the Script Does

For each campground, Gemini AI will:
- Analyze the current description, title, location, and price
- Generate 2-3 paragraphs of engaging, descriptive content
- Highlight natural features and potential activities
- Create an inviting atmosphere with descriptive language
- Keep content factual but more appealing to visitors

### Example Enhancement

**Before:**
"A nice campground in the mountains with good views."

**After:**
"Nestled among towering pine trees and granite peaks, this mountain retreat offers breathtaking panoramic views that stretch for miles across the wilderness. The campground provides an ideal base for hiking the nearby trails, where you might spot wildlife and discover hidden waterfalls cascading down moss-covered rocks. 

As evening approaches, gather around the fire pit under a canopy of stars, with the crisp mountain air carrying the scent of pine and the distant sound of a babbling creek. Whether you're seeking adventure on the hiking trails or simply want to disconnect and enjoy nature's tranquility, this campground offers the perfect blend of accessibility and wilderness experience."

## Script Features

- **Safety First**: Asks for confirmation before making changes
- **Progress Tracking**: Shows real-time progress for each campground
- **Error Handling**: Continues processing even if some descriptions fail
- **Rate Limiting**: Includes delays to respect API limits
- **Statistics**: Provides summary of enhanced, skipped, and failed descriptions
- **Fallback**: Keeps original descriptions if enhancement fails

## Security Notes

- Keep your API key secure and never commit it to version control
- The API key should only be stored in environment variables
- Consider rate limiting for production use
- The script includes built-in delays to avoid hitting API limits

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**
   - Make sure you have a `.env` file in the `yelpcamp-backend` directory
   - Verify the API key is correctly set in the `.env` file

2. **Database connection errors**
   - Ensure your database is running
   - Check the `DB_URL` in your `.env` file

3. **API rate limiting**
   - The script includes 1-second delays between requests
   - If you hit limits, wait a few minutes and try again

4. **Some descriptions not enhanced**
   - This is normal - the script will show which ones failed
   - Failed descriptions keep their original content
   - You can re-run the script to try failed ones again

## Running Multiple Times

The script is safe to run multiple times:
- It will only enhance descriptions that haven't been enhanced yet
- Already enhanced descriptions will be skipped
- No duplicate processing occurs 