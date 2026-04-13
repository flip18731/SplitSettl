"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import Card, { CardHeader, CardBody } from "@/components/shared/Card";
import SplitBar from "@/components/shared/SplitBar";
import HSPProgressBar from "@/components/shared/HSPProgressBar";
import StatusBadge from "@/components/shared/StatusBadge";

const SPLIT_COLORS = ["#2DD4A8", "#F59E42", "rgba(45,212,168,0.5)", "#5A6275"];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string, 10);
  const project = DEMO_PROJECTS.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-[15px] text-text-primary mb-2">Project not found</p>
          <Link href="/projects" className="text-[13px] text-accent-teal hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px]">
        <Link href="/projects" className="text-text-tertiary hover:text-text-secondary transition-colors">
          Projects
        </Link>
        <span className="text-text-tertiary">/</span>
        <span className="text-text-primary">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-text-primary">{project.name}</h1>
          <p className="text-[13px] text-text-tertiary mt-1">{project.description}</p>
        </div>
        <div className="text-right">
          <p className="text-[28px] font-light text-text-primary">
            <span className="text-accent-teal">$</span>{project.totalPaid.toLocaleString()}
          </p>
          <p className="text-[11px] text-text-tertiary">Total paid</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-5">
        {/* Left: Payment history */}
        <Card accent="teal">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text-primary">Payment History</span>
              <span className="text-[11px] text-text-tertiary">{project.payments.length} payments</span>
            </div>
          </CardHeader>

          <div>
            {project.payments.map((payment, i) => (
              <div
                key={payment.id}
                className={`px-5 py-4 ${i < project.payments.length - 1 ? "border-b border-bg-elevated" : ""}`}
              >
                {/* Payment row */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-text-primary">{payment.invoiceRef}</span>
                      <StatusBadge status={payment.hspStatus} />
                    </div>
                    <span className="text-[11px] text-text-tertiary">{formatDate(payment.timestamp)}</span>
                  </div>
                  <span className="text-[17px] font-semibold text-accent-teal">
                    ${payment.amount.toLocaleString()}
                  </span>
                </div>

                {/* Split details */}
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  {payment.contributors.map((c, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: SPLIT_COLORS[j % SPLIT_COLORS.length] }}
                      />
                      <span className="text-[11px] text-text-secondary">{c.name}</span>
                      <span className="text-[11px] font-semibold text-text-primary">${c.amount}</span>
                    </div>
                  ))}
                </div>

                {/* HSP mini timeline */}
                <div className="bg-bg-elevated rounded-md p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[1px] text-text-tertiary mb-2">
                    HSP Settlement Flow
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Request Created", desc: payment.hspRequestId },
                      { label: "Payment Confirmed", desc: `$${payment.amount} to ${payment.contributors.length} contributors` },
                      { label: "Receipt Issued", desc: `Tx: ${payment.txHash.slice(0, 14)}...` },
                    ].map((step, si) => (
                      <div key={si} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-accent-teal-bg flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M2 4L3.5 5.5L6 2.5" stroke="#2DD4A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-text-primary">{step.label}</span>
                          <span className="text-[10px] text-text-tertiary ml-2">{step.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Team & Splits */}
        <div className="space-y-5">
          <Card accent="teal">
            <CardHeader>
              <span className="text-[13px] font-semibold text-text-primary">Team & Splits</span>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Split bar */}
              <SplitBar splits={project.contributors.map((c) => c.splitBps / 100)} />

              {/* Contributor list */}
              <div className="space-y-3">
                {project.contributors.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: SPLIT_COLORS[i % SPLIT_COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary">{c.name}</p>
                      <p className="text-[10px] font-mono text-text-tertiary">{c.address}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-semibold text-accent-teal">
                        ${c.totalEarned.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-text-tertiary">{c.splitBps / 100}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* HSP Summary */}
          <Card accent="orange">
            <CardHeader>
              <span className="text-[13px] font-semibold text-text-primary">HSP Summary</span>
            </CardHeader>
            <CardBody>
              <HSPProgressBar completedSteps={3} />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-tertiary">Requests Created</span>
                  <span className="text-text-primary font-semibold">{project.payments.length}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-tertiary">Payments Confirmed</span>
                  <span className="text-text-primary font-semibold">{project.payments.length}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-tertiary">Receipts Issued</span>
                  <span className="text-accent-teal font-semibold">{project.payments.length}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
