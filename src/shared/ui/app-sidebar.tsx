"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/ui/sidebar";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { LogOut, User, ChevronDown } from "lucide-react";
import { NavMain } from "./nav-main";
import { getNavigationGroups } from "@/shared/lib/navigation";
import { User as UserType } from "@/shared/types/auth";
import { useAuthContext } from "@/shared/contexts/auth-context";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserType;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function AppSidebar({
  user,
  onProfileClick,
  onLogout,
  ...props
}: AppSidebarProps) {
  const { userAuth } = useAuthContext();

  // Get navigation with dynamic onePages data
  const navigationGroups = React.useMemo(() => {
    // Debug: Log the onePages data
    console.log("AppSidebar: userAuth.onePages:", userAuth.onePages);
    console.log("AppSidebar: userAuth.onePages type:", typeof userAuth.onePages);
    console.log("AppSidebar: userAuth.onePages length:", userAuth.onePages?.length);
    
    // Ensure onePages is an array before passing to navigation
    const safeOnePages = Array.isArray(userAuth.onePages)
      ? userAuth.onePages
      : [];

    // Additional validation for onePages items
    const validatedOnePages = safeOnePages.filter((page) => {
      if (!page || typeof page !== "object") {
        console.warn("Invalid onePage object:", page);
        return false;
      }
      if (!page.Title || typeof page.Title !== "string") {
        console.warn("Invalid onePage Title:", page);
        return false;
      }
      if (!page.slug || typeof page.slug !== "string") {
        console.warn("Invalid onePage slug:", page);
        return false;
      }
      return true;
    });

    console.log("AppSidebar: Validated onePages:", validatedOnePages);

    try {
      const navigation = getNavigationGroups(validatedOnePages);
      console.log("AppSidebar: Generated navigation:", navigation);
      return navigation;
    } catch (error) {
      console.error("Error generating navigation groups:", error);
      return getNavigationGroups([]); // Fallback to empty navigation
    }
  }, [userAuth.onePages, userAuth.initialized]);

  // Don't render if auth is not initialized
  if (!userAuth.initialized) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <div className="size-4 font-bold">I</div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">IndiCentral</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.company || "Indi Mortgage"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navigationGroups.map((group, index) => (
          <NavMain key={index} title={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700">
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : user.email
                        ? user.email.charAt(0).toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user.name || user.email || "Unknown User"}
                    </span>
                    <span className="truncate text-xs capitalize">
                      {user.role || "user"}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={onProfileClick}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
