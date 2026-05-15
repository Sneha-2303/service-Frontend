"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User, Settings, LogOut, Check, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, clearTokens } from '@/lib/api';

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const years  = ["2023","2024","2025","2026"];

const initialNotifications = [
  { id: 1, title: "New Complaint Assigned", message: "Complaint #1042 has been assigned to Ravi Kumar.", time: "5 min ago", read: false },
  { id: 2, title: "Service Overdue", message: "Machine MX-3300 service is overdue by 2 days.", time: "1 hr ago", read: false },
  { id: 3, title: "Engineer Check-in", message: "Amit Sharma checked in at Dealer - Pune West.", time: "3 hrs ago", read: false },
  { id: 4, title: "New Dealer Registered", message: "Dealer 'MaxTech Solutions' successfully registered.", time: "Yesterday", read: true },
];

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ full_name?: string; email?: string; role?: string } | null>(null);
  
  // Sync state with URL params
  const [month, setMonth] = useState(searchParams.get("month") || "");
  const [year,  setYear]  = useState(searchParams.get("year") || "");
  const [from,  setFrom]  = useState(searchParams.get("from") || "");
  const [to,    setTo]    = useState(searchParams.get("to") || "");

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setMonth(searchParams.get("month") || "");
    setYear(searchParams.get("year") || "");
    setFrom(searchParams.get("from") || "");
    setTo(searchParams.get("to") || "");
  }, [searchParams]);

  // Close dropdowns on outside click
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();

    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setShowAdminMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = () => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (year) params.set("year", year);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    
    // Only push if we are on the dashboard, otherwise we might need different logic
    // but the request is specifically for the dashboard filters.
    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setMonth("");
    setYear("");
    setFrom("");
    setTo("");
    router.push("/");
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white flex items-center px-6 gap-4 shrink-0" style={{ borderBottom: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

      {/* Filters */}
      <div className="flex items-end gap-3 flex-1">
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5 min-w-[110px]"
            style={{ border: "1px solid #e5e7eb", background: "white", color: "#374151" }}>
            <option value="">Month</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5 min-w-[90px]"
            style={{ border: "1px solid #e5e7eb", background: "white", color: "#374151" }}>
            <option value="">Year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5"
            style={{ border: "1px solid #e5e7eb", color: "#374151" }} />
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5"
            style={{ border: "1px solid #e5e7eb", color: "#374151" }} />
        </div>

        <button 
          onClick={handleApply}
          className="text-sm font-bold text-white px-6 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#4caf50", boxShadow: "0 2px 8px rgba(76,175,80,0.35)" }}>
          Apply
        </button>
        <button onClick={handleReset}
          className="text-sm font-semibold px-5 py-1.5 rounded-lg transition-all hover:bg-gray-200"
          style={{ background: "#f3f4f6", color: "#6b7280" }}>
          Reset
        </button>
      </div>


      {/* Right — Notification & Admin */}
      <div className="flex items-center gap-3">

        {/* ─── Notification Bell ─── */}
        <div className="relative" ref={notifRef}>
          <button
            id="notification-bell"
            onClick={() => { setShowNotifications((v) => !v); setShowAdminMenu(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <Bell size={16} color="#6b7280" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: "#ef4444", padding: "0 4px" }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-xl overflow-hidden z-50"
              style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 10px 40px rgba(0,0,0,0.12)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                <span className="text-sm font-bold" style={{ color: "#111827" }}>Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-semibold hover:underline" style={{ color: "#4caf50" }}>
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="hover:bg-gray-100 rounded-lg p-0.5 transition-colors">
                    <X size={14} color="#9ca3af" />
                  </button>
                </div>
              </div>

              {/* Notification items */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-sm" style={{ color: "#9ca3af" }}>No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                      style={{ background: n.read ? "white" : "#f0fdf4", borderBottom: "1px solid #f5f5f5" }}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ background: n.read ? "transparent" : "#4caf50" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#111827" }}>{n.title}</p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#6b7280" }}>{n.message}</p>
                        <p className="text-[10px] mt-1 font-medium" style={{ color: "#9ca3af" }}>{n.time}</p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                          className="mt-1 hover:bg-green-100 rounded p-0.5 transition-colors" title="Mark as read"
                        >
                          <Check size={12} color="#4caf50" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid #f0f0f0" }}>
                <button className="text-xs font-semibold hover:underline" style={{ color: "#4caf50" }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Admin Dropdown ─── */}
        <div className="relative" ref={adminRef}>
          <div
            id="admin-menu-trigger"
            onClick={() => { setShowAdminMenu((v) => !v); setShowNotifications(false); }}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors select-none"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#4caf50" }}>
              <span className="text-white text-xs font-black">{(user?.full_name || "A")[0].toUpperCase()}</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "#374151" }}>{user?.full_name || "Admin"}</span>
            <ChevronDown size={14} color="#9ca3af" style={{ transform: showAdminMenu ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </div>

          {showAdminMenu && (
            <div className="absolute right-0 top-12 w-52 rounded-xl overflow-hidden z-50"
              style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 10px 40px rgba(0,0,0,0.12)" }}>
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                <p className="text-sm font-bold" style={{ color: "#111827" }}>{user?.full_name || "Administrator"}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>{user?.email || "admin@mitra.com"}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { setShowAdminMenu(false); router.push("/settings/users"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "#374151" }}
                >
                  <User size={15} color="#6b7280" />
                  Profile
                </button>
                <button
                  onClick={() => { setShowAdminMenu(false); router.push("/settings/app-version"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "#374151" }}
                >
                  <Settings size={15} color="#6b7280" />
                  Settings
                </button>
              </div>

              <div style={{ borderTop: "1px solid #f0f0f0" }} className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors text-left"
                  style={{ color: "#ef4444" }}
                >
                  <LogOut size={15} color="#ef4444" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}