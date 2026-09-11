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
  CheckCircle2,
  Sparkles,
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
    <header className="bg-[#0f172a]/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight flex items-center gap-1.5">
              GoPerch
              <span className="text-blue-400 font-bold text-xs bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                HRMS
              </span>
            </span>
          </Link>

          {user.department && (
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
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
              className="relative p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition"
              title="Manager & Ticket Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-sm animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                    <Bell className="w-4 h-4 text-blue-400" />
                    Manager Alerts & Updates
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                  {notifications.length === 0 ? (
                    <div className="text-slate-400 text-center py-6">No recent notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border transition ${
                          n.isRead
                            ? "bg-slate-900/40 border-slate-800 text-slate-400"
                            : "bg-blue-950/30 border-blue-500/30 text-slate-200"
                        }`}
                      >
                        <div className="font-extrabold text-white flex items-center gap-1.5">
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                          {n.title}
                        </div>
                        <p className="mt-1 text-slate-300 font-medium leading-snug">{n.message}</p>
                        <div className="mt-1.5 text-[10px] text-slate-500 font-mono">
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
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden md:block">
              <div className="text-xs font-extrabold text-white flex items-center justify-end gap-1.5">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
            </div>

            {user.role === "CEO" ? (
              <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-purple-400" />
                CEO
              </span>
            ) : user.role === "HOD" ? (
              <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                HOD
              </span>
            ) : (
              <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-slate-800 text-slate-300 border border-slate-700 inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                EMP
              </span>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700 flex items-center gap-1.5"
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
