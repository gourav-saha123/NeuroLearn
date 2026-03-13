const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  subtopics: [{
    name: String,
    videoUrl: String,
    videoTitle: String
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
