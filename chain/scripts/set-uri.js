const hre = require("hardhat");
const ADDRESS = process.env.CONTRACT_ADDRESS;
const NEW_URI = process.env.NEW_TOKEN_URI;

async function main() {
  if (!ADDRESS || !NEW_URI) throw new Error("Set CONTRACT_ADDRESS and NEW_TOKEN_URI env vars.");
  const c = await hre.ethers.getContractAt("OwnlyNFT", ADDRESS);
  const tx = await c.setTokenURI(NEW_URI);
  console.log("setTokenURI tx:", tx.hash);
  await tx.wait();
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
