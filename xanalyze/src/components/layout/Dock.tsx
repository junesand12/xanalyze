"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="dock-container flex items-end gap-3 px-4 py-3 bg-white/80 dark:bg-black/80 border-3 border-black dark:border-white rounded-2xl shadow-brutal">
        {dockItems.map((item) => (
          <DockIcon
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
        <div className="w-px h-12 bg-black/20 dark:bg-white/20 mx-2" />
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
          "relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
          "border-2 border-black dark:border-white",
          isActive
            ? `${item.color} shadow-brutal-sm`
            : "bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <Icon
          className={cn(
            "w-7 h-7 transition-colors",
            isActive
              ? "text-white dark:text-black"
              : "text-black dark:text-white"
          )}
          strokeWidth={2.5}
        />

        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            layoutId="dock-indicator"
            className="absolute -bottom-1.5 w-3 h-3 rounded-full bg-black dark:bg-white"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </motion.div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        whileHover={{ opacity: 1, y: 0, scale: 1 }}
        className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded border-2 border-black dark:border-white whitespace-nowrap pointer-events-none"
      >
        {item.label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black dark:border-t-white" />
      </motion.div>
    </Link>
  );
}
