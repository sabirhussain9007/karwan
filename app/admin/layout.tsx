import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Map, PackageSearch, Users } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-emerald-400">Admin Panel</h2>
        </div>
        <nav className="mt-6 space-y-1">
          <Link
            href="/admin"
            className="flex items-center px-6 py-3 hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
        
          
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
