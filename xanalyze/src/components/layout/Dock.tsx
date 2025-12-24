"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Network,
  Trophy,
  BarChart3,
  Activity,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIChatDrawer } from "@/components/ai/AIChatDrawer";

interface DockItem {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
}

const dockItems: DockItem[] = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", color: "bg-purple" },
  { href: "/topology", icon: Network, label: "Topology", color: "bg-green" },
  {
    href: "/leaderboard",
    icon: Trophy,
    label: "Leaderboard",
    color: "bg-orange",
  },
  {
    href: "/analytics",
    icon: BarChart3,
    label: "Analytics",
    color: "bg-yellow",
  },
  {
    href: "/activity",
    icon: Activity,
    label: "Activity",
    color: "bg-purple-light",
  },
];

export function Dock() {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]"
      >
        <div className="dock-container flex items-end gap-1.5 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 bg-white/80 border-3 border-black rounded-xl sm:rounded-2xl shadow-brutal">
          {dockItems.map((item) => (
            <DockIcon
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
          <div className="w-px h-8 sm:h-12 bg-black/20 mx-1 sm:mx-2" />

          {/* AI Chat Button - visible on mobile */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="sm:hidden group relative"
          >
            <motion.div
              whileHover={{ scale: 1.15, y: -6 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 border-2 border-black bg-white hover:bg-gray-100"
            >
              <Sparkles className="w-5 h-5 text-yellow" strokeWidth={2.5} />
            </motion.div>
          </button>

          <DockIcon
            item={{
              href: "/settings",
              icon: Settings,
              label: "Settings",
              color: "bg-gray-500",
            }}
            isActive={pathname === "/settings"}
          />
        </div>
      </motion.div>

      {/* AI Chat Drawer */}
      <AIChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

interface DockIconProps {
  item: DockItem;
  isActive: boolean;
}

function DockIcon({ item, isActive }: DockIconProps) {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="group relative">
      <motion.div
        whileHover={{ scale: 1.15, y: -6 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl transition-all duration-200",
          "border-2 border-black",
          isActive
            ? `${item.color} shadow-brutal-sm`
            : "bg-white hover:bg-gray-100"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 sm:w-7 sm:h-7 transition-colors",
            isActive
              ? "text-white"
              : "text-black"
          )}
          strokeWidth={2.5}
        />

        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            layoutId="dock-indicator"
            className="absolute -bottom-1 sm:-bottom-1.5 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </motion.div>

      {/* Tooltip - hidden on mobile, visible on hover for desktop */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        whileHover={{ opacity: 1, y: 0, scale: 1 }}
        className="hidden sm:block absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider rounded border-2 border-black whitespace-nowrap pointer-events-none"
      >
        {item.label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
      </motion.div>
    </Link>
  );
}
