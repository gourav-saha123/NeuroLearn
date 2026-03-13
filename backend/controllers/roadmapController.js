const roadmapService = require('../services/roadmapService');

module.exports = {
  generate: async (req, res) => {
    try {
      const roadmap = await roadmapService.createRoadmap(req.body.topic, req.user?.id);
      res.json(roadmap);
    } catch (err) {
      console.error('Roadmap Controller Error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};
