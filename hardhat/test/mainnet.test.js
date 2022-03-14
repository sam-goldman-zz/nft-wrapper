const { expect } = require('chai');

const sourceAddr = '0x1e782D924bB6B918Ef2DE20899CAd871595AB8c6';
const nftAddr = '0xbD03ECB7f7e949270F79CD7095D4e3497a31212D';

describe('SourceWrapperManager', () => {
  let sourceWrapperManager, nft, serialNumber;

  let tokenId = 1;

  before('attach contracts and mint an nft', async () => {
    [account1, _, account3] = await ethers.getSigners();
    const SourceWrapperManager = await ethers.getContractFactory('SourceWrapperManager');
    sourceWrapperManager = await SourceWrapperManager.attach(sourceAddr);
   
    const NFT = await ethers.getContractFactory('ExampleNFT');
    nft = await NFT.attach(nftAddr);

    await nft.mint(account1.address);
  });

  before('get serial number', async () => {
    let serialArgs = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256"],
      [nft.address, account1.address, tokenId]
    );
    serialNumber = ethers.utils.keccak256(serialArgs);
  })

  describe('send', () => {
    it('happy case', async () => {
      const approveTx = await nft.approve(sourceAddr, tokenId);
      await approveTx.wait();

      const sendTx = await sourceWrapperManager.send(nft.address, tokenId)

      expect(sendTx)
        .to.emit(sourceWrapperManager, 'NewSerialNumber')
        .withArgs(serialNumber);

      expect(await nft.ownerOf(tokenId)).to.equal(sourceAddr);

      expect(await sourceWrapperManager.owners(serialNumber)).to.equal(account1.address);
    })
  })
  // describe('claim', () => {
  //   it('happy case', async () => {
  //     await expect(sourceWrapperManager.claim(
  //       serialNumber,
  //       account3.address,
  //       nftAddr,
  //       tokenId
  //     )).to.emit(nft, 'Transfer')
  //       .withArgs(sourceAddr, account3.address, tokenId);

  //     expect(await sourceWrapperManager.owners(serialNumber)).to.equal(ethers.constants.AddressZero);
  //   })
  // })
})