import { DEMO_ADDRESSES } from "./constants";

export interface Contributor {
  address: string;
  name: string;
  splitBps: number;
  totalEarned: number;
}

export interface Payment {
  id: string;
  projectId: number;
  projectName: string;
  amount: number;
  currency: string;
  invoiceRef: string;
  hspRequestId: string;
  hspStatus: "receipt" | "confirmed" | "pending";
  /** 0=none, 1=request, 2=confirmed, 3=receipt */
  hspSteps: number;
  timestamp: Date;
  contributors: { address: string; name: string; amount: number }[];
  txHash: string;
}

export interface Project {
  id: number;
  name: string;
  owner: string;
  contributors: Contributor[];
  totalPaid: number;
  payments: Payment[];
  createdAt: Date;
  description: string;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(d.getHours() - Math.floor(Math.random() * 12));
  return d;
}

function makePayment(
  id: string,
  projectId: number,
  projectName: string,
  amount: number,
  invoiceRef: string,
  hspReqId: string,
  daysBack: number,
  contribs: { key: string; name: string; pct: number }[]
): Payment {
  return {
    id,
    projectId,
    projectName,
    amount,
    currency: "USDT",
    invoiceRef,
    hspRequestId: hspReqId,
    hspStatus: "receipt",
    hspSteps: 3,
    timestamp: daysAgo(daysBack),
    contributors: contribs.map((c) => ({
      address: DEMO_ADDRESSES[c.key as keyof typeof DEMO_ADDRESSES] || c.key,
      name: c.name,
      amount: parseFloat(((amount * c.pct) / 100).toFixed(2)),
    })),
    txHash: `0x${id.replace(/[^a-f0-9]/gi, "")}${"a4b7c2d9e1f0".repeat(6)}`.slice(0, 66),
  };
}

const p1Contribs = [
  { key: "alice", name: "Alice", pct: 40 },
  { key: "bob", name: "Bob", pct: 35 },
  { key: "carol", name: "Carol", pct: 25 },
];
const p2Contribs = [
  { key: "dave", name: "Dave", pct: 55 },
  { key: "eve", name: "Eve", pct: 45 },
];
const p3Contribs = [
  { key: "alice", name: "Alice", pct: 30 },
  { key: "frank", name: "Frank", pct: 25 },
  { key: "grace", name: "Grace", pct: 25 },
  { key: "henry", name: "Henry", pct: 20 },
];

const project1Payments: Payment[] = [
  makePayment("p1-1", 0, "HashKey DeFi SDK", 1800, "INV-0021", "HSP-021", 28, p1Contribs),
  makePayment("p1-2", 0, "HashKey DeFi SDK", 2200, "INV-0022", "HSP-022", 21, p1Contribs),
  makePayment("p1-3", 0, "HashKey DeFi SDK", 1500, "INV-0023", "HSP-023", 14, p1Contribs),
  makePayment("p1-4", 0, "HashKey DeFi SDK", 950, "INV-0025", "HSP-025", 7, p1Contribs),
  makePayment("p1-5", 0, "HashKey DeFi SDK", 1200, "INV-0028", "HSP-028", 1, p1Contribs),
];

const project2Payments: Payment[] = [
  makePayment("p2-1", 1, "NFT Marketplace", 1600, "INV-0016", "HSP-016", 22, p2Contribs),
  makePayment("p2-2", 1, "NFT Marketplace", 1400, "INV-0019", "HSP-019", 12, p2Contribs),
  makePayment("p2-3", 1, "NFT Marketplace", 1850, "INV-0026", "HSP-026", 3, p2Contribs),
];

const project3Payments: Payment[] = [
  makePayment("p3-1", 2, "SC Audit Tool", 2000, "INV-0017", "HSP-017", 25, p3Contribs),
  makePayment("p3-2", 2, "SC Audit Tool", 1700, "INV-0020", "HSP-020", 18, p3Contribs),
  makePayment("p3-3", 2, "SC Audit Tool", 2100, "INV-0024", "HSP-024", 9, p3Contribs),
  makePayment("p3-4", 2, "SC Audit Tool", 1350, "INV-0027", "HSP-027", 2, p3Contribs),
];

export const DEMO_PROJECTS: Project[] = [
  {
    id: 0,
    name: "HashKey DeFi SDK",
    owner: "0x9c0D...1e2F",
    description: "Core DeFi primitives and SDK for building on HashKey Chain",
    contributors: [
      { ...{ address: DEMO_ADDRESSES.alice, name: "Alice" }, splitBps: 4000, totalEarned: 3060 },
      { ...{ address: DEMO_ADDRESSES.bob, name: "Bob" }, splitBps: 3500, totalEarned: 2677.5 },
      { ...{ address: DEMO_ADDRESSES.carol, name: "Carol" }, splitBps: 2500, totalEarned: 1912.5 },
    ],
    totalPaid: 7650,
    payments: project1Payments,
    createdAt: daysAgo(42),
  },
  {
    id: 1,
    name: "NFT Marketplace",
    owner: "0x9c0D...1e2F",
    description: "Modern NFT marketplace with HashKey Chain integration",
    contributors: [
      { ...{ address: DEMO_ADDRESSES.dave, name: "Dave" }, splitBps: 5500, totalEarned: 2667.5 },
      { ...{ address: DEMO_ADDRESSES.eve, name: "Eve" }, splitBps: 4500, totalEarned: 2182.5 },
    ],
    totalPaid: 4850,
    payments: project2Payments,
    createdAt: daysAgo(35),
  },
  {
    id: 2,
    name: "SC Audit Tool",
    owner: "0x9c0D...1e2F",
    description: "AI-powered smart contract vulnerability scanner",
    contributors: [
      { ...{ address: DEMO_ADDRESSES.alice, name: "Alice" }, splitBps: 3000, totalEarned: 2145 },
      { ...{ address: DEMO_ADDRESSES.frank, name: "Frank" }, splitBps: 2500, totalEarned: 1787.5 },
      { ...{ address: DEMO_ADDRESSES.grace, name: "Grace" }, splitBps: 2500, totalEarned: 1787.5 },
      { ...{ address: DEMO_ADDRESSES.henry, name: "Henry" }, splitBps: 2000, totalEarned: 1430 },
    ],
    totalPaid: 7150,
    payments: project3Payments,
    createdAt: daysAgo(38),
  },
];

export const ALL_PAYMENTS: Payment[] = [
  ...project1Payments,
  ...project2Payments,
  ...project3Payments,
].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

export const DEMO_STATS = {
  totalPaymentsProcessed: 19650,
  activeProjects: 3,
  totalContributors: 8,
  aiInvoicesGenerated: 28,
};
