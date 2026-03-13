const confusionService = require('../services/confusionService');

module.exports = {
  analyze: async (req, res) => {
    try {
      const { mouseData, scrollData, faceEmotion } = req.body;
      
      // Basic validation
      if (!mouseData && !scrollData && !faceEmotion) {
        return res.status(400).json({ error: 'Please provide at least some telemetry data (mouseData, scrollData, or faceEmotion).' });
      }

      const telemetryData = {
        mouseData: mouseData || {},
        scrollData: scrollData || {},
        faceEmotion: faceEmotion || 'neutral'
      };

      const result = await confusionService.calculateConfusionScore(telemetryData);
      res.json(result);
    } catch (err) {
      console.error('Confusion Controller Error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};
