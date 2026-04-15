# HashKey On-Chain Horizon Hackathon — SplitSettl submission

**Track:** PayFi (with AI for contribution analysis)  
**Submission platform:** _[e.g. DoraHacks — add your project link]_  
**Chain:** HashKey Chain (testnet 133 / mainnet 177)  
**HSP:** On-chain lifecycle in `contracts/src/SplitSettl.sol` **+** optional HashKey Merchant API (`frontend/lib/hsp-client.ts`); official HSP user manual: [hashfans.io](https://hashfans.io/).

## Live demo (Vercel)

Add your production deployment URL (Vercel → Domains):

**Live app:** _[https://your-project.vercel.app]_

## Demo video

Add your recorded demo URL here before the deadline:

**Video:** _[paste YouTube / Loom / Google Drive link]_

Suggested flow (see also `README.md` → Demo Flow): Dashboard → AI Invoice (real GitHub repo) → on-chain settle (testnet MockUSDT) → explorer link.

## Deployed contracts (fill in after deploy + verification)

| Network   | SplitSettl | MockUSDT (testnet) | Verified |
|-----------|------------|--------------------|----------|
| Testnet   |            |                    | [ ]      |
| Mainnet   | optional   | n/a (use official USDT) | [ ] |

Explorer: [https://explorer.hsk.xyz](https://explorer.hsk.xyz)

## Checklist

- [ ] Repository public and builds (`frontend`: `npm run build`)
- [ ] Contracts compile & tests pass (`contracts`: `npm run compile`, `npm run test`)
- [ ] `.env.example` documents required variables
- [ ] Demo video link added above
- [ ] At least one successful testnet settlement recorded (tx hash in README or here)
