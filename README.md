# SplitSettl

**AI-Powered Invoice Splitting & Streaming Settlement Protocol on HashKey Chain**

> Automatically analyze work contributions, generate invoices, and split payments to multiple contributors — all on-chain with full HSP audit trails.

---

## Problem

Freelancers and DAO contributors working on collaborative projects face a recurring pain point: **splitting payments fairly is manual, opaque, and slow.** Project leads must manually track contributions, calculate splits, create invoices, and execute multiple transactions — often across weeks and with no on-chain audit trail. This creates payment delays, disputes, and trust issues.

## Solution

**SplitSettl** uses an AI agent (Claude) to analyze contributor work data (GitHub commits, task completions, hours logged), automatically determine fair payment splits with transparent justifications, and execute settlement through smart contracts on HashKey Chain. Every payment flows through the **HSP (HashKey Settlement Protocol)** lifecycle — Request, Confirmation, Receipt — providing a complete, immutable audit trail.

---

## Architecture

```
+-----------------------------------------------------+
|                  Frontend (Next.js)                   |
|  +----------+  +----------+  +-------------------+   |
|  | Dashboard |  | Projects |  | AI Invoice        |   |
|  | Overview  |  | & Splits |  | Generator         |   |
|  +----------+  +----------+  +-------------------+   |
+------------------------+----------------------------+
                         |
+------------------------v----------------------------+
|              AI Agent Service (Backend)               |
|  +--------------+  +----------------------------+    |
|  | Contribution  |  | Invoice Generator          |    |
|  | Analyzer     |  | (Claude API -> structured  |    |
|  | (GitHub/Task)|  |  invoice data)             |    |
|  +------+-------+  +------------+---------------+    |
+---------+---------------------------+----------------+
          |                           |
+---------v---------------------------v----------------+
|            Smart Contracts (HashKey Chain)             |
|  +--------------+  +----------------------------+    |
|  | SplitSettl   |  | HSP Integration            |    |
|  | .sol         |  | (Payment Request ->        |    |
|  | (Splits,     |  |  Confirmation -> Receipt)  |    |
|  |  Payments,   |  |                            |    |
|  |  History)    |  +----------------------------+    |
|  +--------------+                                    |
+------------------------------------------------------+
```

---

## HSP Integration (HashKey Settlement Protocol)

HSP is deeply integrated into every payment flow in SplitSettl:

1. **Payment Request** — When an invoice is approved, an HSP Payment Request is created on-chain with full details (amount, recipients, split ratios). Event: `HSPRequestCreated`
2. **Payment Confirmation** — After the smart contract splits and distributes funds, the payment is confirmed through HSP. Event: `HSPConfirmed`
3. **Receipt Generation** — A settlement receipt is generated with the transaction hash, providing an immutable audit trail. Event: `HSPReceiptGenerated`

All HSP message IDs are stored on-chain for full traceability. The frontend displays the HSP flow as a visual pipeline for each payment.

---

## AI Integration

SplitSettl uses **Claude** (Anthropic's AI) to:

- **Analyze Contributions** — Parse GitHub commit data, task completions, and hours to understand each contributor's impact
- **Recommend Fair Splits** — Generate percentage-based payment splits with transparent justifications
- **Generate Invoices** — Create structured invoices with line items, rates, and totals
- **Automate Payment Flows** — Trigger the full HSP settlement flow after invoice approval

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | HashKey Chain (OP Stack L2, Chain ID: 133) |
| Smart Contracts | Solidity 0.8.19, Hardhat |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| AI Engine | Anthropic Claude API |
| Settlement | HSP (HashKey Settlement Protocol) |
| Wallet | MetaMask (ethers.js v6) |

---

## Project Structure

```
splitsettl/
├── contracts/
│   ├── SplitSettl.sol          # Core smart contract
│   ├── interfaces/IERC20.sol   # ERC-20 interface
│   ├── hardhat.config.ts       # Hardhat configuration
│   ├── scripts/
│   │   ├── deploy.ts           # Deploy to HashKey Testnet
│   │   └── seed.ts             # Seed demo data
│   └── test/
│       └── SplitSettl.test.ts  # Contract tests
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Dashboard
│   │   ├── projects/           # Project management
│   │   ├── invoice/            # AI Invoice Generator
│   │   └── api/                # API routes (AI, HSP)
│   ├── components/             # UI components
│   ├── lib/                    # Utilities & config
│   └── hooks/                  # React hooks
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- HSK testnet tokens (for gas)

### 1. Install Dependencies

```bash
# Smart contracts
cd contracts && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your private key and API keys
```

### 3. Deploy Smart Contract

```bash
cd contracts
npm run compile
npm run deploy:testnet
```

### 4. Seed Demo Data

```bash
npm run seed
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Flow

1. **Dashboard** — View real-time stats, live payment feed, and AI activity
2. **AI Invoice** — Paste GitHub contribution data, click "Generate Invoice with AI"
3. **Review** — See AI-recommended splits with justifications
4. **Pay** — Click "Approve & Pay" to watch the animated HSP settlement flow
5. **Verify** — Check payment history with complete HSP audit trail

---

## Screenshots

*Coming soon — see demo video*

---

## Demo Video

*[Link to demo video]*

---

## Team

Built for the **HashKey Chain On-Chain Horizon Hackathon** (PayFi Track)

---

## License

MIT
