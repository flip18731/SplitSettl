<p align="center">
  <img src="docs/splitsettle-logo.png" alt="SplitSettl logo" width="200" />
</p>

<h1 align="center">SplitSettl</h1>

<h2 align="center"><a href="https://split-settl.vercel.app/">https://split-settl.vercel.app/</a></h2>

<p align="center"><strong>AI-powered payment splitting on HashKey Chain</strong></p>

<p align="center">
  <a href="https://split-settl.vercel.app/"><img src="https://img.shields.io/badge/Live%20demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live demo" /></a>
  &nbsp;
  <img src="https://img.shields.io/badge/HashKey%20Chain-Testnet%20133-1E40AF?style=for-the-badge" alt="Chain" />
  &nbsp;
  <img src="https://img.shields.io/badge/Track-PayFi-059669?style=for-the-badge" alt="PayFi" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Solidity-0.8.19-363636?logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/Claude-AI-CC785C?logo=anthropic" alt="Claude" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
</p>

---

> **One-liner:** SplitSettl reads real GitHub commits, scores contributor **impact** with Claude, builds a transparent invoice, and settles **atomically on-chain** on HashKey Chain — with **HSP** both as **HashKey Merchant checkout** and as a **3-stage on-chain lifecycle** in the smart contract.

---

## Contents

