"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";

interface NextPrevFooterProps {
  className?: string;
}

export function NextPrevFooter({ className }: NextPrevFooterProps) {
  const pathname = usePathname();
  const { menuOrder } = useFormsContext();
  const { userAuth } = useAuthContext();

  const getCurrentFormIndex = () => {
    const currentSlug = pathname.replace('/webforms/', '');
    return menuOrder.findIndex(item => item.slug === currentSlug);
  };

  const getNextPrevForms = () => {
    const currentIndex = getCurrentFormIndex();
    if (currentIndex === -1) return { prev: null, next: null };

    const prevForm = currentIndex > 0 ? menuOrder[currentIndex - 1] : null;
    const nextForm = currentIndex < menuOrder.length - 1 ? menuOrder[currentIndex + 1] : null;

    return { prev: prevForm, next: nextForm };
  };

  const { prev, next } = getNextPrevForms();
  const isFirstForm = pathname === '/webforms/broker-information' || 
                     pathname === '/webforms/unlicensed-information';

  if (!menuOrder || menuOrder.length === 0) {
    return null;
  }

  return (
    <div className={`flex justify-between items-center mt-8 ${className}`}>
      <div className="flex-1">
        {!isFirstForm && prev && (
          <Button
            variant="outline"
            asChild
            className="flex items-center gap-2"
          >
            <Link href={`/webforms/${prev.slug}`}>
              <ChevronLeft className="h-4 w-4" />
              Prev Form
            </Link>
          </Button>
        )}
      </div>
      
      <div className="flex-1 flex justify-end">
        {next && (
          <Button
            variant="outline"
            asChild
            className="flex items-center gap-2"
          >
            <Link href={`/webforms/${next.slug}`}>
              Next Form
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
