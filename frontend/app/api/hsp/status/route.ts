import { NextRequest, NextResponse } from "next/server";

/**
 * HSP (HashKey Settlement Protocol) Status API
 *
 * Tracks the lifecycle of HSP payment flows:
 * Request -> Confirmation -> Receipt
 *
 * In production, this would query on-chain HSP events.
 * For the demo, we simulate the HSP status progression.
 */

interface HSPRecord {
  requestId: string;
  projectId: number;
  amount: number;
  currency: string;
  status: "requested" | "confirmed" | "receipt";
  requestedAt: string;
  confirmedAt?: string;
  receiptAt?: string;
  txHash?: string;
}

// In-memory store for demo
const hspRecords = new Map<string, HSPRecord>();

export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("requestId");

  if (requestId) {
    const record = hspRecords.get(requestId);
    if (!record) {
      return NextResponse.json({ error: "HSP request not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  }

  // Return all records
  return NextResponse.json(Array.from(hspRecords.values()));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, requestId, projectId, amount, currency, txHash } = body;

    switch (action) {
      case "create": {
        const id = requestId || `HSP-REQ-${Date.now()}`;
        const record: HSPRecord = {
          requestId: id,
          projectId: projectId || 0,
          amount: amount || 0,
          currency: currency || "USDT",
          status: "requested",
          requestedAt: new Date().toISOString(),
        };
        hspRecords.set(id, record);
        return NextResponse.json(record, { status: 201 });
      }

      case "confirm": {
        const record = hspRecords.get(requestId);
        if (!record) {
          return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }
        record.status = "confirmed";
        record.confirmedAt = new Date().toISOString();
        record.txHash = txHash;
        return NextResponse.json(record);
      }

      case "receipt": {
        const record = hspRecords.get(requestId);
        if (!record) {
          return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }
        record.status = "receipt";
        record.receiptAt = new Date().toISOString();
        return NextResponse.json(record);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("HSP status error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
