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
    it.only('revert - called by non-owner of nft', async () => {
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

  describe('constructor', () => {
    it('verify deployment parameters', async () => {
      expect (await this.token.totalSupply()).to.be.bignumber.equal(_0);

      expect(await this.token.temporaryMaxPublic()).to.be.bignumber.equal(temporaryMaxPublic);

      for (let adminAddress of adminAddresses) {
        expect(await this.token.hasRole(DEFAULT_ADMIN_ROLE, adminAddress)).to.equal(true);
      };

      expect(await this.token.name()).to.equal(tokenName);

      expect(await this.token.symbol()).to.equal(tokenSymbol);
    });

    it('require fail - temporary public value exceeds max public value', async () => {
      await expectRevert(
        Token.new(
          maxPublic + 1,
          adminAddresses
        ),
        revertMessages.ConstructorTmpPublicExceedsMaxPublic
      );

      // still works with 1 less
      this.tokenTemp = await Token.new(
        maxPublic,
        adminAddresses
      );

      expect(await this.tokenTemp.temporaryMaxPublic()).to.be.bignumber.equal(maxPublic);
    });

    it('require fail - admin addresses length is zero', async () => {
      await expectRevert(
        Token.new(
          temporaryMaxPublic,
          []
        ),
        revertMessages.ConstructorAdminAddressesLengthIsZero
      );

      // still works with one adminAddress
      this.tokenTemp = await Token.new(
        temporaryMaxPublic,
        [adminAddresses[0]]
      );
      expect(await this.tokenTemp.temporaryMaxPublic()).to.be.bignumber.equal(temporaryMaxPublic);
    })

    it('require fail - admin cannot be zero address', async () => {
      await expectRevert(
        Token.new(
          temporaryMaxPublic,
          [constants.ZERO_ADDRESS]
        ),
        revertMessages.ConstructorAdminCannotBeZeroAddress
      );
    })
  })

  // describe('mintReserved', () => {
  //   const numReservedTokens = new BN('2');

  //   beforeEach(async () => {
  //     await this.token.mintReserved(numReservedTokens, { from: admin1 });
  //   });

  //   it('happy case', async () => {
  //     expect(await this.token.totalSupply()).to.be.bignumber.equal(numReservedTokens);

  //     expect(await this.token.balanceOf(admin1)).to.be.bignumber.equal(numReservedTokens);
      
  //     expect(await this.token.ownerOf(maxPublic.add(_1))).to.equal(admin1);
  //     expect(await this.token.ownerOf(maxPublic.add(_2))).to.equal(admin1);
  //   });

  //   it('require fail - number of reserved tokens cannot be zero', async () => {
  //     await expectRevert(
  //       this.token.mintReserved(0, { from: admin1 }),
  //       revertMessages.NumReservedTokensCannotBeZero
  //     );

  //     // still works for 1 token
  //     await this.token.mintReserved(1, { from: admin1 });
  //     expect(await this.token.balanceOf(admin1)).to.be.bignumber.equal(new BN('3'));
  //   })

  //   it('require fail - number of tokens exceeds max reserved', async () => {
  //     const numReservedTokensRemaining = maxReserved.sub(numReservedTokens);

  //     await expectRevert(
  //       this.token.mintReserved(numReservedTokensRemaining.add(_1)),
  //       revertMessages.NumReservedTokensExceedsMax
  //     );

  //     // still works with 1 less
  //     await this.token.mintReserved(numReservedTokensRemaining, { from: admin1 });
  //     expect(await this.token.balanceOf(admin1)).to.be.bignumber.equal(maxReserved);
  //   })

  //   it('check modifier - non-admin cannot mint reserved tokens', async () => {
  //     const revertMessageAccessControl = getRevertMessageAccessControl(nonAdmin1);

  //     await expectRevert(
  //       this.token.mintReserved(1, { from: nonAdmin1 }),
  //       revertMessageAccessControl
  //     );
  //   })
  // })

  // describe('mintPublic', () => {
  //   it('happy case', async () => {
  //     await this.token.mintPublic({ from: nonAdmin1 });
  //     await this.token.mintPublic({ from: nonAdmin2 });

  //     expect(await this.token.totalSupply()).to.be.bignumber.equal(_2);

  //     expect(await this.token.balanceOf(nonAdmin1)).to.be.bignumber.equal(_1);
  //     expect(await this.token.balanceOf(nonAdmin2)).to.be.bignumber.equal(_1);

  //     expect(await this.token.ownerOf(_1)).to.equal(nonAdmin1);
  //     expect(await this.token.ownerOf(_2)).to.equal(nonAdmin2);
  //   })

  //   it('require fail - address has reached public minting limit', async () => {
  //     for (let i = 0; i < maxPerPublicAddress; i++) {
  //       await this.token.mintPublic({ from: nonAdmin1 });
  //     }

  //     await expectRevert(
  //       this.token.mintPublic({ from: nonAdmin1 }),
  //       revertMessages.AddressReachedPublicMintingLimit
  //     );
  //   })

  //   it('require fail - maximum number of public tokens minted', async () => {
  //     await this.token.setTemporaryMaxPublic(maxPublic, { from: admin1 });

  //     await mintPublicTokens(maxPublic);

  //     await expectRevert(
  //       this.token.mintPublic({ from: nonAdmin1 }),
  //       revertMessages.MaxNumberPublicTokensMinted
  //     );
  //   });

  //   it('require fail - number of public tokens minted exceeds temporary max public value', async () => {
  //     await mintPublicTokens(temporaryMaxPublic);

  //     await expectRevert(
  //       this.token.mintPublic({ from: nonAdmin1 }),
  //       revertMessages.PublicTokensExceedsTmpMax
  //     );
  //   })
  // })

  // describe('setTemporaryMaxPublic', () => {
  //   it('happy case', async () => {
  //     const newTemporaryMaxPublic = new BN('35');

  //     await this.token.setTemporaryMaxPublic(newTemporaryMaxPublic, { from: admin1 });
  //     expect(await this.token.temporaryMaxPublic()).to.be.bignumber.equal(newTemporaryMaxPublic);
  //   })

  //   it('require fail - new temporary public value cannot exceed max public value', async () => {
  //     await expectRevert(
  //       this.token.setTemporaryMaxPublic(maxPublic.add(_1), { from: admin1 }),
  //       revertMessages.NewTmpMaxExceedsMaxPublic
  //     );

  //     // still works when temporaryMaxPublic = maxPublic
  //     await this.token.setTemporaryMaxPublic(maxPublic, { from: admin1 });
  //     expect(await this.token.temporaryMaxPublic()).to.be.bignumber.equal(maxPublic)
  //   })

  //   it('check modifier - non-admin cannot set new temporaryMaxPublic', async () => {
  //     const revertMessageAccessControl = getRevertMessageAccessControl(nonAdmin1);

  //     getRevertMessageAccessControl(address);

  //     await expectRevert(
  //       this.token.setTemporaryMaxPublic(maxPublic, { from: nonAdmin1 }),
  //       revertMessageAccessControl
  //     );
  //   })
  // })

  // describe('mint all tokens', () => {
  //   it('happy case - mint all tokens', async () => {
  //     await this.token.setTemporaryMaxPublic(maxPublic, { from: admin1 });

  //     await mintPublicTokens(maxPublic);

  //     await this.token.mintReserved(maxReserved, { from: admin1 });
  
  //     expect(await this.token.totalSupply()).to.be.bignumber.equal(maxPublic.add(maxReserved));
  //   })
  // })
});