"use client";

import StatsRow from "@/components/dashboard/StatsRow";
import FlowCanvas from "@/components/dashboard/FlowCanvas";
import PaymentFeed from "@/components/dashboard/PaymentFeed";
import AIAgentCard from "@/components/dashboard/AIAgentCard";
import ProjectsList from "@/components/dashboard/ProjectsList";

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <StatsRow />

      {/* Flow Canvas */}
      <FlowCanvas />

      {/* Main grid: feed left, sidebar right */}
      <div className="grid grid-cols-[1fr_380px] gap-5">
        {/* Left: Payment feed */}
        <PaymentFeed />

        {/* Right: AI agent + Projects */}
        <div className="space-y-5">
          <AIAgentCard />
          <ProjectsList />
        </div>
      </div>
    </div>
  );
}
