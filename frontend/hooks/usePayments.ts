"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ALL_PAYMENTS,
  type Payment,
} from "@/lib/demo-data";
import { fetchPaymentsFromChain } from "@/lib/chain-payments";

export function usePayments() {
  const [chainPayments, setChainPayments] = useState<Payment[]>([]);
  const [source, setSource] = useState<"demo" | "chain">("demo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { payments, hasDeployedContract } = await fetchPaymentsFromChain();
        if (
          !cancelled &&
          hasDeployedContract &&
          payments.length > 0
        ) {
          setChainPayments(payments);
          setSource("chain");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const payments = useMemo(
    () => (source === "chain" ? chainPayments : ALL_PAYMENTS),
    [source, chainPayments]
  );

  const getPaymentsByProject = useCallback(
    (projectId: number) => {
      return payments.filter((p) => p.projectId === projectId);
    },
    [payments]
  );

  const getRecentPayments = useCallback(
    (limit: number = 10) => {
      return payments.slice(0, limit);
    },
    [payments]
  );

  const getTotalProcessed = useCallback(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  return {
    payments,
    source,
    loading,
    getPaymentsByProject,
    getRecentPayments,
    getTotalProcessed,
  };
}
