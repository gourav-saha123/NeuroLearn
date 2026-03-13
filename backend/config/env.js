require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URL, // Updated to match .env
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY
};
