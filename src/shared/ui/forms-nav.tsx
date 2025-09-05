"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import { useFormsContext } from "@/shared/contexts/forms-context";
import type { FormMenuItem } from "@/shared/types/forms";

interface FormsNavProps {
  className?: string;
}

export function FormsNav({ className }: FormsNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    menuOrder, 
    isFormComplete, 
    beforeLeave, 
    setBeforeLeave, 
    forms 
  } = useFormsContext();

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Check if there are unsaved changes
    if (forms.isFormSaved === false) {
      setBeforeLeave({
        showAlert: true,
        action: null,
        route: href,
      });
      return;
    }

    // Clear any previous alerts and navigate
    setBeforeLeave({
      showAlert: false,
      action: null,
      route: null,
    });
    
    router.push(href);
  };

  const getFormStatus = (formKey: string) => {
    // Map form slugs to form keys
    const formKeyMap: Record<string, keyof typeof forms> = {
      'broker-information': 'brokerInfo',
      'unlicensed-information': 'unlicensedInfo',
      'photos': 'photos',
      'business-card': 'businessCardInfo',
      'website-information': 'websiteInfo',
      'mpc-application': 'mpcApplication',
      'letter-of-direction': 'letterOfDirection',
      'payment-authorization': 'paymentAuthorization',
      'contract': 'contractAndSchedule',
      'policies': 'policiesAndProcedure',
      'unlicensed-policies': 'unlicensedPolicies',
    };

    const mappedKey = formKeyMap[formKey];
    if (!mappedKey) return false;

    return isFormComplete(mappedKey);
  };

  const renderFormStatus = (slug: string) => {
    const isComplete = getFormStatus(slug);
    
    if (isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (!menuOrder || menuOrder.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>Forms</SidebarGroupLabel>
      <SidebarMenu>
        {menuOrder
          .sort((a, b) => parseInt(a.order) - parseInt(b.order))
          .map((item: FormMenuItem) => {
            const href = `/webforms/${item.slug}`;
            const isActive = pathname === href;

            return (
              <SidebarMenuItem key={item.slug}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="flex items-center justify-between"
                >
                  <Link 
                    href={href}
                    onClick={(e) => handleNavigation(e, href)}
                    className="flex items-center justify-between w-full"
                  >
                    <span className="truncate">{item.title}</span>
                    {renderFormStatus(item.slug)}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
