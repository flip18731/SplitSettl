"use client";

import { useState, useCallback } from "react";
import { ALL_PAYMENTS, type Payment } from "@/lib/demo-data";

export function usePayments() {
  const [payments] = useState<Payment[]>(ALL_PAYMENTS);

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
    getPaymentsByProject,
    getRecentPayments,
    getTotalProcessed,
  };
}
