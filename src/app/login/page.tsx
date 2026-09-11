"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, LogIn, UserCheck } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-bold rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-white" />
            Enterprise HRMS Platform
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-xl">
              <Building2 className="w-6 h-6 text-black" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">GoPerch</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">
            One platform. <span className="goperch-gradient-text">Every department.</span>
          </h1>
          <p className="text-sm text-neutral-400 max-w-xs mx-auto">
            Sign in to access interactive Kanban tickets, milestones, employee learning, and team hurdles.
          </p>
        </div>

        {error && (
          <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 p-3.5 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e)} className="bg-[#121212] p-6 rounded-3xl border border-neutral-800 space-y-4 shadow-2xl">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-300 mb-1">
              <Mail className="w-3.5 h-3.5 text-white" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-white transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-300 mb-1">
              <Lock className="w-3.5 h-3.5 text-white" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-black rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-black" />
            {loading ? "Signing in..." : "Sign In to GoPerch HRMS"}
          </button>
        </form>

        <div className="bg-[#121212] p-5 rounded-3xl border border-neutral-800 space-y-3 shadow-xl">
          <div className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <UserCheck className="w-4 h-4 text-white" />
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
                className="p-2.5 text-left bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded-xl transition group"
              >
                <div className="font-extrabold text-white group-hover:text-neutral-200">{acc.label}</div>
                <div className="text-[10px] text-neutral-400 font-medium">{acc.dept} &bull; {acc.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
