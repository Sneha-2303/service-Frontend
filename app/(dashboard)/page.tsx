"use client";

import StatCards from "@/components/StatCards";
import ZoneComplaintsChart from "@/components/ZoneComplaintsChart";
import ZoneMTTRChart from "@/components/ZoneMTTRChart";
import EscalatedComplaints from "@/components/EscalatedComplaints";
import ComplaintsAging from "@/components/ComplaintsAging";
import ZoneRatings from "@/components/ZoneRatings";
import RatingsDistribution from "@/components/RatingsDistribution";
import TopEngineers from "@/components/TopEngineers";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-5">

      {/* Row 1 — Stat cards */}
      <StatCards />

      {/* Row 2 — Zone charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ZoneComplaintsChart />
        <ZoneMTTRChart />
      </div>

      {/* Row 3 — Escalated + Aging */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <EscalatedComplaints />
        <ComplaintsAging />
      </div>

      {/* Row 4 — Zone ratings */}
      <ZoneRatings />

      {/* Row 5 — Ratings distribution */}
      <RatingsDistribution />

      {/* Row 6 — Top engineers */}
      <TopEngineers />

    </div>
  );
}