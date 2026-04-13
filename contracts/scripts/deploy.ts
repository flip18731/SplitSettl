import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying SplitSettl to network...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "HSK");

  const SplitSettl = await ethers.getContractFactory("SplitSettl");
  const contract = await SplitSettl.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SplitSettl deployed to:", address);

  // Save deployment info for frontend
  const deploymentInfo = {
    address,
    network: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "../../frontend/lib");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to frontend/lib/deployment.json");

  // Save ABI
  const artifact = await ethers.getContractFactory("SplitSettl");
  const abi = artifact.interface.formatJson();
  fs.writeFileSync(
    path.join(outputDir, "abi.json"),
    abi
  );

  console.log("ABI saved to frontend/lib/abi.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
