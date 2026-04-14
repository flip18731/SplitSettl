# SplitSettl

**AI-Powered Payment Splitting on HashKey Chain**

> An AI agent that analyzes GitHub contributions, generates evidence-based invoices, and automatically splits payments to team members via HSP — fully on-chain on HashKey Chain.

---

## Problem

Freelancer teams working for DAOs get paid in lump sums. Splitting payments is manual, error-prone, and lacks transparency. There is no standard for automated, AI-driven payment splitting in Web3.

## Solution

SplitSettl uses Claude AI to analyze real GitHub commit data, measure each contributor's **impact** (not just volume), and generate transparent invoices with data-driven split ratios. Payments are split atomically on-chain via smart contracts on HashKey Chain. The full payment lifecycle — Request → Confirmation → Receipt — is recorded through HSP for an immutable audit trail.

---

## Architecture

```
Frontend (Next.js)
├── Dashboard      Stats, live payment feed, flow canvas, AI agent status
├── Projects       Project list + detail with team splits and payment history
├── Invoices       AI invoice generator — 5-phase cinematic analysis journey
└── API Routes
    ├── /api/ai/analyze     Claude API for real GitHub contribution analysis
    └── /api/hsp/status     HSP status tracking

Smart Contracts (HashKey Chain)
├── SplitSettl.sol    Project registry, atomic payment splitting, full HSP lifecycle
├── MockUSDT.sol      ERC20 test token for testnet demos (6 decimals, free mint)
└── Scripts           Deploy + seed with pre-populated demo data
```

---

## Deployed Contracts

| Contract | Network | Address |
|----------|---------|---------|
| SplitSettl | HashKey Testnet (133) | _Deploy with `npm run deploy:testnet`_ |
| MockUSDT | HashKey Testnet (133) | _Deploy with `npm run deploy:testnet`_ |
| SplitSettl | HashKey Mainnet (177) | _Deploy with `npm run deploy:mainnet`_ |

> Set `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_MOCK_USDT_ADDRESS` in `.env.local` after deployment.

---

## How HSP is Used

HSP (HashKey Settlement Protocol) is deeply integrated into every ERC20 payment flow. All three lifecycle stages happen **atomically in a single transaction**:

### 3-Stage HSP Lifecycle

```
1. HSP Payment Request  ──▶  HSPRequestCreated event emitted on-chain
        │                     hspMessages[id] = { status: Requested, amount, ... }
        │                     projectHSPMessageIds[projectId].push(id)
        ▼
2. Payment Execution    ──▶  ERC20 transferred from sender → contract → contributors
        │                     PaymentSplit + ContributorPaid events emitted
        │                     hspMessages[id].status = Confirmed
        │                     HSPConfirmed event emitted
        ▼
3. HSP Receipt          ──▶  Deterministic txRef computed on-chain
                              hspMessages[id].status = ReceiptGenerated
                              HSPReceiptGenerated event emitted with txRef hash
```

All HSP message IDs are stored per-project (`projectHSPMessageIds` mapping) for a permanent on-chain audit trail. The frontend visualizes this as a step-by-step progress timeline in `PaymentFlowSteps`.

---

## Supported Stablecoins

### HashKey Chain Mainnet (Chain ID: 177)
| Token | Address |
|-------|---------|
| USDT | `0xf1b50ed67a9e2cc94ad3c477779e2d4cbfff9029` |
| USDC | `0x054ed45810DbBAb8B27668922D110669c9D88D0a` |

### HashKey Chain Testnet (Chain ID: 133)
| Token | Address |
|-------|---------|
| MockUSDT | Set via `NEXT_PUBLIC_MOCK_USDT_ADDRESS` after deploy |

Switch networks by setting `NEXT_PUBLIC_CHAIN_ID=177` (mainnet) or `133` (testnet).

---

## `.splitsettle.json` — Auto Wallet Configuration

Drop a `.splitsettle.json` file in any GitHub repo root to auto-configure contributor wallet addresses. SplitSettl fetches this file during analysis and pre-fills payment destinations:

```json
{
  "contributors": {
    "alice": "0xABC...123",
    "bob": "0xDEF...456",
    "carol": "0x789...GHI"
  }
}
```

Keys are GitHub usernames (login). When found, invoices display an **Auto-configured** badge and show shortened wallet addresses for each contributor.

---

## How AI is Used

SplitSettl uses **Claude** (`claude-sonnet-4-20250514`) to analyze real GitHub commits with actual code diffs and measure each contributor's impact across 5 dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Complexity | 30% | Technical depth — smart contracts, algorithms > config, docs |
| Feature Impact | 30% | New capabilities vs. minor tweaks |
| Scope Breadth | 15% | How many different areas of the codebase were touched |
| Consistency | 15% | Steady cadence over time vs. single burst |
| Volume | 10% | Raw line count — weighted **least** intentionally |

