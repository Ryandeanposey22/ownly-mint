const hre = require("hardhat");
const ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  if (!ADDRESS) throw new Error("Set CONTRACT_ADDRESS env var.");
  const c = await hre.ethers.getContractAt("OwnlyNFT", ADDRESS);
  const uri = await c.tokenURI(0);
  console.log("tokenURI(0):", uri);
}

main().catch((e) => { console.error(e); process.exit(1); });
