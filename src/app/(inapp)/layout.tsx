"use client";

import {
  SidebarProvider,
  SidebarInset,
} from "@/shared/ui/sidebar";
import { AppSidebar } from "@/shared/ui/app-sidebar";
import { Header } from "@/shared/ui/header";
import { AuthGuard } from "@/shared/components/auth-guard";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { FormsProvider, useFormsContext } from "@/shared/contexts/forms-context";
import { SaveAlert } from "@/shared/ui/save-alert";
import { Complete } from "@/shared/ui/complete";
import { Toaster } from "@/shared/ui/sonner";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <AuthGuard>
        <FormsProvider>
          <DashboardContent>{children}</DashboardContent>
        </FormsProvider>
      </AuthGuard>
    </ErrorBoundary>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { userAuth, logout, refreshUserData } = useAuthContext();
  const { getFormCompletionPercentage } = useFormsContext();
  const router = useRouter();
  const pathname = usePathname();

  // Check if all forms are complete
  const completionPercentage = getFormCompletionPercentage();
  const isComplete = completionPercentage === 100;



  const handleNotificationClick = (notification: any) => {
    console.log("Notification clicked:", notification);
    // TODO: Implement notification handling
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    // TODO: Navigate to profile page
    router.push("/profile");
  };

  const handleLogout = () => {
    logout();
  };

  // Wait for auth to be fully initialized before rendering sidebar
  if (!userAuth.initialized) {
    console.log("DashboardContent: Auth not yet initialized, waiting...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Ensure user data is available before rendering
  if (!userAuth.userInfo) {
    console.warn(
      "DashboardContent: No user info available, auth state:",
      userAuth
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  // Debug: log the actual user data structure
  console.log("Raw user data:", userAuth.userInfo);

  // Validate required user properties and ensure only primitive values
  const safeUser = {
    id: String(userAuth.userInfo.id || ""),
    name: String(
      userAuth.userInfo.name || userAuth.userInfo.email || "Unknown User"
    ),
    email: String(userAuth.userInfo.email || ""),
    role: userAuth.userInfo.role || "user",
    avatar: userAuth.userInfo.avatar || undefined,
    company: userAuth.userInfo.company || undefined,
  };

  // Ensure notifications and onePages are arrays
  const safeNotifications = Array.isArray(userAuth.notifications)
    ? userAuth.notifications
    : [];
  const safeOnePages = Array.isArray(userAuth.onePages)
    ? userAuth.onePages
    : [];

  console.log("Safe user object:", safeUser);
  console.log("Safe notifications:", safeNotifications.length);
  console.log("Safe onePages:", safeOnePages.length);

  return (
    <SidebarProvider>
      <AppSidebar
        user={safeUser}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />
      <SidebarInset>
        {/* Header */}
        <Header
          user={safeUser}
          notifications={safeNotifications}
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {/* Show Complete component if all forms are finished and not on support team page */}
          {isComplete && !pathname?.includes('/support-team') && !pathname?.includes('/finished') ? (
            <Complete />
          ) : (
            children
          )}
        </main>
      </SidebarInset>

      {/* Save Alert for Unsaved Changes */}
      <SaveAlert />

      {/* Global Toast Notifications */}
      <Toaster />
    </SidebarProvider>
  );
}
