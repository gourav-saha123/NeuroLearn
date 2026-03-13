const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const aiTutorRoutes = require('./routes/aiTutorRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/lesson', lessonRoutes);
app.use('/api/tutor', aiTutorRoutes);

// Error Handling
app.use(errorMiddleware);

module.exports = app;
