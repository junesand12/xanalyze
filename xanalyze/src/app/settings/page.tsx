"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  BrutalCard,
  BrutalCardHeader,
  BrutalCardTitle,
  BrutalCardContent,
} from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { motion } from "framer-motion";
import { Database, Trash2, Send, ExternalLink } from "lucide-react";
import { useState } from "react";

const TELEGRAM_BOT_USERNAME = "xanalyze_bot";

export default function SettingsPage() {
  const [cacheCleared, setCacheCleared] = useState(false);

  const clearCache = () => {
    // Clear localStorage cache
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("xnode_cache_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear IndexedDB
      if (window.indexedDB) {
        indexedDB.deleteDatabase("xnode_cache");
      }

      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <PageHeader
          title="Settings"
          description="Configure your XAnalyze experience"
          variant="purple"
        />

        <div className="space-y-6">
          {/* Cache Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BrutalCard>
              <BrutalCardHeader>
                <BrutalCardTitle>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Cache Management
                  </div>
                </BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <p className="text-gray-600 mb-4">
                  Clear cached data to fetch fresh information from the network.
                  This includes node data, geolocation, and registry
                  information.
                </p>
                <div className="flex items-center gap-4">
                  <BrutalButton onClick={clearCache} variant="orange">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Cache
                  </BrutalButton>
                  {cacheCleared && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-green font-bold"
                    >
                      Cache cleared!
                    </motion.span>
                  )}
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BrutalCard variant="green">
              <BrutalCardHeader>
                <BrutalCardTitle>Keyboard Shortcuts</BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Shortcut keys={["⌘", "R"]} description="Refresh data" />
                  <Shortcut keys={["1"]} description="Dashboard" />
                  <Shortcut keys={["2"]} description="Topology" />
                  <Shortcut keys={["3"]} description="Leaderboard" />
                  <Shortcut keys={["4"]} description="Analytics" />
                  <Shortcut keys={["5"]} description="Activity" />
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>

          {/* Telegram Bot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BrutalCard variant="purple">
              <BrutalCardHeader>
                <BrutalCardTitle>
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Telegram Bot
                  </div>
                </BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <p className="text-gray-600 mb-4">
                  Monitor your nodes and get real-time alerts directly on
                  Telegram. Subscribe to nodes and receive instant notifications
                  when they go offline.
                </p>

                <BrutalButton
                  onClick={() =>
                    window.open(
                      `https://t.me/${TELEGRAM_BOT_USERNAME}`,
                      "_blank"
                    )
                  }
                  variant="purple"
                  className="mb-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Open Telegram Bot
                  <ExternalLink className="w-4 h-4 ml-2" />
                </BrutalButton>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wide mb-3">
                      Available Commands
                    </h4>
                    <div className="space-y-2">
                      <BotCommand
                        command="/start"
                        description="Welcome message and bot introduction"
                      />
                      <BotCommand
                        command="/stats"
                        description="Get overview of all networks"
                      />
                      <BotCommand
                        command="/stats <network>"
                        description="Get specific network statistics"
                      />
                      <BotCommand
                        command="/node <pubkey>"
                        description="Get detailed information about a node"
                      />
                      <BotCommand
                        command="/versions"
                        description="See version distribution across nodes"
                      />
                      <BotCommand
                        command="/compare"
                        description="Compare all networks side-by-side"
                      />
                      <BotCommand
                        command="/top"
                        description="View top 10 nodes by uptime"
                      />
                      <BotCommand
                        command="/subscribe <pubkey>"
                        description="Get alerts when a node goes down"
                      />
                      <BotCommand
                        command="/unsubscribe <pubkey>"
                        description="Stop receiving alerts for a node"
                      />
                      <BotCommand
                        command="/mysubs"
                        description="List all your active subscriptions"
                      />
                      <BotCommand
                        command="/ask <question>"
                        description="Ask AI about network status (if enabled)"
                      />
                    </div>
                  </div>

                  <div className="border-t-2 border-green/20 pt-4">
                    <h4 className="font-bold text-sm uppercase tracking-wide mb-2">
                      Features
                    </h4>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green font-bold">•</span>
                        <span>
                          Real-time node monitoring and status updates
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green font-bold">•</span>
                        <span>
                          Instant alerts when subscribed nodes go offline
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green font-bold">•</span>
                        <span>Network statistics and performance metrics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green font-bold">•</span>
                        <span>
                          AI-powered network analysis (Gemini 2.0 Flash)
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface ShortcutProps {
  keys: string[];
  description: string;
}

function Shortcut({ keys, description }: ShortcutProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-green/5 rounded border-2 border-green/20">
      <span className="text-gray-700 font-medium">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 bg-green text-white border-2 border-black rounded font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

interface BotCommandProps {
  command: string;
  description: string;
}

function BotCommand({ command, description }: BotCommandProps) {
  return (
    <div className="flex items-start gap-3 p-2 bg-purple/5 rounded border border-purple/20">
      <code className="text-purple font-mono text-xs font-bold bg-purple/10 px-2 py-1 rounded border border-purple/30 whitespace-nowrap">
        {command}
      </code>
      <span className="text-sm text-gray-600 flex-1">{description}</span>
    </div>
  );
}