| Section | What you’ll find |
|--------|------------------|
| [Quick links](#quick-links) | Live app, source, explorer |
| [Problem & solution](#problem--solution) | Why & what |
| [What’s inside](#whats-inside) | Features at a glance |
| [Architecture](#architecture) | Frontend, API, contracts |
| [Deployed contracts](#deployed-contracts-hashkey-chain) | Testnet addresses + explorer |
| [HSP](#how-hsp-is-used) | Merchant API + on-chain lifecycle |
| [Tokens](#supported-stablecoins) | Mainnet / testnet / MockUSDT |
| [AI scoring](#how-ai-is-used) | 5 dimensions |
| [`.splitsettle.json`](#splitsettlejson--auto-wallet-configuration) | Auto wallet mapping |
| [Setup & run](#setup) | Install, env, deploy, dev |
| [Demo script](#demo-flow) | Suggested recording flow |
| [Hackathon](#hackathon-submission) | Submission, checklist |

---

## Quick links

| | |
|:---|:---|
| **Try it** | **[split-settl.vercel.app](https://split-settl.vercel.app/)** |
| **Source** | [github.com/flip18731/SplitSettl](https://github.com/flip18731/SplitSettl) |
| **Explorer (testnet)** | [explorer.hsk.xyz](https://explorer.hsk.xyz) |
| **HSP manual (PayFi)** | [hashfans.io](https://hashfans.io/) |

*Set the same Vercel URL under your GitHub repo **About → Website** so judges see it immediately.*

---

## Problem & solution

### Problem

Teams paid in **lump sums** (DAOs, grants) still split money **manually**. That is slow, error-prone, and hard to audit — especially when “who did how much” should be **evidence-based**, not vibes.

### Solution

**SplitSettl** uses **Claude** on **real GitHub data** (commits, diffs) to produce **impact-weighted splits**, a proper **invoice**, and **one-transaction ERC20 settlement** on **HashKey Chain**. The **HSP** story is twofold:

1. **HashKey Merchant API** — server-side **cart mandate** + checkout URL (`/api/hsp/create-order`, HMAC + ES256K JWT in `frontend/lib/hsp-client.ts`, `hsp-jwt.ts`).
2. **On-chain HSP lifecycle** — `SplitSettl.sol` emits **Request → Confirmation → Receipt** for direct wallet flows (`submitPaymentERC20`).

---

## What’s inside

| Area | Details |
|------|---------|
| **Dashboard** | Stats, payment feed, flow canvas, AI agent card |
| **Projects** | Cards + detail with splits and history |
| **Invoices** | Repo URL → 5-phase analysis UI → invoice → **HSP Gateway** and/or **wallet settlement** |
| **APIs** | `/api/ai/analyze`, `/api/hsp/create-order`, `/api/hsp/status`, `/api/hsp/webhook` |
| **Contracts** | `contracts/src/SplitSettl.sol`, `MockUSDT.sol`, deploy + seed scripts |

---

## Architecture

```
Frontend (Next.js)
├── Dashboard      Stats, feed, flow canvas, AI status
├── Projects       List + detail (splits, payments)
├── Invoices       AI invoice + settlement (createProject + submitPaymentERC20)
└── API
    ├── /api/ai/analyze        GitHub + LLM
    ├── /api/hsp/create-order  Merchant cart mandate (HMAC + ES256K JWT)
    ├── /api/hsp/status        Payment lookup
    └── /api/hsp/webhook       Signed callbacks

Smart contracts (HashKey Chain)
├── contracts/src/SplitSettl.sol   Registry, splits, HSP events + storage
├── contracts/src/MockUSDT.sol   Testnet ERC20 (mint for demos)
└── contracts/scripts             Deploy + seed
```

### Vercel

- Root: `npm install` → `npm run build` runs `frontend` build (see root `package.json`).
- Or set Vercel **Root Directory** to `frontend` and use the Next.js defaults.
- Configure **`NEXT_PUBLIC_*`** and server secrets (`ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, optional `HSP_*`) in **Vercel → Environment Variables**.

---

## Deployed contracts (HashKey Chain)

**Explorer:** [explorer.hsk.xyz](https://explorer.hsk.xyz)

Update this table and `frontend/.env.local` / Vercel if you redeploy.

| Contract | Network | Address | Explorer |
|----------|---------|---------|----------|
| **SplitSettl** | Testnet **133** | `0x149e502b944413Eb868c1c52BE705BAA81aCC354` | [Open](https://explorer.hsk.xyz/address/0x149e502b944413Eb868c1c52BE705BAA81aCC354) |
| **MockUSDT** | Testnet **133** | `0x95173f1185d362eAA1856DcAc7d60292c589C4e9` | [Open](https://explorer.hsk.xyz/address/0x95173f1185d362eAA1856DcAc7d60292c589C4e9) |
| SplitSettl | Mainnet **177** | *`cd contracts && npm run deploy:mainnet`* | — |

Env: `NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_MOCK_USDT_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID=133`.

---

## How HSP is Used

Official PayFi reference: **HSP user manual** via [hashfans.io](https://hashfans.io/).

**Layer 1 — HashKey Merchant (checkout)**  
Server creates a **cart mandate** and returns a **payment URL** (`/api/hsp/create-order`). Credentials stay server-only: `HSP_APP_KEY`, `HSP_APP_SECRET`, `HSP_MERCHANT_PRIVATE_KEY`.

**Layer 2 — On-chain (audit / direct settlement)**  
`submitPaymentERC20` runs the full lifecycle in **one transaction**:

```
1. Request   → HSPRequestCreated        → hspMessages[id], projectHSPMessageIds
2. Confirm   → transfers + HSPConfirmed  → contributors paid
3. Receipt   → HSPReceiptGenerated       → txRef / audit
```

The **Invoice** page supports mint → approve → settle on testnet; the **dashboard feed** uses chain data when a contract is configured.

---

## Supported Stablecoins

### Mainnet (177)

| Token | Address |
|-------|---------|
| USDT | `0xf1b50ed67a9e2cc94ad3c477779e2d4cbfff9029` |
| USDC | `0x054ed45810DbBAb8B27668922D110669c9D88D0a` |

### Testnet (133) — official HSP / x402 (chain-config)

| Token | Address |
|-------|---------|
| USDC | `0x79AEc4EeA31D50792F61D1Ca0733C18c89524C9e` |
| USDT | `0x372325443233fEbaC1F6998aC750276468c83CC6` |

### Mock token (this repo)

| Token | Address |
|-------|---------|
| MockUSDT | `0x95173f1185d362eAA1856DcAc7d60292c589C4e9` |

`NEXT_PUBLIC_CHAIN_ID`: `133` (testnet) or `177` (mainnet).

---

## `.splitsettle.json` — Auto wallet configuration

Place `.splitsettle.json` at the **repo root**; analysis will map GitHub logins → addresses:

```json
{
  "contributors": {
    "alice": "0xABC...123",
    "bob": "0xDEF...456"
  }
}
```

Optional: a valid `0x` + 40 hex in a contributor’s **commit message** — see [`docs/WALLET_IN_COMMIT_MESSAGES.md`](docs/WALLET_IN_COMMIT_MESSAGES.md).

---

## How AI is Used

Model: **Claude** (`claude-sonnet-4-20250514`) on real diffs. Five dimensions:

| Dimension | Weight | Meaning |
|-----------|--------|---------|
| Complexity | 30% | Depth (contracts, algorithms vs. docs-only) |
| Feature impact | 30% | New capability vs. tiny tweak |
| Scope breadth | 15% | Breadth of codebase touched |
| Consistency | 15% | Steady work vs. one-off spike |
| Volume | 10% | Lines — **lowest** weight on purpose |

Output: per-contributor **impact** evidence, **impactRating** (HIGH / MEDIUM / LOW), and chart data for the UI.

---

## 5-phase analysis journey

On **Invoices**, analysis runs as a staged UI: fetch → code scan → impact radar → split stream → invoice reveal (with commit evidence and wallets where available).

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Chain | HashKey Chain (testnet 133 / mainnet 177) |
| Contracts | Solidity 0.8.19, Hardhat |
| App | Next.js 14, TypeScript, Tailwind |
| AI | Anthropic Claude |
| Settlement | HSP Merchant API + `SplitSettl.sol` lifecycle |
| Wallet | MetaMask, ethers.js v6 |

---

## Setup

### Prerequisites

- Node.js 18+
- MetaMask
- HSK testnet gas: [faucet.hsk.xyz](https://faucet.hsk.xyz/faucet) or [faucet.hashkeychain.net](https://faucet.hashkeychain.net/faucet)

### Install

```bash
cd contracts && npm install
cd ../frontend && npm install
```

### Configure

```bash
cp .env.example .env
# PRIVATE_KEY, ANTHROPIC_API_KEY, GITHUB_TOKEN …
```

```bash
# frontend/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USDT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=133
NEXT_PUBLIC_APP_URL=https://split-settl.vercel.app   # production HSP redirect
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
# Optional HSP: HSP_APP_KEY, HSP_APP_SECRET, HSP_MERCHANT_PRIVATE_KEY, HSP_API_BASE
```

### Deploy contracts (testnet)

```bash
cd contracts
npm run compile
npm run deploy:testnet
npm run seed
```

### Run locally

```bash
cd frontend && npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## Demo flow

**Suggested flow (short):**

1. **Dashboard** — payment feed, flow canvas, AI agent; tie to 3-stage HSP on-chain.
2. **Invoices** — public GitHub repo URL → Analyze → 5-phase UI → invoice + evidence.
3. **Settle** — HSP Gateway and/or wallet settlement → explorer.
4. **Dashboard** — confirm new activity in the feed.

<details>
<summary><strong>Full demo video script (timestamps)</strong></summary>

**Scene 1 — Dashboard (0:00–0:20)**  
Open the dashboard. Point to the live payment feed, animated flow canvas, and AI agent status. Say that payments align with the 3-stage HSP lifecycle on HashKey Chain.

**Scene 2 — AI Invoice (0:20–1:00)**  
Go to Invoices. Paste a repo URL (e.g. `https://github.com/anthropics/anthropic-sdk-python`). Run Analyze. Narrate the 5 phases: GitHub fetch → diffs → radar (volume weighted least) → split stream → invoice with commit SHAs and radars.

**Scene 3 — Settle (1:00–1:30)**  
Walk through settlement: HSP request → on-chain split → confirmation → receipt / audit.

**Scene 4 — Verify (1:30–1:45)**  
Return to Dashboard; show the updated feed and fairness / audit story.

</details>

---

## GitHub repository settings

Set manually (not in this file):

- **About → Description** — short English pitch (PayFi, HashKey, HSP).
- **About → Website** — `https://split-settl.vercel.app/`
- **Topics** — e.g. `hashkey-chain`, `payfi`, `hsp`, `web3`, `solidity`, `nextjs`, `typescript`, `defi`, `ai`

---

## Hackathon submission

**Event:** HashKey Chain On-Chain Horizon · **Track:** PayFi · **Rules / manual:** [hashfans.io](https://hashfans.io/)

Details, video link, and checklist: **[`SUBMISSION.md`](SUBMISSION.md)**.

### Compliance checklist

- [x] Deployed on HashKey testnet — [addresses + explorer](#deployed-contracts-hashkey-chain)
- [x] HSP: Merchant API + on-chain Request → Confirmation → Receipt
- [x] HSP message IDs stored per project on-chain
- [x] USDT/USDC mainnet + testnet token references
- [x] MockUSDT for demos
- [x] Claude + real GitHub data
- [x] `.splitsettle.json` + optional commit-message wallets
- [x] 5-phase invoice UI
- [x] MetaMask + chain switch
- [x] Invoice: `createProject` + `submitPaymentERC20` + explorer
- [x] Dashboard uses chain data when configured

---

## License

MIT — see [`LICENSE`](./LICENSE).
