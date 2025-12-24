"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { NetworkSelector } from "@/components/layout/NetworkSelector";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { NodeGrid } from "@/components/dashboard/NodeGrid";
import { TelegramBanner } from "@/components/telegram/TelegramBanner";
import { useNodes } from "@/contexts/NodesContext";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { lastUpdate, isCached } = useNodes();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <PageHeader
          title="Dashboard"
          description="Real-time monitoring of Xandeum pNode network infrastructure"
          variant="purple"
        >
          <NetworkSelector />
        </PageHeader>

        {/* Telegram Banner */}
        <TelegramBanner />

        {/* Last updated indicator */}
        {lastUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500 flex items-center gap-2 flex-wrap"
          >
            <span className="w-2 h-2 rounded-full bg-green animate-pulse flex-shrink-0" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            {isCached && (
              <span className="text-xs bg-yellow/20 text-yellow-dark px-2 py-0.5 rounded font-medium">
                CACHED
              </span>
            )}
          </motion.div>
        )}

        {/* Network Stats */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide mb-3 sm:mb-4 text-gray-600">
            Network Overview
          </h2>
          <NetworkStats />
        </section>

        {/* Node Grid */}
        <section>
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide mb-3 sm:mb-4 text-gray-600">
            All Nodes
          </h2>
          <NodeGrid />
        </section>
      </div>
    </div>
  );
}
