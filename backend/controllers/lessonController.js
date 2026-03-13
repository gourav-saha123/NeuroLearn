const aiService = require('../services/aiService');
const youtubeService = require('../services/youtubeService');
const Lesson = require('../models/Lesson');

module.exports = {
  getLesson: async (req, res) => {
    try {
      const { topic } = req.params;
      let lesson = await Lesson.findOne({ topic });
      if (!lesson) {
        const explanation = await aiService.generateExplanation(topic);
        const video = await youtubeService.fetchVideo(topic);
        lesson = new Lesson({ topic, explanation, videoURL: video.url });
        await lesson.save();
      }
      res.json(lesson);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
