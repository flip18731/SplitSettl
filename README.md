# SplitSettl

**AI-Powered Payment Splitting on HashKey Chain**

> An AI agent that analyzes contributions, generates invoices, and automatically splits payments to team members via HSP.

---

## Problem

Freelancer teams working for DAOs get paid in lump sums. Splitting payments is manual, error-prone, and lacks transparency. There's no standard for automated, AI-driven payment splitting in Web3.

## Solution

SplitSettl uses an AI agent to analyze work contributions (GitHub commits, task completions), recommend fair splits with transparent justifications, and generate invoices. Payments are split automatically on-chain via smart contracts on HashKey Chain. The full payment lifecycle is tracked through HSP (Request, Confirmation, Receipt) with an immutable audit trail.

---

## Architecture

```
Frontend (Next.js)
├── Dashboard      Stats + live payment feed + flow canvas + AI agent status
├── Projects       List + detail with team splits and payment history
├── Invoices       AI invoice generator (THE KEY DEMO PAGE)
└── API Routes
    ├── /api/ai/analyze     Claude API for contribution analysis
    └── /api/hsp/status     HSP status tracking

Smart Contracts (HashKey Chain Testnet)
├── SplitSettl.sol          Project registry, payment splitting, HSP events
└── Deploy + Seed scripts   Pre-populated demo data
```

---

## How HSP is Used

HSP (HashKey Settlement Protocol) is deeply integrated into every payment flow:

1. **Payment Request** — When an AI-generated invoice is approved, an HSP Payment Request is created on-chain with full details (amount, recipients, split ratios). Event: `HSPRequestCreated`
2. **Payment Confirmation** — After the smart contract splits and distributes funds to contributors, the payment is confirmed through HSP. Event: `HSPConfirmed`
3. **Receipt Issued** — A settlement receipt is generated with the transaction hash, providing an immutable on-chain audit trail. Event: `HSPReceiptIssued`

All HSP message IDs are stored on-chain. The frontend displays the HSP flow as a segmented progress bar and step-by-step timeline for every payment.

---

## How AI is Used

SplitSettl uses **Claude** (Anthropic) to:

- **Analyze Contributions** — Parse GitHub commit data, task completions, and hours to assess each contributor's impact
- **Recommend Fair Splits** — Generate percentage-based splits with transparent, data-driven justifications
- **Generate Invoices** — Create structured invoices with line items, hourly rates, and totals
- **Automate Settlement** — Trigger the full HSP payment flow after invoice approval

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | HashKey Chain Testnet (OP Stack L2, Chain ID: 133) |
| Smart Contracts | Solidity 0.8.19, Hardhat |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| AI Engine | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Settlement | HSP (HashKey Settlement Protocol) |
| Wallet | MetaMask, ethers.js v6 |

---

## Setup

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- HSK testnet tokens (for gas)

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
# Add your private key and Anthropic API key
```

### Deploy

```bash
cd contracts
npm run compile
npm run deploy:testnet
npm run seed
```

### Run

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Flow

1. **Dashboard** — Real-time stats, animated flow canvas, live payment feed, AI agent status
2. **AI Invoice** — Paste contribution data, click "Generate Invoice with AI"
3. **Review** — AI-generated invoice with split rationale for each contributor
4. **Settle** — Click "Approve & Settle" to watch the animated HSP flow step-by-step
5. **Verify** — Return to dashboard, check payment history with HSP audit trail

---

## Demo Video

*[Link to demo video]*

---

## Team

Built for the **HashKey Chain On-Chain Horizon Hackathon** (PayFi Track)

---

## License

MIT
