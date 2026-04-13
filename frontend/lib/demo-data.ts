export interface Contributor {
  address: string;
  name: string;
  avatar: string;
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
  hspStatus: "requested" | "confirmed" | "receipt";
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

const CONTRIBUTORS: Record<string, Contributor> = {
  alice: {
    address: "0x1a2B...3c4D",
    name: "Alice Chen",
    avatar: "AC",
    splitBps: 0,
    totalEarned: 0,
  },
  bob: {
    address: "0x2b3C...4d5E",
    name: "Bob Kumar",
    avatar: "BK",
    splitBps: 0,
    totalEarned: 0,
  },
  carol: {
    address: "0x3c4D...5e6F",
    name: "Carol Zhang",
    avatar: "CZ",
    splitBps: 0,
    totalEarned: 0,
  },
  dave: {
    address: "0x4d5E...6f7A",
    name: "Dave Wilson",
    avatar: "DW",
    splitBps: 0,
    totalEarned: 0,
  },
  eve: {
    address: "0x5e6F...7a8B",
    name: "Eve Martinez",
    avatar: "EM",
    splitBps: 0,
    totalEarned: 0,
  },
  frank: {
    address: "0x6f7A...8b9C",
    name: "Frank Li",
    avatar: "FL",
    splitBps: 0,
    totalEarned: 0,
  },
  grace: {
    address: "0x7a8B...9c0D",
    name: "Grace Park",
    avatar: "GP",
    splitBps: 0,
    totalEarned: 0,
  },
  henry: {
    address: "0x8b9C...0d1E",
    name: "Henry Zhao",
    avatar: "HZ",
    splitBps: 0,
    totalEarned: 0,
  },
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
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
  contribs: { key: string; pct: number }[]
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
    timestamp: daysAgo(daysBack),
    contributors: contribs.map((c) => ({
      address: CONTRIBUTORS[c.key].address,
      name: CONTRIBUTORS[c.key].name,
      amount: parseFloat(((amount * c.pct) / 100).toFixed(2)),
    })),
    txHash: `0x${id.replace(/[^a-f0-9]/gi, "")}${"a".repeat(60)}`.slice(0, 66),
  };
}

const project1Payments: Payment[] = [
  makePayment("p1-1", 0, "HashKey DeFi SDK", 500, "INV-2024-001", "HSP-REQ-001", 28, [
    { key: "alice", pct: 40 }, { key: "bob", pct: 35 }, { key: "carol", pct: 25 },
  ]),
  makePayment("p1-2", 0, "HashKey DeFi SDK", 750, "INV-2024-002", "HSP-REQ-002", 21, [
    { key: "alice", pct: 40 }, { key: "bob", pct: 35 }, { key: "carol", pct: 25 },
  ]),
  makePayment("p1-3", 0, "HashKey DeFi SDK", 1000, "INV-2024-003", "HSP-REQ-003", 14, [
    { key: "alice", pct: 40 }, { key: "bob", pct: 35 }, { key: "carol", pct: 25 },
  ]),
  makePayment("p1-4", 0, "HashKey DeFi SDK", 300, "INV-2024-008", "HSP-REQ-008", 7, [
    { key: "alice", pct: 40 }, { key: "bob", pct: 35 }, { key: "carol", pct: 25 },
  ]),
  makePayment("p1-5", 0, "HashKey DeFi SDK", 1200, "INV-2024-009", "HSP-REQ-009", 2, [
    { key: "alice", pct: 40 }, { key: "bob", pct: 35 }, { key: "carol", pct: 25 },
  ]),
];

