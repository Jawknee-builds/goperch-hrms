"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen goperch-grid-bg text-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Enterprise HRMS Platform
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/30">
              G
            </div>
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">GoPerch</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            One platform. <span className="goperch-gradient-text">Every department.</span>
          </h1>
          <p className="text-sm text-slate-600 max-w-xs mx-auto">
            Sign in to access tasks, milestones, employee learning, and team hurdles.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-sm shadow-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e)} className="bg-white p-6 rounded-3xl border border-slate-300 space-y-4 shadow-xl shadow-slate-300/40">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In to GoPerch HRMS"}
          </button>
        </form>

        <div className="bg-white p-5 rounded-3xl border border-slate-300 space-y-3 shadow-md shadow-slate-300/30">
          <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider text-center">
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
                className="p-2.5 text-left bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-400 rounded-xl transition group"
              >
                <div className="font-extrabold text-slate-900 group-hover:text-blue-700">{acc.label}</div>
                <div className="text-[10px] text-slate-600 font-bold">{acc.dept} &bull; {acc.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
