import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
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
  ClipboardList, Users, DoorOpen, Layers, Boxes, BedDouble, Settings, LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading, isManager, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar isManager={isManager} onSignOut={async () => { await signOut(); navigate({ to: "/auth" }); }} email={user.email ?? ""} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-card/60 backdrop-blur flex items-center px-4 gap-2 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <Link to="/profile">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{(user.email ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              </Link>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar({ isManager, onSignOut, email }: { isManager: boolean; onSignOut: () => void; email: string }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const studentItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Book Accommodation", url: "/book", icon: BookMarked },
    { title: "My Registration", url: "/registration", icon: ClipboardList },
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
  const items = isManager ? managerItems : studentItems;

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
          <SidebarGroupLabel>{isManager ? "Manager" : "Student"}</SidebarGroupLabel>
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
        <Button variant="ghost" size="sm" className="justify-start" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2"/> <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
