import { requireUser } from "@/lib/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // requireUser() still runs to enforce auth + sync the user row; the admin
  // link is no longer rendered in the sidebar (reached via secret shortcut).
  await requireUser();
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
