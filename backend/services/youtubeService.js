const axios = require('axios');
const env = require('../config/env');

module.exports = {
  fetchVideo: async (topic) => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: `${topic} tutorial`,
          maxResults: 1,
          type: 'video',
          key: env.YOUTUBE_API_KEY
        }
      });

      const video = response.data.items[0];
      if (!video) throw new Error('No video found');

      return {
        title: video.snippet.title,
        url: `https://www.youtube.com/embed/${video.id.videoId}`,
        thumbnail: video.snippet.thumbnails.high.url
      };
    } catch (err) {
      console.error('YouTube API Error:', err.message);
      return {
        title: 'Video not available',
        url: '',
        thumbnail: ''
      };
    }
  }
};
