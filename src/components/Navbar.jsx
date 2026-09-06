import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <header className="w-full flex justify-center pt-6 pb-2">
      <nav className="inline-flex items-center gap-1 p-1 rounded-full bg-neutral-900/80 border border-neutral-800 backdrop-blur-md shadow-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`
          }
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Agent</span>
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`
          }
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Text Chat</span>
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
