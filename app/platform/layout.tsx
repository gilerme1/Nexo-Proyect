import { redirect } from "next/navigation";
import { getSession, requireSession } from "@/lib/auth/get-session";
import { getUserById } from "@/lib/data/users";
import { store } from "@/lib/data/store";
import { PlatformSidebar } from "@/components/layout/PlatformSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { CustomizationPanel } from "@/components/theme/CustomizationPanel";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (session.workspace.kind !== "platform") {
    redirect("/app");
  }

  const user = getUserById(session.userId);
  if (!user) redirect("/");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[var(--bg-page)]">
        <PlatformSidebar tenants={store.tenants} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar
            scope="platform"
            scopeLabel="Platform"
            user={{ name: user.name, email: user.email }}
          />
          <main className="flex-1 px-4 md:px-6 py-6">
            {children}
          </main>
        </div>
      </div>
      <CustomizationPanel />
    </SidebarProvider>
  );
}
