"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { useFormsContext } from "@/shared/contexts/forms-context";

export function SaveAlert() {
  const router = useRouter();
  const { beforeLeave, setBeforeLeave } = useFormsContext();

  const handleStayOnPage = () => {
    setBeforeLeave({
      showAlert: false,
      action: null,
      route: null,
    });
  };

  const handleLeavePage = () => {
    const route = beforeLeave.route;
    setBeforeLeave({
      showAlert: false,
      action: null,
      route: null,
    });
    
    if (route) {
      router.push(route);
    }
  };

  return (
    <AlertDialog open={beforeLeave.showAlert} onOpenChange={handleStayOnPage}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes on this form. If you leave now, your changes will be lost.
            Would you like to stay on this page to save your changes, or leave without saving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleStayOnPage}>
            Stay on Page
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleLeavePage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Leave Without Saving
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
