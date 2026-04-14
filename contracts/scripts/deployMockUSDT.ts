import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MockUSDT with:", deployer.address);

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const token = await MockUSDT.deploy();
  await token.waitForDeployment();

  const addr = await token.getAddress();
  console.log("MockUSDT deployed to:", addr);
  console.log("\nAdd to frontend .env.local:");
  console.log(`NEXT_PUBLIC_MOCK_USDT_ADDRESS=${addr}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
