"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AIChatDrawer } from "@/components/ai/AIChatDrawer";

export function AILogoButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Logo with AI indicator */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        style={{
          zIndex: 9999,
          position: "fixed",
          bottom: "1rem",
          left: "1rem",
        }}
        className="hidden sm:block cursor-pointer group relative bg-transparent pointer-events-auto"
        title="Chat with AI Assistant"
        type="button"
      >
        <img
          src="/logo.png"
          alt="Xanalyze"
          className="w-48 h-auto relative z-10 pointer-events-none"
        />

        {/* Pulse animation - behind logo */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-6 right-6 w-10 h-10 bg-yellow rounded-full z-0"
        />

        {/* AI Sparkle Indicator - in front */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-6 right-6 bg-yellow text-black rounded-full p-2 border-2 border-black shadow-brutal-sm z-20"
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>

        {/* Hover tooltip */}
        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
          <div className="bg-black text-white text-xs font-bold px-3 py-2 rounded border-2 border-black whitespace-nowrap">
            Chat with AI Assistant
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
          </div>
        </div>
      </motion.button>

      {/* AI Chat Drawer */}
      <AIChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>,
    document.body
  );
}
