const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mouseData: [{ x: Number, y: Number, timestamp: Number }],
  scrollData: [{ position: Number, timestamp: Number }],
  readingTime: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interaction', interactionSchema);
