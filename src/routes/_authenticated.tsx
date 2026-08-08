import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import type { DevRole } from "@/lib/auth-flags";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Building2, LayoutDashboard, BookMarked, FileText, FolderOpen, Megaphone, User,
  ClipboardList, Users, DoorOpen, Layers, Boxes, BedDouble, Settings, LogOut, ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsBell } from "@/components/notifications-bell";
import { BackButton } from "@/components/back-button";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading, isManager, isNss, roles, signOut, authDisabled, devRole, changeDevRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authDisabled && !loading && !user) navigate({ to: "/auth" });
  }, [authDisabled, loading, user, navigate]);

  if (!authDisabled && (loading || !user)) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const email = user?.email ?? (authDisabled ? "preview mode" : "");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          isManager={isManager}
          isNss={isNss}
          isAdmin={roles.includes("admin")}
          onSignOut={async () => { await signOut(); navigate({ to: "/auth" }); }}
          email={email}
          authDisabled={authDisabled}
          devRole={devRole}
          changeDevRole={changeDevRole}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-card/60 backdrop-blur flex items-center px-4 gap-2 sticky top-0 z-30">
            <SidebarTrigger />
            <BackButton />
            <div className="ml-auto flex items-center gap-2">
              <NotificationsBell />
              <Link to="/profile">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{email.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              </Link>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar({ isManager, isNss, isAdmin, onSignOut, email, authDisabled, devRole, changeDevRole }: { isManager: boolean; isNss: boolean; isAdmin: boolean; onSignOut: () => void; email: string; authDisabled: boolean; devRole: DevRole; changeDevRole: (role: DevRole) => void }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const studentItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Book Accommodation", url: "/book", icon: BookMarked },
    { title: "My Registration", url: "/registration", icon: ClipboardList },
    { title: "Documents", url: "/documents", icon: FolderOpen },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "Profile", url: "/profile", icon: User },
  ];
  const nssItems = [
    { title: "Dashboard", url: "/nss", icon: LayoutDashboard },
    { title: "Review Applications", url: "/nss/applications", icon: FileText },
    { title: "My Registration", url: "/registration", icon: ClipboardList },
    { title: "Book Accommodation", url: "/book", icon: BookMarked },
    { title: "Documents", url: "/documents", icon: FolderOpen },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "Profile", url: "/profile", icon: User },
  ];
  const managerItems = [
    { title: "Dashboard", url: "/manager", icon: LayoutDashboard },
    { title: "Applications", url: "/manager/applications", icon: FileText },
    { title: "Students", url: "/manager/students", icon: Users },
    { title: "Rooms", url: "/manager/rooms", icon: DoorOpen },
    { title: "Room Types", url: "/manager/room-types", icon: BedDouble },
    { title: "Blocks", url: "/manager/blocks", icon: Boxes },
    { title: "Floors", url: "/manager/floors", icon: Layers },
    { title: "Announcements", url: "/manager/announcements", icon: Megaphone },
    { title: "Settings", url: "/manager/settings", icon: Settings },
  ];
  const base = isManager ? managerItems : isNss ? nssItems : studentItems;
  const items = isAdmin
    ? [...base, { title: "Manager Accounts", url: "/admin/managers", icon: ShieldCheck }]
    : base;
  const label = isManager ? "Manager" : isNss ? "NSS Reviewer" : "Student";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Building2 className="h-4 w-4"/></div>
          <span className="group-data-[collapsible=icon]:hidden">LodgeMaster</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={path === it.url}>
                    <Link to={it.url as string}>
                      <it.icon className="h-4 w-4"/>
                      <span>{it.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">{email}</div>
        {authDisabled ? (
          <div className="px-2 pb-2 space-y-1.5 group-data-[collapsible=icon]:hidden">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Preview role</div>
            <div className="grid grid-cols-3 gap-1">
              {([
                { key: "student", label: "Student" },
                { key: "nss", label: "NSS" },
                { key: "manager", label: "Manager" },
              ] as { key: DevRole; label: string }[]).map((r) => (
                <Button
                  key={r.key}
                  size="sm"
                  variant={devRole === r.key ? "default" : "outline"}
                  className="h-7 px-1 text-[11px]"
                  onClick={() => changeDevRole(r.key)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="justify-start" onClick={onSignOut}>
            <LogOut className="h-4 w-4 mr-2"/> <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
