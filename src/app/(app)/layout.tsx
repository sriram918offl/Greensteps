import { requireUser } from "@/lib/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar isAdmin={user.role === "ADMIN"} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
