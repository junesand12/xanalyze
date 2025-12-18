"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { NetworkSelector } from "@/components/layout/NetworkSelector";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { NodeGrid } from "@/components/dashboard/NodeGrid";
import { useNodes } from "@/contexts/NodesContext";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { lastUpdate, isCached } = useNodes();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Dashboard"
          description="Real-time monitoring of Xandeum pNode network infrastructure"
          variant="purple"
        >
          <NetworkSelector />
        </PageHeader>

        {/* Last updated indicator */}
        {lastUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-sm text-gray-500 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            Last updated: {lastUpdate.toLocaleTimeString()}
            {isCached && (
              <span className="text-xs bg-yellow/20 text-yellow-dark px-2 py-0.5 rounded font-medium">
                CACHED
              </span>
            )}
          </motion.div>
        )}

        {/* Network Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wide mb-4 text-gray-600 dark:text-gray-400">
            Network Overview
          </h2>
          <NetworkStats />
        </section>

        {/* Node Grid */}
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wide mb-4 text-gray-600 dark:text-gray-400">
            All Nodes
          </h2>
          <NodeGrid />
        </section>
      </div>
    </div>
  );
}
