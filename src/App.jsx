import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import VoiceChatBot from './components/VoiceChatBot';
import TextChatBot from './components/TextChatBot';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start antialiased selection:bg-neutral-800">
        <Navbar />
        <main className="w-full flex-1 flex flex-col items-center justify-center">
          <Routes>
            <Route path="/" element={<VoiceChatBot />} />
            <Route path="/voice" element={<VoiceChatBot />} />
            <Route path="/chat" element={<TextChatBot />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;