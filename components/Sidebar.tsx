"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Store, Monitor, MessageSquareWarning,
  Settings2, UserCog, Smartphone, CalendarCheck, Star, LogOut,
  ChevronDown, ChevronRight, Cpu, Layers, Package, UsersRound,
  ListChecks, ImageIcon, BookOpen, SlidersHorizontal,
  CalendarDays, CalendarRange, BarChart2, FileText, ClipboardList,
  Globe
} from "lucide-react";
import { clearTokens } from "@/lib/api";

// TYPES
type NavChild = { icon: React.ElementType; label: string; path: string };
type NavItem  = { icon: React.ElementType; label: string; path?: string; children?: NavChild[] };

// NAV ITEMS
const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Customer", path: "/customer" },
  { icon: Store, label: "Dealer", path: "/dealer" },
  { icon: Monitor, label: "Customer Machine", path: "/customer-machine" },
  { icon: MessageSquareWarning, label: "Complaint", path: "/complaint" },
  {
    icon: Settings2, label: "Manage Machines", children: [
      { icon: Cpu, label: "Machine", path: "/manage-machines" },
      { icon: Layers, label: "Model", path: "/manage-machines/model" },
      { icon: Package, label: "Parts", path: "/manage-machines/parts" },
    ]
  },
  {
    icon: UserCog, label: "Service Engineer", children: [
      { icon: UsersRound, label: "Teams", path: "/service-engineer/teams" },
      { icon: ListChecks, label: "Service Engineer List", path: "/service-engineer/list" },
    ]
  },
  {
    icon: Smartphone, label: "Mobile Setting", children: [
      { icon: SlidersHorizontal, label: "Slider", path: "/mobile-setting/slider" },
      { icon: ImageIcon, label: "Media", path: "/mobile-setting/media" },
      { icon: BookOpen, label: "User Manual", path: "/mobile-setting/user-manual" },
    ]
  },
  {
    icon: CalendarCheck, label: "Attendance", children: [
      { icon: CalendarDays, label: "Daily Attendance", path: "/attendance/daily" },
      { icon: CalendarRange, label: "Monthly Attendance", path: "/attendance/monthly" },
    ]
  },
  { icon: Star, label: "Review", path: "/review" },
  { icon: BarChart2, label: "Collection", path: "/collection" },
  {
    icon: BarChart2, label: "Report", children: [
      { icon: FileText, label: "Dealer Report", path: "/report/dealer" },
      { icon: ClipboardList, label: "Pocket Report", path: "/report/pocket" },
    ]
  },
  {
    icon: Settings2, label: "Settings", children: [
      { icon: Smartphone, label: "App Version", path: "/settings/app-version" },
      { icon: Users, label: "User Management", path: "/settings/users" },
      { icon: Globe, label: "State Management", path: "/settings/state-management" },
      { icon: Globe, label: "District Management", path: "/settings/district-management" },
      { icon: Globe, label: "City Management", path: "/settings/city-management" },
      { icon: ClipboardList, label: "Complaint Category", path: "/settings/complaint-category" },
      { icon: ListChecks, label: "Checksheet Master", path: "/settings/checksheet-master" },
      { icon: ClipboardList, label: "Complaint SubCategory", path: "/settings/complaint-subcategory" },
      { icon: ClipboardList, label: "Complaint SubCategory 2", path: "/settings/complaint-subcategory-2" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Auto-expand based on pathname
  useEffect(() => {
    for (const item of navItems) {
      if (item.children?.some(c => c.path === pathname)) {
        setExpanded(item.label);
        break;
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login";
  };

  const isItemActive = (item: NavItem) => {
    if (item.path === "/" && pathname === "/") return true;
    if (item.path && item.path !== "/" && pathname.startsWith(item.path)) return true;
    if (item.children?.some(c => pathname.startsWith(c.path))) return true;
    return false;
  };

  const isChildActive = (path: string) => pathname === path;

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} flex flex-col transition-all duration-300 shrink-0 relative`}
      style={{
        background: "#f1f5f9",
        borderRight: "1px solid #e5e7eb"
      }}
    >

      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-100">
            <img src="/mitralogo.svg" alt="logo" width={20} />
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-base">m.i.t.r.a.</p>
              <p className="text-xs text-gray-500">Mahindra AgriTech</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border rounded-full flex items-center justify-center shadow z-10"
      >
        <ChevronRight size={12} className={`${collapsed ? "" : "rotate-180"}`} />
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isOpen = expanded === item.label;
          const hasKids = !!item.children;
          const active = isItemActive(item);

          const NavButton = (
            <div
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition cursor-pointer
                ${active ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Icon size={18} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-base">{item.label}</span>
                  {hasKids && (
                    <ChevronDown size={14} className={`${isOpen ? "rotate-180" : ""}`} />
                  )}
                </>
              )}
            </div>
          );

          return (
            <div key={item.label}>
              {hasKids ? (
                <button
                  onClick={() => !collapsed && setExpanded(isOpen ? null : item.label)}
                  className="w-full"
                >
                  {NavButton}
                </button>
              ) : (
                <Link href={item.path || "/"} className="block">
                  {NavButton}
                </Link>
              )}

              {hasKids && isOpen && !collapsed && (
                <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                  {item.children!.map((child) => {
                    const CIcon = child.icon;
                    const childActive = isChildActive(child.path);

                    return (
                      <Link
                        key={child.label}
                        href={child.path}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition
                          ${childActive ? "bg-green-50 text-green-700 font-medium" : "text-gray-500 hover:bg-gray-100"}`}
                      >
                        <CIcon size={14} />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
