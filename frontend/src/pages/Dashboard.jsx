import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Map, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await api.post('/roadmap/generate', { topic });
      setRoadmap(res.data);
    } catch (err) {
      console.error('Error generating roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">What do you want to learn?</h1>
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors shadow-sm"
              placeholder="Enter a topic (e.g. Quantum Physics, Web Dev)" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <button 
            className="inline-flex justify-center items-center px-6 py-3 font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-sm whitespace-nowrap" 
            onClick={handleGenerate} 
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Build Roadmap'}
          </button>
        </div>
      </header>

      {roadmap && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Map className="text-blue-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Learning Journey: {roadmap.topic}</h2>
            </div>

            <div className="grid gap-6">
              {roadmap.chapters.map((chapter, i) => (
                <div key={i} className="p-6 border border-gray-100 rounded-xl bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                      0{i+1}
                    </span> 
                    {chapter.title}
                  </h3>
                  <div className="grid gap-3">
                    {chapter.subtopics.map((sub) => (
                      <div 
                        key={sub} onClick={() => navigate(`/lesson/${encodeURIComponent(sub)}`, { state: { roadmap } })}
                        className="group flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">{sub}</span>
                        <Play size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
