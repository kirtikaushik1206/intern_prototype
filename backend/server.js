// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models prioritized by quota availability and performance
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];

// System instruction defining Chef persona and strict topic guardrails
const CHEF_SYSTEM_INSTRUCTION = `
You are Chef Pierre, an elite and passionate professional master chef with years of executive kitchen experience.

Strict Core Rules:
1. IDENTITY & ROLE:
   If the user asks who you are, what your role is, or asks if you are a chef (e.g., "who are you?", "are you a chef or something?"), warmly and proudly confirm that you are indeed an elite professional chef, and invite them to cook something delicious with you.

2. CULINARY EXPERTISE:
   When the user asks about food, recipes, cooking techniques, ingredients, flavor profiles, seasonings, or culinary equipment, answer with authentic chef expertise, practical kitchen secrets, and mouth-watering descriptions.

3. STRICT OFF-TOPIC GUARDRAIL:
   You ONLY answer questions related to food, cooking, recipes, ingredients, culinary arts, and dining. If the user asks about any non-culinary topic (such as technology, coding, sports, politics, math, general trivia, weather, etc.), politely decline and firmly request that they bring the conversation back to food and the kitchen. (For example: "My expertise is strictly in the kitchen! Let us stay focused on culinary topics. What dish or recipe can I help you prepare today?")

4. VOICE & TTS READINESS:
   - Your responses are spoken aloud via browser text-to-speech.
   - Keep answers concise, natural, and conversational (1 to 2 sentences maximum).
   - DO NOT use markdown syntax (no asterisks, no bullet points, no bold, no headers) and NO emojis, so the text speaks smoothly without odd symbols.
`.trim();

// Map to store conversation histories per socket connection
const conversationHistories = new Map();

/**
 * Clean up text for natural text-to-speech output
 * Strips markdown asterisks, hashes, backticks, and emojis
 */
function sanitizeForVoice(text) {
  if (!text) return "";
  return text
    .replace(/[*#_~`>]/g, '') // remove markdown formatting symbols
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Process client input with the Chef AI model using multi-model fallback
 */
async function getChefResponse(socketId, userText) {
  if (!userText || !userText.trim()) {
    return "I am listening! Tell me what dish or ingredient is on your mind.";
  }

  // Get or initialize socket conversation history
  if (!conversationHistories.has(socketId)) {
    conversationHistories.set(socketId, []);
  }
  const history = conversationHistories.get(socketId);

  // Prepare current contents payload
  const currentTurn = { role: 'user', parts: [{ text: userText.trim() }] };
  const contents = [...history, currentTurn];

  let lastError = null;

  // Try candidate models with automatic failover
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: CHEF_SYSTEM_INSTRUCTION,
        }
      });

      const replyRaw = response?.text?.trim();
      if (replyRaw) {
        const cleanReply = sanitizeForVoice(replyRaw);

        // Update history (keep last 10 turns to avoid token overflow)
        history.push(currentTurn);
        history.push({ role: 'model', parts: [{ text: cleanReply }] });
        if (history.length > 10) {
          history.splice(0, history.length - 10);
        }

        return cleanReply;
      }
    } catch (err) {
      console.warn(`[Model ${model} unavailable]:`, err?.status || err?.message?.slice(0, 80));
      lastError = err;
      // Continue to next available model
    }
  }

  console.error(`[All models failed for socket ${socketId}]:`, lastError?.message || lastError);
  return "Pardon me, the kitchen got a bit noisy! Could you please repeat that culinary question?";
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for the voice transcript sent from React
  socket.on('chat message', async (text) => {
    console.log(`[Socket ${socket.id}] User asked:`, text);

    // Get response from our Chef AI
    const botReply = await getChefResponse(socket.id, text);
    console.log(`[Socket ${socket.id}] Chef replied:`, botReply);

    // Emit the reply back to the specific client browser
    socket.emit('bot reply', botReply);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    conversationHistories.delete(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Chef Backend server running on http://localhost:${PORT}`);
});