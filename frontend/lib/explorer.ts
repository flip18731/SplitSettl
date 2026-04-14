import { getActiveChainConfig } from "./contract";

export function explorerTxUrl(txHash: string): string {
  const base = getActiveChainConfig().explorer.replace(/\/$/, "");
  return `${base}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  const base = getActiveChainConfig().explorer.replace(/\/$/, "");
  return `${base}/address/${address}`;
}
