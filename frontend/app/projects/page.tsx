"use client";

import Link from "next/link";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import { getColor } from "@/components/payment/SplitVisualization";

export default function ProjectsPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-[rgba(255,255,255,0.45)] mt-1">
            Manage your team projects and payment splits
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00B894] to-[#00B894]/80 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Project
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {DEMO_PROJECTS.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="glass-card rounded-2xl p-5 hover:border-[rgba(255,255,255,0.12)] transition-all duration-300 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B894]/20 to-[#6C5CE7]/20 flex items-center justify-center text-sm font-bold text-white">
                {project.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <span className="px-2 py-1 rounded-lg bg-[rgba(0,184,148,0.1)] text-[#00B894] text-[10px] font-semibold">
                Active
              </span>
            </div>

            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-[#00B894] transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-[rgba(255,255,255,0.35)] mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Contributors */}
            <div className="flex items-center gap-1 mb-4">
              {project.contributors.map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white -ml-1 first:ml-0 ring-2 ring-[#0A0A0F]"
                  style={{ background: getColor(i) }}
                  title={c.name}
                >
                  {c.avatar}
                </div>
              ))}
              <span className="text-xs text-[rgba(255,255,255,0.35)] ml-2">
                {project.contributors.length} members
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <div>
                <p className="text-lg font-bold text-white">${project.totalPaid.toLocaleString()}</p>
                <p className="text-[10px] text-[rgba(255,255,255,0.35)]">Total paid</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[rgba(255,255,255,0.6)]">{project.payments.length}</p>
                <p className="text-[10px] text-[rgba(255,255,255,0.35)]">Payments</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
