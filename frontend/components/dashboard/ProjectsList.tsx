"use client";

import Link from "next/link";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import { formatNumberEnUS } from "@/lib/format";
import Card, { CardHeader } from "@/components/shared/Card";
import SplitBar from "@/components/shared/SplitBar";

export default function ProjectsList() {
  return (
    <Card accent="teal">
      <CardHeader>
        <span className="text-[13px] font-semibold text-text-primary">Projects</span>
      </CardHeader>

      <div>
        {DEMO_PROJECTS.map((project, i) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className={`block px-5 py-3.5 hover:bg-bg-elevated transition-colors cursor-pointer ${
              i < DEMO_PROJECTS.length - 1 ? "border-b border-bg-elevated" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[13px] font-semibold text-text-primary">{project.name}</p>
                <p className="text-[11px] text-text-tertiary">
                  {project.contributors.map((c) => c.name).join(", ")}
                </p>
              </div>
              <p className="text-[17px] font-semibold text-text-primary">
                ${formatNumberEnUS(project.totalPaid)}
              </p>
            </div>
            <SplitBar splits={project.contributors.map((c) => c.splitBps / 100)} />
          </Link>
        ))}
      </div>
    </Card>
  );
}
