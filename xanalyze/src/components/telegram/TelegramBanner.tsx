"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ExternalLink, X } from "lucide-react";

const TELEGRAM_BOT_USERNAME = "xanalyze_bot";
const BANNER_DISMISSED_KEY = "telegram_banner_dismissed";

export function TelegramBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: 0.2 }}
        className="brutal-card rounded-lg p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-black mb-6 relative"
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4 text-gray-500 hover:text-black" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Send className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-sm sm:text-base">Telegram Bot</h3>
              <span className="bg-green text-white text-xs font-bold px-1.5 py-0.5 rounded border border-black uppercase">
                New
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Monitor nodes & get instant alerts
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() =>
              window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}`, "_blank")
            }
            className="flex-shrink-0 px-3 py-2 bg-purple text-white rounded-lg border-2 border-black hover:bg-purple-dark transition-colors text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
          >
            <span className="hidden sm:inline">Start Bot</span>
            <span className="sm:hidden">Start</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
