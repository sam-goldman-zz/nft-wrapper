async function main () {
  const NFT = await ethers.getContractFactory('ExampleNFT');
  const nft = await NFT.deploy();
  await nft.deployed();
  const address = nft.address;
  console.log('NFT contract deployed to:', address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });