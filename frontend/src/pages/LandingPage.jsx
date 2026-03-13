import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, Target } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-8">
            <Sparkles size={16} />
            <span>Revolutionary AI Learning</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Master Any Skill with <span className="text-blue-600">AI Tutoring</span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The world's first learning platform that tracks your confusion in real-time and adapts its teaching style to your unique needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="inline-flex justify-center items-center px-8 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
              Get Started Free
            </Link>
            <button className="inline-flex justify-center items-center px-8 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              See How it Works
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left">
          {[
            { icon: <Brain />, title: 'Confusion Tracking', desc: 'Our AI tracks your behavioral signals to detect when you are struggling.' },
            { icon: <Zap />, title: 'Adaptive Lessons', desc: 'Lessons change dynamically based on your real-time understanding.' },
            { icon: <Target />, title: 'Custom Roadmaps', desc: 'Generate complete learning paths for any topic in seconds.' }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i }}
              className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