const project2Payments: Payment[] = [
  makePayment("p2-1", 1, "NFT Marketplace Frontend", 800, "INV-2024-004", "HSP-REQ-004", 20, [
    { key: "dave", pct: 55 }, { key: "eve", pct: 45 },
  ]),
  makePayment("p2-2", 1, "NFT Marketplace Frontend", 600, "INV-2024-005", "HSP-REQ-005", 10, [
    { key: "dave", pct: 55 }, { key: "eve", pct: 45 },
  ]),
  makePayment("p2-3", 1, "NFT Marketplace Frontend", 950, "INV-2024-010", "HSP-REQ-010", 3, [
    { key: "dave", pct: 55 }, { key: "eve", pct: 45 },
  ]),
];

const project3Payments: Payment[] = [
  makePayment("p3-1", 2, "Smart Contract Audit Tool", 2000, "INV-2024-006", "HSP-REQ-006", 25, [
    { key: "alice", pct: 30 }, { key: "frank", pct: 25 }, { key: "grace", pct: 25 }, { key: "henry", pct: 20 },
  ]),
  makePayment("p3-2", 2, "Smart Contract Audit Tool", 1500, "INV-2024-007", "HSP-REQ-007", 18, [
    { key: "alice", pct: 30 }, { key: "frank", pct: 25 }, { key: "grace", pct: 25 }, { key: "henry", pct: 20 },
  ]),
  makePayment("p3-3", 2, "Smart Contract Audit Tool", 1800, "INV-2024-011", "HSP-REQ-011", 9, [
    { key: "alice", pct: 30 }, { key: "frank", pct: 25 }, { key: "grace", pct: 25 }, { key: "henry", pct: 20 },
  ]),
  makePayment("p3-4", 2, "Smart Contract Audit Tool", 900, "INV-2024-012", "HSP-REQ-012", 1, [
    { key: "alice", pct: 30 }, { key: "frank", pct: 25 }, { key: "grace", pct: 25 }, { key: "henry", pct: 20 },
  ]),
];

export const DEMO_PROJECTS: Project[] = [
  {
    id: 0,
    name: "HashKey DeFi SDK",
    owner: "0x9c0D...1e2F",
    description: "Core DeFi primitives and SDK for building on HashKey Chain",
    contributors: [
      { ...CONTRIBUTORS.alice, splitBps: 4000, totalEarned: 1500 },
      { ...CONTRIBUTORS.bob, splitBps: 3500, totalEarned: 1312.5 },
      { ...CONTRIBUTORS.carol, splitBps: 2500, totalEarned: 937.5 },
    ],
    totalPaid: 3750,
    payments: project1Payments,
    createdAt: daysAgo(35),
  },
  {
    id: 1,
    name: "NFT Marketplace Frontend",
    owner: "0x9c0D...1e2F",
    description: "Modern NFT marketplace UI with HashKey Chain integration",
    contributors: [
      { ...CONTRIBUTORS.dave, splitBps: 5500, totalEarned: 1292.5 },
      { ...CONTRIBUTORS.eve, splitBps: 4500, totalEarned: 1057.5 },
    ],
    totalPaid: 2350,
    payments: project2Payments,
    createdAt: daysAgo(30),
  },
  {
    id: 2,
    name: "Smart Contract Audit Tool",
    owner: "0x9c0D...1e2F",
    description: "AI-powered smart contract vulnerability scanner and audit report generator",
    contributors: [
      { ...CONTRIBUTORS.alice, splitBps: 3000, totalEarned: 1860 },
      { ...CONTRIBUTORS.frank, splitBps: 2500, totalEarned: 1550 },
      { ...CONTRIBUTORS.grace, splitBps: 2500, totalEarned: 1550 },
      { ...CONTRIBUTORS.henry, splitBps: 2000, totalEarned: 1240 },
    ],
    totalPaid: 6200,
    payments: project3Payments,
    createdAt: daysAgo(32),
  },
];

export const ALL_PAYMENTS: Payment[] = [
  ...project1Payments,
  ...project2Payments,
  ...project3Payments,
].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

export const DEMO_STATS = {
  totalPaymentsProcessed: 12300,
  activeProjects: 3,
  totalContributors: 8,
  aiInvoicesGenerated: 15,
  totalPaymentCount: 12,
};
