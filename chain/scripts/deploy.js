// scripts/deploy.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("Deploying OwnlyNFT...");

  // hre.ethers is guaranteed to be loaded inside Hardhat context
  const Factory = await hre.ethers.getContractFactory("OwnlyNFT");

  // deploy without constructor args
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ OwnlyNFT deployed successfully!");
  console.log("📜 Contract Address:", address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });

