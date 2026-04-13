"use client";

import { useState, useCallback } from "react";
import type { HSPStatusType } from "@/lib/hsp";

interface HSPFlowState {
  requestId: string | null;
  status: HSPStatusType | null;
  isProcessing: boolean;
}

export function useHSPStatus() {
  const [state, setState] = useState<HSPFlowState>({
    requestId: null,
    status: null,
    isProcessing: false,
  });

  const createRequest = useCallback(async (projectId: number, amount: number, currency: string) => {
    setState((s) => ({ ...s, isProcessing: true }));

    try {
      const res = await fetch("/api/hsp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          projectId,
          amount,
          currency,
        }),
      });

      const data = await res.json();
      setState({
        requestId: data.requestId,
        status: "requested",
        isProcessing: false,
      });
      return data.requestId;
    } catch {
      setState((s) => ({ ...s, isProcessing: false }));
      return null;
    }
  }, []);

  const confirmPayment = useCallback(async (requestId: string, txHash: string) => {
    setState((s) => ({ ...s, isProcessing: true }));

    try {
      await fetch("/api/hsp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          requestId,
          txHash,
        }),
      });
      setState((s) => ({ ...s, status: "confirmed", isProcessing: false }));
    } catch {
      setState((s) => ({ ...s, isProcessing: false }));
    }
  }, []);

  const generateReceipt = useCallback(async (requestId: string) => {
    setState((s) => ({ ...s, isProcessing: true }));

    try {
      await fetch("/api/hsp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "receipt",
          requestId,
        }),
      });
      setState((s) => ({ ...s, status: "receipt", isProcessing: false }));
    } catch {
      setState((s) => ({ ...s, isProcessing: false }));
    }
  }, []);

  return {
    ...state,
    createRequest,
    confirmPayment,
    generateReceipt,
  };
}
