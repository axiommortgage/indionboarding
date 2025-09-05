"use client";

import { useState } from "react";
import {
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { Badge } from "@/shared/ui/badge";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { User as UserType, Notification } from "@/shared/types/auth";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useFormNavigation } from "@/shared/lib/form-navigation";
import { cn } from "@/shared/lib/utils";

interface HeaderProps {
  user: UserType;
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function Header({
  user,
  notifications,
  onNotificationClick,
  onProfileClick,
  onLogout,
}: HeaderProps) {
  const { getFormCompletionPercentage } = useFormsContext();
  const { goToPreviousForm, goToNextForm, getCurrentFormIndex, getTotalForms } = useFormNavigation();

  const unreadNotifications = notifications.filter((n) => !n.read);
  const showAdminButton = user.role === "admin" || user.role === "editor";
  const completionPercentage = getFormCompletionPercentage();
  const currentFormIndex = getCurrentFormIndex();
  const totalForms = getTotalForms();

  return (
    <header className="border-b border-border bg-background px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Sidebar trigger */}
        <div className="flex items-center space-x-3">
          <SidebarTrigger className="-ml-1" />
        </div>

        {/* Center - Progress bar and navigation */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="flex items-center space-x-4">

             {/* Progress Bar */}
             <div className="flex-1">
              <div className="flex items-center space-x-2">                
                <ProgressBar value={completionPercentage} className="flex-1" />                
              </div>
            </div>

            
            {/* Previous Form Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousForm}
              disabled={currentFormIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev Form</span>
            </Button>
           

            {/* Next Form Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextForm}
              disabled={currentFormIndex === totalForms - 1}
              className="flex items-center gap-2"
            >
              <span className="hidden sm:inline">Next Form</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Admin Button */}
          {showAdminButton && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Button>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 font-semibold border-b">Notifications</div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-4 cursor-pointer hover:bg-muted"
                      onClick={() => onNotificationClick?.(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.read
                              ? "bg-muted-foreground"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications.length > 5 && (
                <div className="p-2 border-t text-center">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-3 py-2 cursor-pointer"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name || user.email}
                  />
                  <AvatarFallback className="bg-emerald-100 text-xs text-slate-700">
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
                <span className="text-sm font-medium hidden md:block">
                  {user.name || user.email || "Unknown User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
