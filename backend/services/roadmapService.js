const aiService = require('./aiService');
const Roadmap = require('../models/Roadmap');
const youtubeService = require('./youtubeService');

module.exports = {
  createRoadmap: async (topic, userId) => {
    const subtopicNames = await aiService.generateRoadmap(topic);
    
    // Fetch video for each subtopic
    const subtopics = await Promise.all(subtopicNames.map(async (name) => {
      const video = await youtubeService.fetchVideo(`${name} ${topic}`);
      return {
        name,
        videoUrl: video.url,
        videoTitle: video.title
      };
    }));

    const roadmap = new Roadmap({ topic, subtopics, createdBy: userId });
    return await roadmap.save();
  }
};
