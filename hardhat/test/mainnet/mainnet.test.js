const { expect } = require('chai');
const { BigNumber } = require('ethers');

const revertMessages = {
  SourceSendCalledByNonOwner: "SourceWrapperManager: send function must be called by owner of nft"
};

// let snapshotId;

// async function snapshot () {
//   return ethereum.send('evm_snapshot', [])
// }

// async function restore(snapshotId) {
//   return ethereum.send('evm_revert', [snapshotId])
// }

describe('Test', () => {
  let sourceWrapperManager, destWrapperManager, nft;

  let destRollup = 123;
  let sourceRollup = 321;
  let tokenId = 1;

  before(async () => {
    [owner, nonOwner] = await ethers.getSigners();
  });

  before('deploy contracts and mint one nft', async () => {
    const NFT = await ethers.getContractFactory('ExampleNFT');
    nft = await NFT.deploy();
    await nft.deployed();
    await nft.mint(owner.address);

    const SourceWrapperManager = await ethers.getContractFactory('SourceWrapperManager');
    sourceWrapperManager = await SourceWrapperManager.deploy();
    await sourceWrapperManager.deployed();
  
    const DestWrapperManager = await ethers.getContractFactory('DestWrapperManager');
    destWrapperManager = await DestWrapperManager.deploy();
    await destWrapperManager.deployed();
  });

  // beforeEach(async () => {
  //   snapshotId = await snapshot();
  // })

  // afterEach(async () => {
  //   await restore(snapshotId);
  // })

  describe('Source - send', () => {
    it('happy case', async () => {
      await nft.approve(sourceWrapperManager.address, tokenId);

      await sourceWrapperManager.send(
        nft.address,
        tokenId,
        owner.address,
        destRollup
      );

      // transfers tokenId to sourceWrapperManager
      expect(
        await nft.ownerOf(1)
      ).to.equal(sourceWrapperManager.address);
    })

    it('revert - called by non-owner of nft', async () => {
      await expect(
        sourceWrapperManager
          .connect(nonOwner.address)
          .send(
            nft.address,
            tokenId,
            owner.address,
            destRollup
          )
      ).to.be.revertedWith(revertMessages.SourceSendCalledByNonOwner)
    })
  })

  describe('Dest - makeWrapper', () => {
    it('happy case', async () => {
      await destWrapperManager.makeWrapper(
        nft.address,
        tokenId,
        sourceRollup
      );

      const serialNumber = await expect(token.transfer(walletTo.address, 7))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, walletTo.address, 7);

      expect(
        await destWrapperManager.ownerOf(serialNumber)
      )
    })
  })
});

describe.only('deployed source', () => {
  let source;

  before(async () => {
    [owner] = await ethers.getSigners();

    const Source = await ethers.getContractFactory('Source');
    source = await Source.deploy();
    await source.deployed();
  });

  it('worked', async () => {
    expect(await source.x()).to.equal(2);
  })
})