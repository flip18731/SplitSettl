"use client";

import { useState, useEffect } from "react";
import { DEMO_STATS } from "@/lib/demo-data";
import { fetchChainAggregates } from "@/lib/chain-payments";

export function useDashboardStats() {
  const [stats, setStats] = useState(DEMO_STATS);
  const [source, setSource] = useState<"demo" | "chain">("demo");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const agg = await fetchChainAggregates();
      if (
        !cancelled &&
        agg &&
        (agg.activeProjects > 0 || agg.totalProcessed > 0)
      ) {
        setStats({
          totalPaymentsProcessed: Math.round(agg.totalProcessed),
          activeProjects: agg.activeProjects,
          totalContributors: agg.contributorAccounts,
          aiInvoicesGenerated: DEMO_STATS.aiInvoicesGenerated,
        });
        setSource("chain");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, source };
}
