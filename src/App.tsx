import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Pricing from './pages/Pricing';

// Video Tools
import VideoToGif from './pages/tools/VideoToGif';
import GifConverter from './pages/tools/GifConverter';
import VideoCompressor from './pages/tools/VideoCompressor';
import ReverseVideo from './pages/tools/ReverseVideo';
import SpeedVideo from './pages/tools/SpeedVideo';
import VideoTrim from './pages/tools/VideoTrim';
import VideoMerge from './pages/tools/VideoMerge';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Video Tools */}
          <Route path="/tools/video-to-gif" element={<VideoToGif />} />
          <Route path="/tools/gif-converter" element={<GifConverter />} />
          <Route path="/tools/video-compressor" element={<VideoCompressor />} />
          <Route path="/tools/reverse-video" element={<ReverseVideo />} />
          <Route path="/tools/speed-video" element={<SpeedVideo />} />
          <Route path="/tools/video-trim" element={<VideoTrim />} />
          <Route path="/tools/video-merge" element={<VideoMerge />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;