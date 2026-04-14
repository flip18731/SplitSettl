"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

export function useContract() {
  const [loading, setLoading] = useState(false);

  const getProvider = useCallback(() => {
    if (typeof window === "undefined" || !window.ethereum) return null;
    return new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
  }, []);

  const getContract = useCallback(
    async (withSigner = false) => {
      const provider = getProvider();
      if (!provider) return null;

      if (withSigner) {
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      }

      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    },
    [getProvider]
  );

  const submitPayment = useCallback(
    async (projectId: number, invoiceRef: string, amountInEther: string) => {
      setLoading(true);
      try {
        const contract = await getContract(true);
        if (!contract) throw new Error("No wallet connected");

        const tx = await contract.submitPayment(projectId, invoiceRef, {
          value: ethers.parseEther(amountInEther),
        });
        const receipt = await tx.wait();
        return receipt;
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  const emitHSPRequest = useCallback(
    async (projectId: number, amount: string, hspRequestId: string) => {
      const contract = await getContract(true);
      if (!contract) throw new Error("No wallet connected");

      const tx = await contract.emitPaymentRequest(
        projectId,
        ethers.parseEther(amount),
        hspRequestId
      );
      return tx.wait();
    },
    [getContract]
  );

  const confirmHSPPayment = useCallback(
    async (projectId: number, hspRequestId: string) => {
      const contract = await getContract(true);
      if (!contract) throw new Error("No wallet connected");

      const tx = await contract.emitPaymentConfirmation(projectId, hspRequestId);
      return tx.wait();
    },
    [getContract]
  );

  const generateHSPReceipt = useCallback(
    async (projectId: number, hspRequestId: string, txHash: string) => {
      const contract = await getContract(true);
      if (!contract) throw new Error("No wallet connected");

      const tx = await contract.emitPaymentReceipt(
        projectId,
        hspRequestId,
        ethers.keccak256(ethers.toUtf8Bytes(txHash))
      );
      return tx.wait();
    },
    [getContract]
  );

  const createProject = useCallback(
    async (
      name: string,
      contributors: string[],
      splitBps: number[]
    ) => {
      setLoading(true);
      try {
        const contract = await getContract(true);
        if (!contract) throw new Error("No wallet connected");

        const bps = splitBps.map((b) => BigInt(b));
        const tx = await contract.createProject(name, contributors, bps);
        const receipt = await tx.wait();
        return receipt;
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  const submitPaymentERC20 = useCallback(
    async (
      projectId: number,
      tokenAddress: string,
      amountRaw: bigint,
      invoiceRef: string,
      hspRequestId: string
    ) => {
      setLoading(true);
      try {
        const contract = await getContract(true);
        if (!contract) throw new Error("No wallet connected");

        const tx = await contract.submitPaymentERC20(
          projectId,
          tokenAddress,
          amountRaw,
          invoiceRef,
          hspRequestId
        );
        const receipt = await tx.wait();
        return receipt;
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  return {
    loading,
    getContract,
    submitPayment,
    emitHSPRequest,
    confirmHSPPayment,
    generateHSPReceipt,
    createProject,
    submitPaymentERC20,
  };
}
