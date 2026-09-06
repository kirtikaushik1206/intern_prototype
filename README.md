# Chef AI — Culinary Voice Agent & Text Chatbot

A sleek, minimal, and responsive AI culinary assistant built with **React**, **Tailwind CSS**, **Framer Motion**, and the **Google AI Studio Gemini API**. It provides both an interactive **Voice Agent** and a **Direct Text Chatbot** tailored to recipe advice, cooking techniques, and kitchen secrets.

---

## ✨ Features

- **🎙️ Voice Agent (`/`)**:
  - Hands-free voice recognition powered by the browser's native **Web Speech API**.
  - Animated glowing voice orb with **Framer Motion** ripple waves and listening indicators.
  - Integrated speech response via **SpeechSynthesis** (Text-to-Speech).

- **💬 Chef Text Chatbot (`/chat`)**:
  - **100% Frontend-Driven**: Direct integration with the official **Google AI Studio SDK** (`@google/genai`) — no backend server required.
  - **Chef Pierre Persona**: Custom system instructions strictly focused on culinary expertise and dining guidance.
  - **Multi-turn Memory**: Preserves recent conversational context across questions.
  - **Typing Indicator**: Staggered bounce animations while waiting for Gemini's response.

- **🎨 Minimalist Monochromatic UI**:
  - Distraction-free, dark neutral aesthetic (`neutral-950`, subtle borders, frosted glass).
  - Smooth micro-interactions powered by Framer Motion.
  - Lightweight Lucide icons.

- **🚀 Client-Side Routing**:
  - Built with **React Router v7** (`react-router-dom`) with a floating pill switcher to jump between Voice and Chat seamlessly.
  - Production-ready for **Vercel** with `vercel.json` SPA rewrite rules.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | React 19, Vite |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Routing** | React Router v7 |
| **AI Engine** | Google AI Studio (`@google/genai` / Gemini 2.5 & 2.0 Flash) |
| **Speech** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Backend (Optional)** | Node.js, Express, Socket.IO (for legacy backend voice stream) |

---

## 📁 Project Structure

```text
WebSpeechApi/
├── backend/                  # Optional Node.js Socket.IO server
│   ├── server.js             # Express & Socket.IO server with Gemini
│   ├── .env                  # Backend environment variables
│   └── package.json
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Minimal top route switcher
│   │   ├── VoiceChatBot.jsx  # Web Speech API voice agent
│   │   └── TextChatBot.jsx   # Direct Google AI Studio Gemini chat
│   ├── App.jsx               # App routing and layout
│   ├── index.css             # Tailwind base & global styles
│   └── main.jsx              # Application entry point
├── .env.example              # Environment variable template
├── vercel.json               # SPA routing rewrite for Vercel
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Google AI Studio API Key** (Get one free at [aistudio.google.com](https://aistudio.google.com/))
- **Google Chrome** or **Microsoft Edge** (for Web Speech API voice recognition support)

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd WebSpeechApi
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Inside `.env`, add your Google AI Studio API key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

*(Optional)* If you wish to run the Node.js backend for the legacy socket-based voice agent:
```bash
cd backend
npm install
npm run dev
```

---

## 🚢 Deploying to Vercel

The frontend (including the text chatbot) runs independently and can be deployed directly to Vercel in 1 click.

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_GEMINI_API_KEY`: Your Google AI Studio API key.
6. Click **Deploy**.

> [!NOTE]
> The included `vercel.json` ensures that deep URLs like `/chat` route correctly to `index.html` without 404 errors.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
