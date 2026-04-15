export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export const HASHKEY_TESTNET = {
  chainId: 133,
  chainIdHex: "0x85",
  name: "HashKey Chain Testnet",
  rpcUrl: "https://testnet.hsk.xyz",
  explorer: "https://explorer.hsk.xyz",
  nativeCurrency: {
    name: "HSK",
    symbol: "HSK",
    decimals: 18,
  },
};

export const HASHKEY_MAINNET = {
  chainId: 177,
  chainIdHex: "0xb1",
  name: "HashKey Chain",
  rpcUrl: "https://mainnet.hsk.xyz",
  explorer: "https://explorer.hsk.xyz",
  nativeCurrency: {
    name: "HSK",
    symbol: "HSK",
    decimals: 18,
  },
};

// Official HashKey Chain mainnet stablecoin addresses
export const USDT_MAINNET = "0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029";
export const USDC_MAINNET = "0x054ed45810DbBAb8B27668922D110669c9D88D0a";

// Testnet MockUSDT (deployed via scripts/deploy.ts)
export const MOCK_USDT_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS || "";

/** Official HashKey testnet tokens (HSP Merchant / x402 — use when not using a local MockUSDT). */
export const HSP_USDT_HASHKEY_TESTNET =
  "0x372325443233fEbaC1F6998aC750276468c83CC6";
export const HSP_USDC_HASHKEY_TESTNET =
  "0x79AEc4EeA31D50792F61D1Ca0733C18c89524C9e";

/** Returns the chain config for the currently active network. */
export function getActiveChainConfig() {
  return process.env.NEXT_PUBLIC_CHAIN_ID === "177"
    ? HASHKEY_MAINNET
    : HASHKEY_TESTNET;
}

/** Returns the USDT address for the currently active network. */
export function getUSDTAddress(): string {
  if (process.env.NEXT_PUBLIC_CHAIN_ID === "177") {
    return USDT_MAINNET;
  }
  // Testnet: explicit MockUSDT deploy, optional overrides, else HSP gateway USDT (official docs)
  const mock = process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS?.trim();
  const hspOverride = process.env.NEXT_PUBLIC_HSP_USDT_ADDRESS?.trim();
  return mock || hspOverride || HSP_USDT_HASHKEY_TESTNET;
}

export const CONTRACT_ABI = [
  "function createProject(string name, address[] contributors, uint256[] splitPercentages) external returns (uint256)",
  "function updateSplits(uint256 projectId, uint256[] newSplits) external",
  "function addContributor(uint256 projectId, address contributor, uint256 splitBps) external",
  "function submitPayment(uint256 projectId, string invoiceRef) external payable",
  "function submitPaymentERC20(uint256 projectId, address token, uint256 amount, string invoiceRef, string hspRequestId) external",
  "function emitPaymentRequest(uint256 projectId, uint256 amount, string hspRequestId) external",
  "function emitPaymentConfirmation(uint256 projectId, string hspRequestId) external",
  "function emitPaymentReceipt(uint256 projectId, string hspRequestId, bytes32 txHash) external",
  "function getProject(uint256 projectId) external view returns (string name, address owner, uint256 contributorCount, uint256 totalPaid, uint256 createdAt, bool active)",
  "function getProjectContributors(uint256 projectId) external view returns (address[] addrs, uint256[] splits, uint256[] earnings)",
  "function getContributorEarnings(address contributor) external view returns (uint256)",
  "function getProjectPaymentHistory(uint256 projectId) external view returns (tuple(uint256 amount, string invoiceRef, address token, uint256 timestamp, string hspRequestId)[])",
  "function getProjectPaymentCount(uint256 projectId) external view returns (uint256)",
  "function getHSPStatus(string hspRequestId) external view returns (uint256 projectId, uint256 amount, uint8 status, bytes32 txHash, uint256 requestedAt, uint256 confirmedAt, uint256 receiptAt)",
  "function getProjectHSPMessageIds(uint256 projectId) external view returns (string[])",
  "function projectCount() external view returns (uint256)",
  "function USDT_MAINNET() external view returns (address)",
  "function USDC_MAINNET() external view returns (address)",
  "event ProjectCreated(uint256 indexed projectId, string name, address owner)",
  "event PaymentSplit(uint256 indexed projectId, uint256 totalAmount, string invoiceRef)",
  "event ContributorPaid(uint256 indexed projectId, address indexed contributor, uint256 amount)",
  "event HSPRequestCreated(uint256 indexed projectId, string hspRequestId, uint256 amount)",
  "event HSPConfirmed(uint256 indexed projectId, string hspRequestId)",
  "event HSPReceiptGenerated(uint256 indexed projectId, string hspRequestId, bytes32 txHash)",
];
