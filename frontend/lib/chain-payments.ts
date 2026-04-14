import { ethers } from "ethers";
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  getActiveChainConfig,
} from "./contract";
import type { Payment } from "./demo-data";

const ZERO = ethers.ZeroAddress;
const USDT_DECIMALS = 6;
const HSK_DECIMALS = 18;

function mapHspSteps(status: number): number {
  if (status >= 3) return 3;
  if (status === 2) return 2;
  if (status === 1) return 1;
  return 0;
}

function mapHspStatus(
  status: number
): "receipt" | "confirmed" | "pending" {
  if (status >= 3) return "receipt";
  if (status === 2) return "confirmed";
  return "pending";
}

export async function fetchPaymentsFromChain(): Promise<{
  payments: Payment[];
  hasDeployedContract: boolean;
}> {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === ZERO) {
    return { payments: [], hasDeployedContract: false };
  }

  const rpc = getActiveChainConfig().rpcUrl;
  const provider = new ethers.JsonRpcProvider(rpc);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  const count = Number(await contract.projectCount());
  const payments: Payment[] = [];

  for (let projectId = 0; projectId < count; projectId++) {
    const proj = await contract.getProject(projectId);
    const projectName: string = proj[0];
    const payCount = Number(await contract.getProjectPaymentCount(projectId));
    if (payCount === 0) continue;

    const contrib = await contract.getProjectContributors(projectId);
    const addrArr = contrib.addrs ?? (contrib as unknown as [string[]])[0];
    const splitArr = contrib.splits ?? (contrib as unknown as [unknown, bigint[]])[1];
    const addrs: string[] = [...addrArr];
    const bps: bigint[] = splitArr.map((x: bigint | number | string) =>
      BigInt(x)
    );

    const history = await contract.getProjectPaymentHistory(projectId);

    for (let i = 0; i < payCount; i++) {
      const p = history[i] as Record<string, unknown> & unknown[];
      const rawAmt = BigInt((p.amount ?? p[0]) as bigint | string);
      const invoiceRef = String(p.invoiceRef ?? p[1]);
      const token = String(p.token ?? p[2]).toLowerCase();
      const ts = BigInt((p.timestamp ?? p[3]) as bigint | string);
      const hspRequestId = String(p.hspRequestId ?? p[4] ?? "");

      const isNative = token === ZERO.toLowerCase();
      const amountDisplay = isNative
        ? Number(ethers.formatUnits(rawAmt, HSK_DECIMALS))
        : Number(ethers.formatUnits(rawAmt, USDT_DECIMALS));

      let hspSteps = 3;
      let hspStatus: Payment["hspStatus"] = "receipt";
      if (hspRequestId) {
        try {
          const st = await contract.getHSPStatus(hspRequestId);
          const statusNum = Number(st[2]);
          hspSteps = mapHspSteps(statusNum);
          hspStatus = mapHspStatus(statusNum);
        } catch {
          hspSteps = 3;
        }
      } else {
        hspSteps = 3;
        hspStatus = "receipt";
      }

      const totalBps = bps.reduce((a, b) => a + b, BigInt(0));
      const contributors = addrs.map((addr, j) => {
        const shareBps = bps[j] ?? BigInt(0);
        const share =
          totalBps > BigInt(0)
            ? (amountDisplay * Number(shareBps)) / Number(totalBps)
            : 0;
        return {
          address: addr,
          name: `Contributor ${j + 1}`,
          amount: Math.round(share * 100) / 100,
        };
      });

      payments.push({
        id: `chain-${projectId}-${i}-${invoiceRef}`,
        projectId,
        projectName,
        amount: Math.round(amountDisplay * 100) / 100,
        currency: isNative ? "HSK" : "USDT",
        invoiceRef,
        hspRequestId: hspRequestId || "—",
        hspStatus,
        hspSteps,
        timestamp: new Date(Number(ts) * 1000),
        contributors,
        txHash: "",
      });
    }
  }

  payments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return { payments, hasDeployedContract: true };
}

export async function fetchChainAggregates(): Promise<{
  totalProcessed: number;
  activeProjects: number;
  contributorAccounts: number;
} | null> {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === ZERO) return null;

  const rpc = getActiveChainConfig().rpcUrl;
  const provider = new ethers.JsonRpcProvider(rpc);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  const projectCount = Number(await contract.projectCount());
  let totalProcessed = 0;
  let contributorAccounts = 0;

  for (let pid = 0; pid < projectCount; pid++) {
    const [, , cCount] = await contract.getProject(pid);
    contributorAccounts += Number(cCount);
    const n = Number(await contract.getProjectPaymentCount(pid));
    const hist = await contract.getProjectPaymentHistory(pid);
    for (let i = 0; i < n; i++) {
      const p = hist[i] as Record<string, unknown> & unknown[];
      const raw = BigInt((p.amount ?? p[0]) as bigint | string);
      const tok = String(p.token ?? p[2]).toLowerCase();
      const isNative = tok === ZERO.toLowerCase();
      const v = isNative
        ? Number(ethers.formatUnits(raw, HSK_DECIMALS))
        : Number(ethers.formatUnits(raw, USDT_DECIMALS));
      totalProcessed += v;
    }
  }

  return {
    totalProcessed: Math.round(totalProcessed * 100) / 100,
    activeProjects: projectCount,
    contributorAccounts,
  };
}
