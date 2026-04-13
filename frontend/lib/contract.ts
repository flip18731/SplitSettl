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

export const CONTRACT_ABI = [
  "function createProject(string name, address[] contributors, uint256[] splitPercentages) external returns (uint256)",
  "function updateSplits(uint256 projectId, uint256[] newSplits) external",
  "function addContributor(uint256 projectId, address contributor, uint256 splitBps) external",
  "function submitPayment(uint256 projectId, string invoiceRef) external payable",
  "function submitPaymentERC20(uint256 projectId, address token, uint256 amount, string invoiceRef) external",
  "function emitPaymentRequest(uint256 projectId, uint256 amount, string hspRequestId) external",
  "function emitPaymentConfirmation(uint256 projectId, string hspRequestId) external",
  "function emitPaymentReceipt(uint256 projectId, string hspRequestId, bytes32 txHash) external",
  "function getProject(uint256 projectId) external view returns (string name, address owner, uint256 contributorCount, uint256 totalPaid, uint256 createdAt, bool active)",
  "function getProjectContributors(uint256 projectId) external view returns (address[] addrs, uint256[] splits, uint256[] earnings)",
  "function getContributorEarnings(address contributor) external view returns (uint256)",
  "function getProjectPaymentHistory(uint256 projectId) external view returns (tuple(uint256 amount, string invoiceRef, address token, uint256 timestamp, string hspRequestId)[])",
  "function getProjectPaymentCount(uint256 projectId) external view returns (uint256)",
  "function getHSPStatus(string hspRequestId) external view returns (uint256 projectId, uint256 amount, uint8 status, bytes32 txHash, uint256 requestedAt, uint256 confirmedAt, uint256 receiptAt)",
  "function projectCount() external view returns (uint256)",
  "event ProjectCreated(uint256 indexed projectId, string name, address owner)",
  "event PaymentSplit(uint256 indexed projectId, uint256 totalAmount, string invoiceRef)",
  "event ContributorPaid(uint256 indexed projectId, address indexed contributor, uint256 amount)",
  "event HSPRequestCreated(uint256 indexed projectId, string hspRequestId, uint256 amount)",
  "event HSPConfirmed(uint256 indexed projectId, string hspRequestId)",
  "event HSPReceiptGenerated(uint256 indexed projectId, string hspRequestId, bytes32 txHash)",
];
