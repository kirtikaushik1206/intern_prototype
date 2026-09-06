import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

export function VoiceChatBot() {
  const [transcript, setTranscript] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('bot reply', (replyText) => {
      setBotResponse(replyText);
      generateVoiceReply(replyText);
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      socketRef.current.emit('chat message', speechToText);
    };

    recognitionRef.current = recognition;

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateVoiceReply = (text) => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setBotResponse('');
      recognitionRef.current.start();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 antialiased selection:bg-neutral-800 w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md flex flex-col items-center text-center"
      >
        <h1 className="text-2xl sm:text-3xl tracking-tight text-neutral-100 font-semibold">
          Chef Voice Agent
        </h1>
        <p className="text-sm text-neutral-400 mt-2 mb-10">
          Ask me anything about food!
        </p>

        {/* Minimalist Button with Framer Motion and Lucide Icon */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence>
            {isListening && (
              <>
                <motion.span
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: 1.45, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-neutral-400"
                />
                <motion.span
                  initial={{ scale: 0.9, opacity: 0.3 }}
                  animate={{ scale: 1.75, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-neutral-600"
                />
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleMicClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            aria-label={isListening ? "Stop listening" : "Start talking"}
            className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center gap-1.5 transition-colors duration-300 shadow-xl cursor-pointer ${
              isListening
                ? 'bg-neutral-100 text-neutral-950'
                : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white'
            }`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
            <span className="text-xs font-medium tracking-wide">
              {isListening ? 'Listening' : 'Talk'}
            </span>
          </motion.button>
        </div>

        {/* Minimal Conversation Container */}
        <motion.div
          layout
          className="mt-12 w-full rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 text-left backdrop-blur-md shadow-lg space-y-4"
        >
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-1 font-bold">
              You said
            </span>
            <p className="text-sm text-neutral-200 break-words min-h-[20px]">
              {transcript || <span className="text-neutral-600 italic">...</span>}
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-800/80">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1">
              AI Bot replied
            </span>
            <p className="text-sm text-neutral-100 font-medium break-words min-h-[20px]">
              {botResponse || <span className="text-neutral-600 italic">...</span>}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default VoiceChatBot;
