"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Bell,
  ShieldCheck,
  Crown,
  LogOut,
  User,
  Layers,
  Check
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "CEO" | "HOD" | "EMPLOYEE";
  title?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface NavbarProps {
  user: UserProfile;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking notifications read:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-black/90 border-b border-neutral-800 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-lg transition-transform group-hover:scale-105">
              <Building2 className="w-4.5 h-4.5 text-black" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight flex items-center gap-1.5">
              GoPerch
              <span className="text-neutral-400 font-bold text-xs bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
                HRMS
              </span>
            </span>
          </Link>

          {user.department && (
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-3 py-1 text-xs font-bold rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              {user.department.name}
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 transition"
              title="Manager & Ticket Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-white text-black font-black text-[10px] rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121212] border border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-black text-white">
                    <Bell className="w-4 h-4 text-white" />
                    Manager Alerts & Updates
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                  {notifications.length === 0 ? (
                    <div className="text-neutral-500 text-center py-6">No recent notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border transition ${
                          n.isRead
                            ? "bg-neutral-900/40 border-neutral-800/60 text-neutral-400"
                            : "bg-neutral-900 border-neutral-700 text-white"
                        }`}
                      >
                        <div className="font-extrabold text-white flex items-center gap-1.5">
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-white" />}
                          {n.title}
                        </div>
                        <p className="mt-1 text-neutral-300 font-medium leading-snug">{n.message}</p>
                        <div className="mt-1.5 text-[10px] text-neutral-500 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User & Role Badge */}
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-800">
            <div className="text-right hidden md:block">
              <div className="text-xs font-extrabold text-white flex items-center justify-end gap-1.5">
                {user.name}
              </div>
              <div className="text-[11px] text-neutral-400 font-medium">{user.email}</div>
            </div>

            {user.role === "CEO" ? (
              <span className="px-2.5 py-1 text-[11px] font-black rounded-full bg-white text-black inline-flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-black" />
                CEO
              </span>
            ) : user.role === "HOD" ? (
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-neutral-800 text-white border border-neutral-700 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                HOD
              </span>
            ) : (
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                EMP
              </span>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition border border-neutral-800 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
