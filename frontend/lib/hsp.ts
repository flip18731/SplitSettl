/**
 * HSP (HashKey Settlement Protocol) — types & lightweight helpers
 *
 * **Official product context:** HashKey documents the HSP user flow in the
 * resources hub (see [hashfans.io](https://hashfans.io/) → HSP user manual in
 * the top navigation). Use that manual for PayFi-track judging: it describes
 * how payment *messages* (request / confirmation / receipt) relate to
 * settlement workflows.
 *
 * **This codebase:** The **canonical** HSP-aligned lifecycle for SplitSettl is
 * implemented **on-chain** in `SplitSettl.sol` (`HSPRequestCreated` → transfer +
 * `HSPConfirmed` → `HSPReceiptGenerated`) and surfaced in the UI via invoice
 * settlement (`submitPaymentERC20`) and the dashboard when
 * `NEXT_PUBLIC_CONTRACT_ADDRESS` is set.
 *
 * The async helpers below are **UX placeholders** (simulated delays) for
 * prototyping flows that do not yet call an external HSP HTTP API. They are
 * not a substitute for the on-chain events above.
 *
 * Flow: Request → Confirmation → Receipt
 */

export type HSPStatusType = "requested" | "confirmed" | "receipt";

export interface HSPPaymentRequest {
  requestId: string;
  projectId: number;
  amount: number;
  currency: string;
  payerAddress: string;
  payeeAddresses: string[];
  splitPercentages: number[];
  invoiceRef: string;
  createdAt: Date;
  status: HSPStatusType;
}

export interface HSPConfirmation {
  requestId: string;
  txHash: string;
  confirmedAt: Date;
  splitDetails: { address: string; amount: number }[];
}

export interface HSPReceipt {
  requestId: string;
  receiptId: string;
  txHash: string;
  generatedAt: Date;
  totalAmount: number;
  currency: string;
  projectName: string;
}

let hspRequestCounter = 100;

export function generateHSPRequestId(): string {
  hspRequestCounter++;
  return `HSP-REQ-${hspRequestCounter}`;
}

export async function createHSPPaymentRequest(
  projectId: number,
  amount: number,
  currency: string,
  payerAddress: string,
  payeeAddresses: string[],
  splitPercentages: number[],
  invoiceRef: string
): Promise<HSPPaymentRequest> {
  // Simulate HSP network call
  await new Promise((r) => setTimeout(r, 800));

  return {
    requestId: generateHSPRequestId(),
    projectId,
    amount,
    currency,
    payerAddress,
    payeeAddresses,
    splitPercentages,
    invoiceRef,
    createdAt: new Date(),
    status: "requested",
  };
}

export async function confirmHSPPayment(
  requestId: string,
  txHash: string,
  splitDetails: { address: string; amount: number }[]
): Promise<HSPConfirmation> {
  await new Promise((r) => setTimeout(r, 600));

  return {
    requestId,
    txHash,
    confirmedAt: new Date(),
    splitDetails,
  };
}

export async function generateHSPReceipt(
  requestId: string,
  txHash: string,
  totalAmount: number,
  currency: string,
  projectName: string
): Promise<HSPReceipt> {
  await new Promise((r) => setTimeout(r, 500));

  return {
    requestId,
    receiptId: `HSP-REC-${Date.now()}`,
    txHash,
    generatedAt: new Date(),
    totalAmount,
    currency,
    projectName,
  };
}

export function getHSPStatusLabel(status: HSPStatusType): string {
  switch (status) {
    case "requested": return "Payment Requested";
    case "confirmed": return "Payment Confirmed";
    case "receipt": return "Receipt Generated";
  }
}

export function getHSPStatusColor(status: HSPStatusType): string {
  switch (status) {
    case "requested": return "#FDCB6E";
    case "confirmed": return "#74B9FF";
    case "receipt": return "#00B894";
  }
}
