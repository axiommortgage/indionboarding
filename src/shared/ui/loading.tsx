"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo placeholder */}
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
              <span className="text-2xl font-bold text-white">I</span>
            </div>

            {/* Loading content */}
            <div className="text-center space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                <div
                  className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <p className="text-lg font-medium text-slate-900">{message}</p>
              <p className="text-sm text-slate-600">
                Please wait while we prepare your dashboard...
              </p>
            </div>

            {/* Skeleton content */}
            <div className="w-full space-y-3">
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuthLoading() {
  return <Loading message="Initializing authentication..." />;
}

export function UserDataLoading() {
  return <Loading message="Loading your profile..." />;
}
