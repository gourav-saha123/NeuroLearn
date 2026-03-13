const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-flash-latest' });

module.exports = {
  generateExplanation: async (topic) => {
    const prompt = `Explain the topic "${topic}" in a way that is easy to understand for a student. Provide a clear, concise explanation with key points.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  },
  
  generateRoadmap: async (topic) => {
    const prompt = `Generate a learning roadmap for the topic "${topic}". 
    Return the response ONLY as a JSON array of strings, where each string is a subtopic.
    Do not include any markdown formatting or extra text.
    Example format: ["Subtopic 1", "Subtopic 2", "Subtopic 3"]`;
    
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('AI Roadmap Raw Response:', text);
      
      // Find JSON block in case AI adds markdown
      const jsonMatch = text.match(/\[.*\]/s);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error('AI Service Error (Roadmap):', err);
      throw err; // Re-throw to be caught by controller
    }
  },
  
  askTutor: async (question) => {
    const prompt = `You are a helpful AI Tutor. Answer the following student question concisely and accurately: "${question}"`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
};
