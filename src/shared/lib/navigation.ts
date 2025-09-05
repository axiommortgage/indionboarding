import {
  Calendar,
  Clock,
  Bell,
  Smartphone,
  Megaphone,
  Share2,
  ShoppingBag,
  Target,
  QrCode,
  FileText,
  FolderOpen,
  Users,
  Building2,
  UserCheck,
  TrendingUp,
  MapPin,
  Globe,
  Monitor,
  FileCheck,
  FileType,
  GraduationCap,
  Mail,
  Newspaper,
  PlayCircle,
  Heart,
  Award,
  Dumbbell,
  DollarSign,
  User,
  Users2,
  FolderOpen as Resources,
  ExternalLink,
  Presentation,
  LogOut,
  Umbrella,
  University,
} from "lucide-react";
import { NavigationGroup } from "@/shared/types/navigation";
import type { OnePage } from "@/shared/types/auth";

export const getNavigationGroups = (
  onePages: OnePage[] = []
): NavigationGroup[] => [
  {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: Calendar,
      },
      {
        id: "branding",
        label: "Branding",
        href: "/branding",
        icon: Target,
        children: [
          {
            id: "logos-fonts",
            label: "Logos, Fonts & Guidelines",
            href: "/logos-fonts",
          },
          {
            id: "brand-materials",
            label: "Brand Materials",
            href: "/brand-materials",
          },
        ],
      },
      {
        id: "company-calendar",
        label: "Company Calendar",
        href: "/company-calendar",
        icon: Calendar,
      },
      {
        id: "company-directory",
        label: "Company Directory",
        href: "/company-directory",
        icon: Building2,
      },
      {
        id: "compliance",
        label: "Compliance",
        href: "/compliance",
        icon: FileCheck,
      },
      {
        id: "events",
        label: "Events",
        href: "https://indievents.ca",
        icon: Clock,
        external: true,
      },
      {
        id: "fintrac",
        label: "FINTRAC",
        href: "/fintrac",
        icon: FileType,
      },
      {
        id: "group-benefits",
        label: "Group Benefits",
        href: "/group-benefits",
        icon: Umbrella,
      },
      {
        id: "indi-app",
        label: "Indi App",
        href: "/indi-app",
        icon: Smartphone,
      },
      {
        id: "indi-awards",
        label: "Indi Awards",
        href: "/indi-awards",
        icon: Award,
      },
      {
        id: "indi-cares",
        label: "Indi Cares",
        href: "/indi-cares",
        icon: Heart,
      },
      {
        id: "indi-fit-club",
        label: "Indi Fit Club",
        href: "/indi-fit-club",
        icon: Dumbbell,
      },
      {
        id: "lender-lounge",
        label: "Lender Lounge",
        href: "/lenders",
        icon: University,
      },
      {
        id: "marketing",
        label: "Marketing",
        href: "/marketing",
        icon: Megaphone,
        children: [
          {
            id: "social-media",
            label: "Social Media",
            href: "/social-media",
          },
          {
            id: "email-signature",
            label: "Email Signature",
            href: "/email-signature",
          },
          {
            id: "printables",
            label: "Printables",
            href: "/printables",
          },
          {
            id: "listing-sheet",
            label: "Listing Sheet",
            href: "/listing-sheet",
          },
          {
            id: "custom-shop",
            label: "The Custom Shop",
            href: "/custom-shop",
          },
          {
            id: "operation-impact",
            label: "Operation Impact",
            href: "/client-gift",
          },
          {
            id: "qr-codes",
            label: "QR Codes",
            href: "/qr-codes",
          },
        ],
      },
      {
        id: "my-indi-site",
        label: "My Indi Site",
        href: "/indi-sites",
        icon: Globe,
      },
      {
        id: "my-realtors",
        label: "My Realtors",
        href: "/realtors",
        icon: UserCheck,
      },
      {
        id: "newsletter-archive",
        label: "Newsletter Archive",
        href: "/newsletter-archive",
        icon: Newspaper,
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
      },
      {
        id: "partners",
        label: "Partners",
        href: "/partnerships",
        icon: Users,
        children: Array.isArray(onePages)
          ? onePages
              .filter((page) => {
                // Ensure page is an object with required properties
                return (
                  page &&
                  typeof page === "object" &&
                  page.Title &&
                  page.slug &&
                  typeof page.Title === "string" &&
                  typeof page.slug === "string"
                );
              })
              .map((page) => {
                const pageId = page.id || page._id;

                return {
                  id: `partner-${pageId || Math.random()}`,
                  label: String(page.Title),
                  href: `/partnerships/${page.slug}`,
                };
              })
          : [],
      },
      {
        id: "payroll",
        label: "Payroll",
        href: "https://portal.scarlettnetwork.com/portal/dashboard",
        icon: DollarSign,
        external: true,
      },
      {
        id: "profile",
        label: "Profile",
        href: "/profile",
        icon: User,
      },
      {
        id: "resources",
        label: "Resources",
        href: "/resources",
        icon: Resources,
      },
      {
        id: "technology",
        label: "Technology",
        href: "/technology",
        icon: Monitor,
      },
      {
        id: "tutorials",
        label: "Tutorials & Videos",
        href: "/tutorials",
        icon: PlayCircle,
      },
    ],
  },
];

// For backward compatibility, export a default navigation without onePages
export const navigationGroups: NavigationGroup[] = getNavigationGroups();
