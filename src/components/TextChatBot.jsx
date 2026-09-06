import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion } from 'framer-motion';
import { Send, AlertCircle } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Initialize Google AI Studio SDK instance
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const CHEF_SYSTEM_INSTRUCTION = `
You are Chef Pierre, an elite and passionate master chef with years of executive culinary experience.
Rules:
1. Always stay in character as a knowledgeable, encouraging chef.
2. Only answer questions related to food, cooking techniques, recipes, ingredients, culinary arts, wine pairings, and dining.
3. If asked non-culinary questions, politely decline and steer the conversation back to the kitchen and food.
4. Keep responses clear, practical, appetizing, and concise (2-4 sentences or short bullet points for recipes).
`;

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

export function TextChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'chef',
      text: 'Hey! I am Chef Bot. Ask me anything about food and cooking!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Stores conversation history for Google AI Studio multi-turn chat
  const conversationHistoryRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Generates response using Google AI Studio SDK (@google/genai)
   */
  const generateChefResponse = async (userText) => {
    const currentTurn = {
      role: 'user',
      parts: [{ text: userText }]
    };

    const contents = [...conversationHistoryRef.current, currentTurn];
    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: CHEF_SYSTEM_INSTRUCTION,
            temperature: 0.7,
            maxOutputTokens: 600
          }
        });

        const replyText = response?.text?.trim();

        if (replyText) {
          // Update history for continuous conversation
          conversationHistoryRef.current.push(currentTurn);
          conversationHistoryRef.current.push({
            role: 'model',
            parts: [{ text: replyText }]
          });

          // Keep recent 10 turns
          if (conversationHistoryRef.current.length > 10) {
            conversationHistoryRef.current = conversationHistoryRef.current.slice(-10);
          }

          return replyText;
        }
      } catch (err) {
        console.warn(`[Google AI Studio Model ${model} failed]:`, err.message);
        lastError = err;
      }
    }

    // Direct REST fallback if SDK is blocked by browser restrictions
    for (const model of CANDIDATE_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: CHEF_SYSTEM_INSTRUCTION }] },
              contents,
              generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
            })
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            conversationHistoryRef.current.push(currentTurn);
            conversationHistoryRef.current.push({ role: 'model', parts: [{ text }] });
            return text;
          }
        }
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError || new Error("Failed to generate response from Google AI Studio");
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    setErrorMessage('');
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const reply = await generateChefResponse(query);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'chef',
          text: reply
        }
      ]);
    } catch (err) {
      console.error('Google AI Studio Error:', err);
      setErrorMessage(err.message || 'Error connecting to Google AI Studio');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'chef',
          text: "Pardon me! I could not retrieve that recipe right now. Please verify your internet connection or Google AI Studio key."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-neutral-800 w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg flex flex-col items-center"
      >
        {/* Minimal Header */}
        <div className="text-center mb-6">

          <h1 className="text-2xl sm:text-3xl tracking-tight text-neutral-100 font-semibold">
            Chef Bot
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Ask me anything!
          </p>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="w-full mb-3 px-3 py-2 rounded-xl bg-neutral-900 border border-red-900/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* Chat Messages Frame */}
        <div className="w-full rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-lg flex flex-col overflow-hidden">

          {/* Scrollable Message List */}
          <div className="p-4 sm:p-5 flex flex-col gap-3.5 min-h-[320px] max-h-[420px] overflow-y-auto">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 px-1">
                  {msg.sender === 'user' ? 'You' : 'Chef Pierre'}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.sender === 'user'
                    ? 'bg-neutral-100 text-neutral-950 font-medium rounded-tr-xs'
                    : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-tl-xs'
                    }`}
                >
                  <p className="m-0 break-words whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start"
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 px-1">
                  Chef Pierre
                </span>
                <div className="bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                placeholder="Ask about a recipe, flavor, or technique..."
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-neutral-600 rounded-xl py-2.5 pl-4 pr-11 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition disabled:opacity-60"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-1.5 p-2 rounded-lg bg-neutral-100 text-neutral-950 disabled:opacity-30 disabled:hover:scale-100 cursor-pointer transition"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </form>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default TextChatBot;
