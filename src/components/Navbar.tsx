"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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

interface NavbarProps {
  user: UserProfile;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-white/95 border-b border-slate-200/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-500/20">
              G
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              GoPerch <span className="text-slate-500 font-semibold text-xs ml-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">HRMS</span>
            </span>
          </Link>

          {user.department && (
            <span className="ml-2 px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
              🎯 {user.department.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-extrabold text-slate-900">{user.name}</div>
              <div className="text-[11px] text-slate-600 font-semibold">{user.email}</div>
            </div>

            <span className="px-2.5 py-1 text-[11px] font-black rounded-full bg-slate-900 text-white border border-slate-800 shadow-2xs">
              {user.role}
            </span>

            <button
              onClick={handleLogout}
              className="ml-1 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-300 shadow-2xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
