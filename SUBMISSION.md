# HashKey On-Chain Horizon Hackathon — SplitSettl

## Track & scope

| Field | Value |
|--------|--------|
| **Track** | **PayFi** (AI-assisted contribution analysis + settlement) |
| **Chain** | HashKey Chain — **Testnet 133** (primary demo) / Mainnet 177 |
| **HSP** | **HashKey Merchant API** (`frontend/lib/hsp-client.ts`, `hsp-jwt.ts`, `/api/hsp/*`) **+** on-chain HSP lifecycle in `contracts/src/SplitSettl.sol` |
| **Manual** | [hashfans.io](https://hashfans.io/) — HSP user documentation (navigation / PayFi) |

## Live demo (required for judges)

**Production URL (Vercel):** **[https://split-settl.vercel.app/](https://split-settl.vercel.app/)**

Also set the same URL as **Website** on the GitHub repository (repo → **Settings** → General → **Website**).

## Demo video

**Link:** _[YouTube / Loom / Google Drive — public or unlisted]_

Suggested flow: see `README.md` → **Demo Flow** (Dashboard → AI Invoice with a real repo → settlement / HSP checkout).

## Deployed contracts (HashKey testnet, chain 133)

| Contract | Address | Explorer |
|----------|---------|----------|
| SplitSettl | `0x149e502b944413Eb868c1c52BE705BAA81aCC354` | [explorer.hsk.xyz](https://explorer.hsk.xyz/address/0x149e502b944413Eb868c1c52BE705BAA81aCC354) |
| MockUSDT | `0x95173f1185d362eAA1856DcAc7d60292c589C4e9` | [explorer.hsk.xyz](https://explorer.hsk.xyz/address/0x95173f1185d362eAA1856DcAc7d60292c589C4e9) |

_If you redeploy, replace both addresses here and in `README.md`._

## Official HSP testnet tokens (reference)

| Token | Address |
|-------|---------|
| USDC | `0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6` |
| USDT | `0x372325443233fEbaC1F6998aC750276468c83CC6` |

## Submission platform

**DoraHacks / other:** _[add your official hackathon project URL when available]_

## Pre-flight checklist

- [ ] GitHub **Description**, **Website** (Vercel), and **Topics** filled in (see `README.md` → GitHub repository settings)
- [ ] Vercel env: `NEXT_PUBLIC_*`, `OPENAI_API_KEY`, `GITHUB_TOKEN`, optional `HSP_*` merchant keys
- [ ] `frontend` builds: `npm run build`
- [ ] Contracts: `cd contracts && npm run compile`
- [ ] Demo video link added above
- [ ] At least one successful testnet tx or HSP checkout path recorded (optional: paste tx hash below)

**Example testnet tx (optional):** _[0x…]_
