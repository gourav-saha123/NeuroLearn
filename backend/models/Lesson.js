const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  explanation: { type: String },
  videoURL: { type: String },
  summary: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
