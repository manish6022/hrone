import {
  LayoutDashboard,
  Users,
  Package,
  Factory,
  Shield,
  Key,
  Clock,
  FileText,
  Calendar,
  Palette,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permission?: string;
}

const baseNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users, permission: "view_users" },
  { name: "Timesheet", href: "/timesheet", icon: FileText, permission: "view_timesheet" },
  { name: "Roles", href: "/roles", icon: Shield, permission: "role_view" },
  {
    name: "Privileges",
    href: "/privileges",
    icon: Key,
    permission: "privilege_view",
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Clock,
    permission: "ATTENDANCE_APPROVE",
  },
  {
    name: "Leave Types",
    href: "/leave-types",
    icon: Calendar,
    permission: "leave_type_view",
  },
  {
    name: "Apply Leave",
    href: "/leave",
    icon: FileText,
  },
  {
    name: "Item Master",
    href: "/items",
    icon: Package,
    permission: "item_view",
  },
  {
    name: "Production",
    href: "/production",
    icon: Factory,
    permission: "production_view",
  },
  {
    name: "UI Showcase",
    href: "/ui-showcase",
    icon: Palette,
  },
];

export function getNavigation(isRegularUser: boolean = false): NavigationItem[] {
  const navigation = [...baseNavigation];

  // For regular users (employees), replace Dashboard with ESS Dashboard
  if (isRegularUser) {
    const dashboardIndex = navigation.findIndex(item => item.name === "Dashboard");
    if (dashboardIndex !== -1) {
      navigation[dashboardIndex] = {
        ...navigation[dashboardIndex],
        name: "ESS Dashboard",
        href: "/employee-dashboard"
      };
    }
  }

  return navigation;
}

// Keep the old export for backward compatibility
export const navigation = baseNavigation;
