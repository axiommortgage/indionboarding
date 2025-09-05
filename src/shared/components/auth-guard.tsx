"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/shared/contexts/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { userAuth } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is initialized and user is not authenticated
    if (userAuth.initialized && !userAuth.isAuth) {
      console.log("AuthGuard: User not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [userAuth.initialized, userAuth.isAuth, router]);

  // Show loading state while auth is initializing
  if (!userAuth.initialized) {
    console.log("AuthGuard: Showing loading state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!userAuth.isAuth) {
    console.log("AuthGuard: User not authenticated, preventing render");
    return null;
  }

  // Only show loading for user info if we're still fetching it
  // If userAuth.isAuth is true but userInfo is null, it might still be loading
  if (userAuth.isAuth && !userAuth.userInfo && userAuth.initialized) {
    console.log("AuthGuard: User authenticated but user info still loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  console.log("AuthGuard: Rendering protected content");
  return <>{children}</>;
}
