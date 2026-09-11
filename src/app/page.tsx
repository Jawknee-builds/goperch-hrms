import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <DashboardClient user={user} />
      </main>
    </div>
  );
}
