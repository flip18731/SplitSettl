import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Seeding with account:", deployer.address);

  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  const SplitSettl = await ethers.getContractFactory("SplitSettl");
  const contract = SplitSettl.attach(CONTRACT_ADDRESS);

  // Demo addresses (use deployer for all in testnet)
  const alice = "0x1111111111111111111111111111111111111111";
  const bob = "0x2222222222222222222222222222222222222222";
  const carol = "0x3333333333333333333333333333333333333333";
  const dave = "0x4444444444444444444444444444444444444444";
  const eve = "0x5555555555555555555555555555555555555555";
  const frank = "0x6666666666666666666666666666666666666666";
  const grace = "0x7777777777777777777777777777777777777777";
  const henry = "0x8888888888888888888888888888888888888888";

  console.log("\nCreating Project 1: HashKey DeFi SDK");
  const tx1 = await contract.createProject(
    "HashKey DeFi SDK",
    [alice, bob, carol],
    [4000, 3500, 2500]
  );
  await tx1.wait();
  console.log("Project 1 created");

  console.log("\nCreating Project 2: NFT Marketplace Frontend");
  const tx2 = await contract.createProject(
    "NFT Marketplace Frontend",
    [dave, eve],
    [5500, 4500]
  );
  await tx2.wait();
  console.log("Project 2 created");

  console.log("\nCreating Project 3: Smart Contract Audit Tool");
  const tx3 = await contract.createProject(
    "Smart Contract Audit Tool",
    [alice, frank, grace, henry],
    [3000, 2500, 2500, 2000]
  );
  await tx3.wait();
  console.log("Project 3 created");

  // Submit sample payments with HSP tracking
  const payments = [
    { projectId: 0, amount: "0.5", ref: "INV-2024-001", hspId: "HSP-REQ-001" },
    { projectId: 0, amount: "0.75", ref: "INV-2024-002", hspId: "HSP-REQ-002" },
    { projectId: 0, amount: "1.0", ref: "INV-2024-003", hspId: "HSP-REQ-003" },
    { projectId: 1, amount: "0.8", ref: "INV-2024-004", hspId: "HSP-REQ-004" },
    { projectId: 1, amount: "0.6", ref: "INV-2024-005", hspId: "HSP-REQ-005" },
    { projectId: 2, amount: "2.0", ref: "INV-2024-006", hspId: "HSP-REQ-006" },
    { projectId: 2, amount: "1.5", ref: "INV-2024-007", hspId: "HSP-REQ-007" },
  ];

  for (const p of payments) {
    console.log(`\nProcessing payment ${p.ref} for project ${p.projectId}...`);

    // HSP Request
    const reqTx = await contract.emitPaymentRequest(
      p.projectId,
      ethers.parseEther(p.amount),
      p.hspId
    );
    await reqTx.wait();
    console.log(`  HSP Request created: ${p.hspId}`);

    // Submit payment
    const payTx = await contract.submitPayment(p.projectId, p.ref, {
      value: ethers.parseEther(p.amount),
    });
    await payTx.wait();
    console.log(`  Payment split: ${p.amount} HSK`);

    // HSP Confirm
    const confTx = await contract.emitPaymentConfirmation(p.projectId, p.hspId);
    await confTx.wait();
    console.log(`  HSP Confirmed`);

    // HSP Receipt
    const receiptTx = await contract.emitPaymentReceipt(
      p.projectId,
      p.hspId,
      ethers.keccak256(ethers.toUtf8Bytes(p.ref))
    );
    await receiptTx.wait();
    console.log(`  HSP Receipt generated`);
  }

  console.log("\nSeeding complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
