import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoPerch HRMS — One Platform. Every Department.",
  description: "Enterprise HRMS Platform for GoPerch departments, task management, milestones, and employee skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 goperch-grid-bg">
        {children}
      </body>
    </html>
  );
}
