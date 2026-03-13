import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Brain, Play, X, Map } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

const LessonPage = () => {
  const { topic } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const roadmap = location.state?.roadmap || null;
  const [metrics, setMetrics] = useState({ mouse: 0, scroll: 0, read: 0, face: 0 });
  const [showTutor, setShowTutor] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hi! I'm your AI Tutor. I'll be monitoring your engagement and confusion levels to help you learn ${topic} better.` }
  ]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [readingTarget, setReadingTarget] = useState(120); // default
  const [input, setInput] = useState('');
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const playerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const metricsRef = useRef({ 
    mouseMovements: [], scrollBacktracks: 0, lastScrollTop: 0, totalReadTime: 0, lastTick: Date.now(), prevFrameData: null
  });

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/${encodeURIComponent(topic)}`);
        setLesson(res.data);
        const wordCount = res.data.explanation?.split(' ').length || 500;
        setReadingTarget(Math.max(30, (wordCount / 150) * 60)); 
      } catch (err) {
        console.error('Error fetching lesson:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [topic]);

  useEffect(() => {
    if (!lesson?.videoURL) return;
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    const initPlayer = () => {
      const videoId = lesson.videoURL.split('/').pop().split('?')[0];
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: videoId,
        events: {
          onStateChange: (event) => {
            setIsVideoPlaying(event.data === window.YT.PlayerState.PLAYING);
          }
        }
      });
    };
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [lesson]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      metricsRef.current.mouseMovements.push({ x: e.clientX, y: e.clientY, time: now });
      if (metricsRef.current.mouseMovements.length > 50) metricsRef.current.mouseMovements.shift();
    };
    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st < metricsRef.current.lastScrollTop - 50) {
        metricsRef.current.scrollBacktracks += 1;
      }
      metricsRef.current.lastScrollTop = st <= 0 ? 0 : st;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - metricsRef.current.lastTick) / 1000;
      metricsRef.current.lastTick = now;

      let mouseScore = 0;
      if (metricsRef.current.mouseMovements.length > 10) {
        const moves = metricsRef.current.mouseMovements;
        let speeds = [];
        for (let i = 1; i < moves.length; i++) {
          const d = Math.sqrt(Math.pow(moves[i].x - moves[i-1].x, 2) + Math.pow(moves[i].y - moves[i-1].y, 2));
          const t = moves[i].time - moves[i-1].time;
          if (t > 0) speeds.push(d / t);
        }
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        const variance = speeds.reduce((a, b) => a + Math.pow(b - avgSpeed, 2), 0) / speeds.length;
        mouseScore = Math.min(1, Math.sqrt(variance) * 5 + (avgSpeed < 0.2 ? 0.3 : 0));
      }

      const scrollScore = Math.min(1, metricsRef.current.scrollBacktracks / 10);
      if (!isVideoPlaying && !document.hidden) {
        metricsRef.current.totalReadTime += delta;
      }
      const readScore = Math.min(1, metricsRef.current.totalReadTime / readingTarget);

      let faceScore = metrics.face;
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        if (metricsRef.current.prevFrameData) {
          let diff = 0;
          for (let i = 0; i < currentFrame.length; i += 4) {
             diff += Math.abs(currentFrame[i] - metricsRef.current.prevFrameData[i]);
          }
          const motion = diff / (canvas.width * canvas.height);
          faceScore = Math.min(1, motion / 10); 
        }
        metricsRef.current.prevFrameData = currentFrame;
      }

      setMetrics({ mouse: mouseScore, scroll: scrollScore, read: readScore, face: faceScore });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [isVideoPlaying, readingTarget, metrics.face]);

  useEffect(() => {
    let stream = null;
    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Webcam sensor blocked', err);
      }
    };
    startCam();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!input) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    try {
      const res = await api.post('/tutor/ask', { question: currentInput });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-24 text-center"><h2 className="text-2xl font-bold text-gray-500">Loading Lesson...</h2></div>;

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Left Sidebar - Roadmap */}
      {roadmap && (
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 self-start bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Map size={20} className="text-blue-600" /> Roadmap
          </h3>
          <div className="space-y-4">
            {roadmap.chapters.map((chapter, i) => (
              <div key={i} className="mb-2">
                <h4 className="text-sm font-bold text-gray-900 mb-2 whitespace-nowrap overflow-hidden text-ellipsis" title={chapter.title}>
                  {chapter.title}
                </h4>
                <div className="space-y-1 pl-2 border-l-2 border-gray-100">
                  {chapter.subtopics.map((sub, j) => (
                    <div 
                      key={j}
                      onClick={() => navigate(`/lesson/${encodeURIComponent(sub)}`, { state: { roadmap } })}
                      className={`text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        sub === topic 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{topic}</h1>
            <nav className="text-sm font-medium text-gray-500">Roadmap &gt; {topic}</nav>
          </header>

          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-sm mb-8 relative border border-gray-200">
            {lesson?.videoURL ? (
              <div id="yt-player" className="w-full h-full"></div>
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-900 text-white">
                <Play size={48} className="text-gray-500 opacity-80" />
              </div>
            )}
          </div>

          <div className="hidden">
             <video ref={videoRef} autoPlay playsInline muted width="160" height="120" />
             <canvas ref={canvasRef} width="160" height="120" />
          </div>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Sparkles className="text-blue-600" /> AI Explanation
            </h2>
            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
              {lesson?.explanation ? (
                <ReactMarkdown>{lesson.explanation}</ReactMarkdown>
              ) : (
                'No explanation available.'
              )}
            </div>
          </section>
      </main>

      {/* Right Sidebar */}
      <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 self-start mt-8 lg:mt-0">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain size={20} className="text-blue-600" /> Cognitive Sensors
            </h3>
            
            <div className="space-y-5 mb-8">
              {[
                { label: 'Mouse Hesitation', value: metrics.mouse, color: 'bg-blue-500' },
                { label: 'Scroll Patterns', value: metrics.scroll, color: 'bg-indigo-500' },
                { label: 'Reading Progress', value: metrics.read, color: 'bg-green-500' },
                { label: 'Face Attention', value: metrics.face, color: metrics.face ? 'bg-blue-500' : 'bg-red-500' }
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5 text-xs font-semibold">
                    <span className="text-gray-500">{m.label}</span>
                    <span className="text-gray-900">{(m.value * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${m.value * 100}%` }}
                      className={`h-full ${m.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6 mb-6">
               <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-semibold text-gray-600">Aggregate Confusion</span>
                  <span className={`font-bold ${((metrics.mouse + metrics.scroll) / 2) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                    {(((metrics.mouse + metrics.scroll) / 2) * 100).toFixed(0)}%
                  </span>
               </div>
               {(metrics.mouse + metrics.scroll) / 2 > 0.5 && (
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs font-medium text-red-600 mt-2 bg-red-50 p-2 rounded-md"
                >
                  Significant hesitation detected.
                </motion.p>
              )}
            </div>

            <button 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              onClick={() => setShowTutor(true)}
            >
              <MessageSquare size={18} /> Ask AI Tutor
            </button>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showTutor && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-6 right-6 w-[340px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-[2000] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="font-bold text-gray-900">AI Tutor</span>
              <button onClick={() => setShowTutor(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`px-4 py-2.5 max-w-[85%] text-sm ${
                    m.role === 'ai' 
                      ? 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm' 
                      : 'bg-black text-white rounded-2xl rounded-tr-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAsk} className="p-4 border-t border-gray-100 bg-white flex gap-2">
              <input 
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors"
                placeholder="Ask anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Sparkles size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LessonPage;
