"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import SplitVisualization, { getColor } from "@/components/payment/SplitVisualization";
import HSPStatusBadge from "@/components/payment/HSPStatusBadge";
import TransactionTimeline from "@/components/payment/TransactionTimeline";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string, 10);
  const project = DEMO_PROJECTS.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-white mb-2">Project not found</p>
          <Link href="/projects" className="text-sm text-[#00B894] hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const splits = project.contributors.map((c, i) => ({
    name: c.name,
    percentage: c.splitBps / 100,
    amount: c.totalEarned,
    color: getColor(i),
  }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-[rgba(255,255,255,0.45)] hover:text-white transition-colors">
          Projects
        </Link>
        <span className="text-[rgba(255,255,255,0.2)]">/</span>
        <span className="text-white">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <p className="text-sm text-[rgba(255,255,255,0.45)] mt-1">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-[rgba(0,184,148,0.1)] text-[#00B894] text-xs font-semibold">
            Active
          </span>
          <span className="text-xs text-[rgba(255,255,255,0.35)]">
            Created {formatDate(project.createdAt)}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs text-[rgba(255,255,255,0.45)] mb-1">Total Paid</p>
          <p className="text-xl font-bold text-white">${project.totalPaid.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs text-[rgba(255,255,255,0.45)] mb-1">Contributors</p>
          <p className="text-xl font-bold text-white">{project.contributors.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs text-[rgba(255,255,255,0.45)] mb-1">Payments</p>
          <p className="text-xl font-bold text-white">{project.payments.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs text-[rgba(255,255,255,0.45)] mb-1">HSP Receipts</p>
          <p className="text-xl font-bold text-[#00B894]">{project.payments.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Splits & Contributors */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Team & Splits</h3>
            <SplitVisualization splits={splits} size={140} />
          </div>

          {/* Contributors list */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Contributors</h3>
            <div className="space-y-3">
              {project.contributors.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)]">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: getColor(i) }}
                  >
                    {c.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.35)] font-mono">{c.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#00B894]">${c.totalEarned.toLocaleString()}</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.35)]">{c.splitBps / 100}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Payment History */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-white">Payment History</h3>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {project.payments.map((payment, idx) => (
                <div key={payment.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B894]/20 to-transparent flex items-center justify-center text-xs font-bold text-[#00B894]">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{payment.invoiceRef}</p>
                        <p className="text-xs text-[rgba(255,255,255,0.35)]">{formatDate(payment.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <HSPStatusBadge status={payment.hspStatus} />
                      <p className="text-base font-bold text-white">${payment.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Split breakdown */}
                  <div className="ml-11 flex items-center gap-2 flex-wrap mb-3">
                    {payment.contributors.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]"
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                          style={{ background: getColor(i) }}
                        >
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-[10px] text-[rgba(255,255,255,0.5)]">{c.name.split(" ")[0]}</span>
                        <span className="text-[10px] font-semibold text-[#00B894]">${c.amount}</span>
                      </div>
                    ))}
                  </div>

                  {/* HSP Timeline */}
                  <div className="ml-11 glass-card rounded-xl p-3">
                    <p className="text-[10px] text-[rgba(255,255,255,0.35)] uppercase tracking-wider mb-2 font-semibold">
                      HSP Settlement Flow
                    </p>
                    <TransactionTimeline
                      steps={[
                        {
                          label: "HSP Payment Request Created",
                          description: `Request ID: ${payment.hspRequestId}`,
                          status: "completed",
                          timestamp: formatDate(payment.timestamp),
                        },
                        {
                          label: "Payment Confirmed",
                          description: `$${payment.amount} split to ${payment.contributors.length} contributors`,
                          status: "completed",
                          timestamp: formatDate(payment.timestamp),
                        },
                        {
                          label: "HSP Receipt Generated",
                          description: `Tx: ${payment.txHash.slice(0, 16)}...`,
                          status: "completed",
                          timestamp: formatDate(payment.timestamp),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
