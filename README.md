<p align="center">
  <img src="docs/splitsettle-logo.png" alt="SplitSettl logo" width="200" />
</p>

# SplitSettl

**AI-Powered Payment Splitting on HashKey Chain**

> An AI agent that analyzes GitHub contributions, generates evidence-based invoices, and automatically splits payments to team members via HSP — fully on-chain on HashKey Chain.

### Live demo · HashKey Chain testnet

| | |
|---|---|
| **App (production)** | **[Open SplitSettl →](https://split-settl.vercel.app/)** — *set the same URL as **Website** in the GitHub repo settings so judges see it on the repo home page.* |
| **Source** | [github.com/flip18731/SplitSettl](https://github.com/flip18731/SplitSettl) |

---

## Problem

Freelancer teams working for DAOs get paid in lump sums. Splitting payments is manual, error-prone, and lacks transparency. There is no standard for automated, AI-driven payment splitting in Web3.

## Solution

SplitSettl uses Claude AI to analyze real GitHub commit data, measure each contributor's **impact** (not just volume), and generate transparent invoices with data-driven split ratios. Payments are split atomically on-chain via smart contracts on HashKey Chain. The full payment lifecycle — Request → Confirmation → Receipt — is recorded through HSP for an immutable audit trail.

**HashKey Merchant (HSP gateway):** The invoice page can open a **real HashKey Merchant checkout** (`/api/hsp/create-order` → cart mandate, HMAC + ES256K JWT via `frontend/lib/hsp-client.ts` and `hsp-jwt.ts`). That is the **official PayFi HSP product integration**; credentials are server-side only (`HSP_APP_KEY`, `HSP_APP_SECRET`, `HSP_MERCHANT_PRIVATE_KEY`). On-chain, the contract still emits the same **HSPRequestCreated → HSPConfirmed → HSPReceiptGenerated** lifecycle for direct wallet settlement.

---

## Architecture

```
Frontend (Next.js)
├── Dashboard      Stats (on-chain when deployed), payment feed, flow canvas, AI agent status
├── Projects       Project list + detail with team splits and payment history
├── Invoices       AI invoice generator + wallet settlement (`createProject` + `submitPaymentERC20`)
└── API Routes
    ├── /api/ai/analyze       GitHub commits + LLM analysis (OpenAI/Anthropic)
    ├── /api/hsp/create-order HashKey Merchant cart mandate (HMAC + ES256K JWT)
    ├── /api/hsp/status       Server-side payment lookup
    └── /api/hsp/webhook      Gateway payment callbacks (signature-verified)

Smart Contracts (HashKey Chain)
├── contracts/src/SplitSettl.sol   Project registry, atomic payment splitting, full HSP lifecycle
├── contracts/src/MockUSDT.sol    ERC20 test token for testnet demos (6 decimals, public mint)
└── contracts/scripts              Deploy + seed with pre-populated demo data
```

### Vercel

- **Install / build:** Repo root runs `npm install` (workspaces) and `npm run build` → `cd frontend && npm run build`.
- **Alternative:** Set the Vercel project **Root Directory** to `frontend` and use default **Next.js** install/build (then remove or ignore root `vercel.json` overrides if they conflict).
- Set all **`NEXT_PUBLIC_*`** and server secrets (`ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, optional `HSP_*`) in the Vercel project **Environment Variables**.

---

## Deployed contracts (HashKey Chain)

**Explorer (testnet):** [explorer.hsk.xyz](https://explorer.hsk.xyz)

These addresses match the configured `NEXT_PUBLIC_*` deployment used for demos. After you redeploy, update this table and `frontend/.env.local` / Vercel env vars.

| Contract | Network | Address | Explorer |
|----------|---------|---------|----------|
| **SplitSettl** | HashKey Testnet (chain **133**) | `0x149e502b944413Eb868c1c52BE705BAA81aCC354` | [View on explorer](https://explorer.hsk.xyz/address/0x149e502b944413Eb868c1c52BE705BAA81aCC354) |
| **MockUSDT** (demo ERC20) | HashKey Testnet (133) | `0x95173f1185d362eAA1856DcAc7d60292c589C4e9` | [View on explorer](https://explorer.hsk.xyz/address/0x95173f1185d362eAA1856DcAc7d60292c589C4e9) |
| SplitSettl | HashKey Mainnet (177) | *Deploy with `cd contracts && npm run deploy:mainnet`* | — |

> **Local / Vercel:** set `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_MOCK_USDT_ADDRESS` to the rows above (testnet). Re-run `npm run deploy:testnet` from `contracts/` if you need a fresh deployment, then paste the new addresses here.

---

## How HSP is Used

**Official reference:** The PayFi track expects use of **HSP** as documented by HashKey — see the **HSP user manual** from the top navigation on [hashfans.io](https://hashfans.io/).

**Two layers:**

1. **HashKey Merchant API (PayFi checkout)** — Server routes create a **cart mandate** and return a **payment URL** (`/api/hsp/create-order`, signed with your app key + merchant JWT). This is the productized HSP payment flow from the Merchant dashboard.
2. **On-chain HSP lifecycle (audit / direct settlement)** — `SplitSettl.sol` implements the **request → confirmation → receipt** stages for **ERC20** payments (`submitPaymentERC20`): all three stages are recorded **atomically in one transaction**:

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

All HSP message IDs are stored per-project (`projectHSPMessageIds` mapping) for a permanent on-chain audit trail. The **AI Invoice** page walks through **real wallet settlement**: create project → (testnet) mint MockUSDT → approve → `submitPaymentERC20`, with an explorer link on success. The dashboard **payment feed** switches to **on-chain history** when `NEXT_PUBLIC_CONTRACT_ADDRESS` is configured and payments exist.

---

## Supported Stablecoins

### HashKey Chain Mainnet (Chain ID: 177)
| Token | Address |
|-------|---------|
| USDT | `0xf1b50ed67a9e2cc94ad3c477779e2d4cbfff9029` |
| USDC | `0x054ed45810DbBAb8B27668922D110669c9D88D0a` |

### HashKey Chain Testnet (Chain ID: 133)

Official **HSP / x402** token addresses (same as Merchant API chain-config; use for checkout and on-chain demos):

| Token | Address |
|-------|---------|
| **USDC** | `0x79AEc4EeA31D50792F61D1Ca0733C18c89524C9e` |
| **USDT** | `0x372325443233fEbaC1F6998aC750276468c83CC6` |

Local **MockUSDT** (deployed with this repo for minting in demos):

| Token | Address |
|-------|---------|
| MockUSDT | `0x95173f1185d362eAA1856DcAc7d60292c589C4e9` *(see Deployed contracts table)* |

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

### Address in commit messages (optional)

You can put a **valid 40-character hex address** (`0x` + 40 hex chars) in a **commit message** of that contributor. On the next analysis, SplitSettl picks the first valid address found in that author’s commits (in addition to `.splitsettle.json`). See [`docs/WALLET_IN_COMMIT_MESSAGES.md`](docs/WALLET_IN_COMMIT_MESSAGES.md).

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
| Settlement | HSP — HashKey Merchant API (`hsp-client.ts`) + 3-stage on-chain lifecycle in `SplitSettl.sol` |
| Stablecoins | USDT / USDC (mainnet); USDT / USDC + MockUSDT (testnet) |
| Wallet | MetaMask, ethers.js v6 |

---

## Setup

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- HSK testnet tokens for gas — use the **official testnet faucet** (not the RPC URL `testnet.hsk.xyz`):
  - [HashKey Chain Testnet Faucet](https://faucet.hsk.xyz/faucet) (per [docs](https://docs.hashkeychain.net/docs/Build-on-HashKey-Chain/Tools/Faucet))
  - If that domain fails, try the migrated domain: [faucet.hashkeychain.net](https://faucet.hashkeychain.net/faucet)

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

## GitHub repository settings (visibility for judges)

GitHub does not read these from the repo files — set them once in the repo **Settings**:

- **Description:** e.g. `SplitSettl — AI invoices & payment splits on HashKey Chain (PayFi + HSP).`
- **Website:** your **Vercel production URL** (same as **Live demo** above).
- **Topics:** `hashkey-chain`, `hashkey`, `payfi`, `hsp`, `web3`, `solidity`, `nextjs`, `claude`, `defi`

---

## Hackathon Submission

**Event:** HashKey Chain On-Chain Horizon Hackathon  
**Track:** PayFi (AI-assisted analysis)  
**Prize pool (overall event):** 40,000 USDT — see official rules for per-track placement ([hashfans.io](https://hashfans.io/)).  

Use **`SUBMISSION.md`** for demo video link, deployed addresses, and a short pre-flight checklist.

### Compliance Checklist

- [x] Deployed on HashKey Chain testnet — **contract addresses + explorer links** in [Deployed contracts](#deployed-contracts-hashkey-chain) (update if you redeploy)
- [x] HSP: **Merchant API** (checkout) **+** 3-stage on-chain lifecycle (Request → Confirmation → Receipt)
- [x] All HSP message IDs stored on-chain per project
- [x] USDT/USDC support (official mainnet token addresses)
- [x] MockUSDT for testnet demos
- [x] AI-powered contribution analysis (Claude API)
- [x] Real GitHub data (commits, diffs, file changes)
- [x] `.splitsettle.json` auto wallet address configuration
- [x] 5-phase cinematic analysis journey
- [x] MetaMask wallet integration with chain switching
- [x] Mainnet + testnet support via env var
- [x] Invoice page: on-chain ERC20 settlement (`createProject` + `submitPaymentERC20`) with explorer link
- [x] Dashboard: payment feed + stats use chain data when a deployed contract has activity

---

## License

MIT — see [`LICENSE`](./LICENSE).
