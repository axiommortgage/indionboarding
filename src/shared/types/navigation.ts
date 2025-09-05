import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavigationSubItem[];
  external?: boolean;
}

export interface NavigationSubItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface NavigationGroup {
  label?: string;
  items: NavigationItem[];
}
