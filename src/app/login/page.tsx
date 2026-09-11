"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Sparkles, Mail, Lock, LogIn, ShieldCheck, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ceo@goperch.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: "Ryan Bantu (CEO)", email: "ceo@goperch.com", role: "CEO", dept: "Leadership" },
    { label: "Prasanna (Software HOD)", email: "hod.software@goperch.com", role: "HOD", dept: "Software" },
    { label: "Vikram (Electronics HOD)", email: "hod.electronics@goperch.com", role: "HOD", dept: "Electronics" },
    { label: "Jonathan Jaladi (Sales HOD)", email: "hod.sales@goperch.com", role: "HOD", dept: "Sales" },
    { label: "Alex Dev (Software Dev)", email: "emp.software@goperch.com", role: "EMPLOYEE", dept: "Software" },
    { label: "Priya Patel (Hardware Eng)", email: "emp.electronics@goperch.com", role: "EMPLOYEE", dept: "Electronics" },
    { label: "James Wilson (Sales Rep)", email: "emp.sales@goperch.com", role: "EMPLOYEE", dept: "Sales" },
  ];

  return (
    <div className="min-h-screen goperch-grid-bg text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Enterprise HRMS Platform
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">GoPerch</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">
            One platform. <span className="goperch-gradient-text">Every department.</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Sign in to access interactive Kanban tickets, milestones, employee learning, and team hurdles.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3.5 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e)} className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300 mb-1">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300 mb-1">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Signing in..." : "Sign In to GoPerch HRMS"}
          </button>
        </form>

        <div className="bg-[#0f172a] p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-400" />
            Quick 1-Click Demo Login Accounts
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword("password123");
                  handleLogin(undefined, acc.email, "password123");
                }}
                className="p-2.5 text-left bg-slate-900/60 hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/50 rounded-xl transition group"
              >
                <div className="font-extrabold text-slate-200 group-hover:text-blue-400">{acc.label}</div>
                <div className="text-[10px] text-slate-400 font-medium">{acc.dept} &bull; {acc.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