This produces an `impactRating` (HIGH / MEDIUM / LOW) and a weighted impact score for each contributor, with specific commit SHAs cited as evidence.

---

## 5-Phase Analysis Journey

The invoice page features a cinematic 5-phase animated analysis:

1. **FetchSteps** — Real-time GitHub API connection and commit fetch progress
2. **CodeScanAnimation** — Actual code from the repo scanned line-by-line with impact coloring
3. **ImpactRadar** — Animated radar chart comparing all 5 impact dimensions per contributor
4. **SplitStreamAnimation** — Bezier flow visualization showing money routing proportional to splits
5. **InvoiceReveal** — Full invoice with mini radar thumbnails, evidence links, and wallet addresses

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | HashKey Chain (OP Stack L2) — Testnet 133 / Mainnet 177 |
| Smart Contracts | Solidity 0.8.19, Hardhat |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| AI Engine | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Settlement | HSP (HashKey Settlement Protocol) — 3-stage on-chain lifecycle |
| Stablecoins | USDT / USDC (mainnet), MockUSDT (testnet) |
| Wallet | MetaMask, ethers.js v6 |

---

## Setup

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- HSK testnet tokens for gas (faucet: https://testnet.hsk.xyz)

### Install

```bash
# Smart contracts
cd contracts && npm install

# Frontend
cd ../frontend && npm install
```

### Configure

```bash
cp .env.example .env
# Fill in:
#   PRIVATE_KEY          — deployer wallet private key
#   ANTHROPIC_API_KEY    — for AI analysis
#   GITHUB_TOKEN         — for higher GitHub API rate limits
```

```bash
# frontend/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...    # from deploy output
NEXT_PUBLIC_MOCK_USDT_ADDRESS=0x...  # from deploy output (testnet only)
NEXT_PUBLIC_CHAIN_ID=133             # 133 = testnet, 177 = mainnet
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
```

### Deploy

```bash
cd contracts
npm run compile

# Testnet
npm run deploy:testnet
npm run seed

# Mainnet
npm run deploy:mainnet
```

### Run

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Flow

### Demo Video Script

**Scene 1 — Dashboard (0:00–0:20)**
Open the dashboard. Point to the live payment feed, animated flow canvas, and AI agent status badge. "Every payment you see here went through our 3-stage HSP lifecycle — Request, Confirmation, Receipt — all stored on HashKey Chain."

**Scene 2 — AI Invoice (0:20–1:00)**
Navigate to AI Invoice. Paste a GitHub repo URL (e.g., `https://github.com/anthropics/anthropic-sdk-python`). Click Analyze. Watch the 5-phase animation:
- Phase 1: "SplitSettl is fetching real commit data from GitHub's API"
- Phase 2: "Claude is reading actual code diffs, looking for complexity signals"
- Phase 3: "The radar shows each contributor's impact across 5 dimensions — notice volume is weighted least"
- Phase 4: "Money flows proportional to impact scores"
- Phase 5: Show the invoice — highlight evidence links (real commit SHAs), mini radar thumbnails, and the AI rationale

**Scene 3 — Settle (1:00–1:30)**
Click "Approve & Settle". Walk through the HSP progress steps:
- "Step 1: HSP Payment Request recorded on-chain"
- "Step 2: Smart contract splits USDT atomically to each contributor's wallet"
- "Step 3: HSP Confirmation emitted"
- "Step 4: HSP Receipt generated — immutable audit trail"

**Scene 4 — Verify (1:30–1:45)**
Return to Dashboard. Show the new payment in the live feed. "The full HSP lifecycle lives on HashKey Chain. Anyone can verify the split was fair."

---

## Hackathon Submission

**Event:** HashKey Chain On-Chain Horizon Hackathon  
**Track:** PayFi  
**Prize Pool:** $10,000  

### Compliance Checklist

- [x] Deployed on HashKey Chain (OP Stack L2)
- [x] HSP integration with 3-stage message lifecycle (Request → Confirmation → Receipt)
- [x] All HSP message IDs stored on-chain per project
- [x] USDT/USDC support (official mainnet token addresses)
- [x] MockUSDT for testnet demos
- [x] AI-powered contribution analysis (Claude API)
- [x] Real GitHub data (commits, diffs, file changes)
- [x] `.splitsettle.json` auto wallet address configuration
- [x] 5-phase cinematic analysis journey
- [x] MetaMask wallet integration with chain switching
- [x] Mainnet + testnet support via env var

---

## License

MIT
