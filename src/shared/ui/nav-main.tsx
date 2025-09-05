"use client";

import { ChevronRight, ExternalLink, type LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/ui/sidebar";
import { NavigationItem } from "@/shared/types/navigation";

interface NavMainProps {
  items: NavigationItem[];
  title?: string;
}

export function NavMain({ items, title }: NavMainProps) {
  // Add safety check for items
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {safeItems.map((item) => {
          // Ensure item has required properties and they are strings
          if (
            !item ||
            typeof item.id !== "string" ||
            typeof item.label !== "string"
          ) {
            console.warn("Invalid navigation item:", item);
            return null;
          }

          if (
            item.children &&
            Array.isArray(item.children) &&
            item.children.length > 0
          ) {
            return (
              <Collapsible
                key={item.id}
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.label}>
                      {item.icon && <item.icon className="text-primary" />}
                      <span>{String(item.label)}</span>
                      <ChevronRight className="ml-auto transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((subItem) => {
                        // Ensure subItem has required properties and they are strings
                        if (
                          !subItem ||
                          typeof subItem.id !== "string" ||
                          typeof subItem.label !== "string"
                        ) {
                          console.warn("Invalid navigation sub-item:", subItem);
                          return null;
                        }

                        return (
                          <SidebarMenuSubItem key={subItem.id}>
                            <SidebarMenuSubButton asChild>
                              {subItem.external ? (
                                <a
                                  href={subItem.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <span>{String(subItem.label)}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <Link href={subItem.href}>
                                  <span>{String(subItem.label)}</span>
                                </Link>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild tooltip={item.label}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    {item.icon && <item.icon className="text-primary" />}
                    <span>{String(item.label)}</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                ) : (
                  <Link href={item.href}>
                    {item.icon && <item.icon className="text-primary" />}
                    <span>{String(item.label)}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
