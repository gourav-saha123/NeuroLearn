const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
// We use gemini-1.5-pro or gemini-flash because it needs to output JSON reliably and reason over multi-modal data.
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

module.exports = {
  calculateConfusionScore: async (telemetryData) => {
    const prompt = `You are an AI specialized in analyzing human behavior to determine user confusion, frustration, or hesitation while using a web application.
    
    You will be provided with a JSON object containing the user's recent telemetry data:
    1. mouseData: Information about mouse movements (e.g., erratic movements, hesitation, unstructured hovering).
    2. scrollData: Information about scrolling patterns (e.g., rapid scrolling up and down, reading speed).
    3. faceEmotion: The predominant detected facial emotion (e.g., 'sad', 'angry', 'depressed', 'neutral', 'happy').

    Based on this data, you must calculate a "confusion_score" from 0 to 100, where 0 means completely clear and focused, and 100 means highly confused, frustrated, or lost.
    
    You must return ONLY a JSON object with this exact structure, with no markdown formatting or extra text:
    {
      "confusion_score": <number>,
      "reasoning": "<string explaining why you gave this score based on the inputs>"
    }
    
    User Telemetry Data:
    ${JSON.stringify(telemetryData, null, 2)}`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('Confusion AI Raw Response:', text);
      
      // Attempt to parse the JSON block in case the model adds markdown formatting like \`\`\`json
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error in confusionService:', error);
      throw new Error('Failed to analyze confusion telemetry data using AI.');
    }
  }
};
