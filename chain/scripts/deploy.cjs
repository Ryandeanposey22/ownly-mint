const hre = require('hardhat');

async function main() {
  const OwnlyNFT = await hre.ethers.getContractFactory('OwnlyNFT');
  const contract = await OwnlyNFT.deploy();
  await contract.waitForDeployment();
  console.log('OwnlyNFT deployed to:', await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
