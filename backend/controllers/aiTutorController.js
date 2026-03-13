const aiService = require('../services/aiService');

module.exports = {
  ask: async (req, res) => {
    try {
      const response = await aiService.askTutor(req.body.question);
      res.json({ response });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
