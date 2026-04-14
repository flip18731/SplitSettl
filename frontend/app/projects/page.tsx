"use client";

import Link from "next/link";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import Card, { CardBody } from "@/components/shared/Card";
import SplitBar from "@/components/shared/SplitBar";
import { formatNumberEnUS } from "@/lib/format";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProjectsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text-primary">Projects</h1>
        <button className="px-4 py-2 rounded-md bg-gradient-to-br from-accent-teal to-[#22B896] text-bg-primary text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {DEMO_PROJECTS.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card accent="teal" className="hover:border-border-hover transition-colors cursor-pointer h-full">
              <CardBody className="space-y-4">
                <div>
                  <p className="text-[15px] font-semibold text-text-primary mb-1">
                    {project.name}
                  </p>
                  <p className="text-[12px] text-text-tertiary">{project.description}</p>
                </div>

                <SplitBar splits={project.contributors.map((c) => c.splitBps / 100)} />

                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-text-tertiary">
                    {project.contributors.length} contributors
                  </span>
                  <span className="text-text-tertiary">
                    Last payment {formatDate(project.payments[project.payments.length - 1]?.timestamp || project.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-[22px] font-light text-text-primary">
                    <span className="text-accent-teal">$</span>
                    {formatNumberEnUS(project.totalPaid)}
                  </span>
                  <span className="text-[12px] text-text-tertiary">
                    {project.payments.length} payments
                  </span>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
