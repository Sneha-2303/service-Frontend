"use client";

import { Users, ClipboardList, AlertCircle, Wrench, Hammer, PauseCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function AnimatedNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}</span>;
}

export default function StatCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statsData, setStatsData] = useState({
    total_customers: 0,
    total_complaints: 0,
    today_complaints: 0,
    assigned_to_engineer: 0,
    need_installation: 0,
    hold_complaints: 0,
    closed_complaints: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const query = searchParams.toString();
        const res = await fetch(`${API_BASE}/dashboard/stats${query ? `?${query}` : ""}`);
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, [searchParams]);


  const stats = [
    {
      label: "Total Customers",
      value: statsData.total_customers,
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-white/80",
      path: "/customer",
    },
    {
      label: "Total Complaints",
      value: statsData.total_complaints,
      icon: ClipboardList,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-white/80",
      path: "/complaint",
    },
    {
      label: "Today's Complaints",
      value: statsData.today_complaints,
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-white/80",
      path: "/complaint?filter=today",
    },
    {
      label: "Assigned to Engineer",
      value: statsData.assigned_to_engineer,
      icon: Wrench,
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-white/80",
      path: "/complaint?status=Assigned",
    },
    {
      label: "Need Installation",
      value: statsData.need_installation,
      icon: Hammer,
      gradient: "from-orange-500 to-amber-600",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-white/80",
      path: "/complaint?status=Need%20Installation",
    },
    {
      label: "Hold Complaints",
      value: statsData.hold_complaints,
      icon: PauseCircle,
      gradient: "from-purple-500 to-pink-600",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-white/80",
      path: "/complaint?status=Hold",
    },
    {
      label: "Closed Complaints",
      value: statsData.closed_complaints,
      icon: CheckCircle,
      gradient: "from-teal-500 to-cyan-600",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-white/80",
      path: "/complaint?status=Closed",
    },
  ];

  const handleCardClick = (stat: any) => {
    if (stat.path) {
      router.push(stat.path);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            onClick={() => handleCardClick(stat)}
            className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-4 flex flex-col gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${stat.path ? 'cursor-pointer' : ''}`}
          >
            <div className={`${stat.iconBg} w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
              <Icon size={20} className={stat.iconColor} />
            </div>
            <div>
              <p className={`${stat.labelColor} text-xs font-medium leading-tight`}>{stat.label}</p>
              <div className={`${stat.valueColor} text-2xl font-bold mt-1`}>
                <AnimatedNumber target={stat.value} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}