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

describe('SourceWrapperManager', () => {
  let sourceWrapperManager, nft;

  let destRollup = 123;
  let tokenId = 1;

  before(async () => {
    [owner, nonOwner] = await ethers.getSigners();
  });

  before('deploy contracts and mint one nft', async () => {
    const NFT = await ethers.getContractFactory('ExampleNFT');
    nft = await NFT.deploy();
    await nft.deployed();

    const SourceWrapperManager = await ethers.getContractFactory('SourceWrapperManager');
    sourceWrapperManager = await SourceWrapperManager.deploy();
    await sourceWrapperManager.deployed();

    await nft.mint(owner.address);
  });

  // beforeEach(async () => {
  //   snapshotId = await snapshot();
  // })

  // afterEach(async () => {
  //   await restore(snapshotId);
  // })

  describe('send', () => {
    it('happy case', async () => {
      await nft.approve(sourceWrapperManager.address, tokenId);

      await sourceWrapperManager.send(
        owner.address,
        destRollup,
        nft.address,
        tokenId
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
            owner.address,
            123,
            nft.address,
            1
          )
      ).to.be.revertedWith(revertMessages.SourceSendCalledByNonOwner)
    })
  })
});