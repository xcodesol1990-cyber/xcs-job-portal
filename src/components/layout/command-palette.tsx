"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Briefcase,
  UserCheck,
  PlusCircle,
  MessageSquare,
  Bell,
  FileText,
  DollarSign,
  Shield,
  ArrowRight,
  Command,
  X,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Actions" | "Admin";
  href: string;
  icon: typeof Search;
  keywords: string[];
}

const COMMAND_ITEMS: CommandItem[] = [
  {
    id: "nav-client",
    title: "Client Workspace",
    category: "Navigation",
    href: "/client",
    icon: Briefcase,
    keywords: ["client", "hire", "jobs", "employer"],
  },
  {
    id: "nav-freelancer",
    title: "Freelancer Hub",
    category: "Navigation",
    href: "/freelancer",
    icon: UserCheck,
    keywords: ["freelancer", "proposals", "earnings", "contractor"],
  },
  {
    id: "action-post-job",
    title: "Post a New Job",
    category: "Actions",
    href: "/client/jobs/new",
    icon: PlusCircle,
    keywords: ["post", "new", "create", "job", "hire"],
  },
  {
    id: "action-browse-jobs",
    title: "Browse Available Jobs",
    category: "Actions",
    href: "/jobs",
    icon: Search,
    keywords: ["browse", "find", "search", "marketplace"],
  },
  {
    id: "nav-messages",
    title: "Messages & Huddles",
    category: "Navigation",
    href: "/messages",
    icon: MessageSquare,
    keywords: ["messages", "chat", "inbox", "conversation"],
  },
  {
    id: "nav-alerts",
    title: "Notifications & Alerts",
    category: "Navigation",
    href: "/notifications",
    icon: Bell,
    keywords: ["notifications", "alerts", "updates"],
  },
  {
    id: "action-payouts",
    title: "Earnings & Stripe Payouts",
    category: "Actions",
    href: "/freelancer/payouts",
    icon: DollarSign,
    keywords: ["payouts", "stripe", "earnings", "balance", "bank"],
  },
  {
    id: "nav-contracts",
    title: "Active Milestone Contracts",
    category: "Navigation",
    href: "/client/contracts",
    icon: FileText,
    keywords: ["contracts", "escrow", "milestones"],
  },
  {
    id: "admin-panel",
    title: "Compliance & Dispute Admin",
    category: "Admin",
    href: "/admin",
    icon: Shield,
    keywords: ["admin", "disputes", "ledger", "audit", "compliance"],
  },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const query = search.toLowerCase().trim();
  const filteredItems = COMMAND_ITEMS.filter((item) => {
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.some((k) => k.includes(query))
    );
  });

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length),
      );
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex].href);
    }
  };

  return (
    <>
      {/* Trigger Button in Nav */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden md:inline-flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-1.5 text-xs text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200 transition"
      >
        <Search className="h-3.5 w-3.5 text-zinc-400" />
        <span>Quick Jump...</span>
        <kbd className="inline-flex items-center gap-0.5 rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <Command className="h-2.5 w-2.5" /> K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-800">
              <Search className="h-4 w-4 text-zinc-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a command or jump to page..."
                className="w-full bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-normal">{item.category}</div>
                      </div>
                    </div>

                    <ArrowRight
                      className={`h-3.5 w-3.5 ${isSelected ? "opacity-100" : "opacity-0"} transition`}
                    />
                  </button>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No destinations found matching &quot;{search}&quot;.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                Use{" "}
                <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded text-[10px]">
                  ↑
                </kbd>{" "}
                <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded text-[10px]">
                  ↓
                </kbd>{" "}
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded text-[10px]">
                  Enter
                </kbd>{" "}
                to select
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
