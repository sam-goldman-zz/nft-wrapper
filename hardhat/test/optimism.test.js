const { expect } = require("chai");

const destAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const nftAddr = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const sourceAddr = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

describe("DestWrapperManager", () => {
  let destWrapperManager, nft, tokenData, serialNumber;
  let tokenId = 1;

  before('attach contracts + mint an nft', async () => {
    [account1, account2, account3] = await ethers.getSigners();

    const DestWrapperManager = await ethers.getContractFactory('DestWrapperManager');
    destWrapperManager = await DestWrapperManager.attach(destAddr);

    const NFT = await ethers.getContractFactory('ExampleNFT');
    nft = await NFT.attach(nftAddr);

    await nft.mint(account1.address);
  })

  before('get serial number', async () => {
    let serialArgs = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256"],
      [nft.address, account1.address, tokenId]
    );
    serialNumber = ethers.utils.keccak256(serialArgs);
  })

  describe('initialize', () => {
    it('happy case', async () => {
      await destWrapperManager.initialize(sourceAddr);

      expect(await destWrapperManager.sourceWrapperAddr()).to.equal(sourceAddr);
    })
  })

  describe('makeWrapper', () => {
    it('happy case', async () => {
      await expect(destWrapperManager.makeWrapper(nft.address, tokenId))
        .to.emit(destWrapperManager, 'NewWrapper')
        .withArgs(serialNumber);

      tokenData = await destWrapperManager.serials(serialNumber);
      expect(tokenData.tokenContractAddr).to.equal(nft.address);
      expect(tokenData.owner).to.equal(account1.address);
      expect(tokenData.tokenId).to.equal(tokenId);
    })
  })

  describe('transfer', () => {
    it('happy case', async () => {
      await destWrapperManager.transfer(account2.address, serialNumber);

      const newTokenData = await destWrapperManager.serials(serialNumber);
      expect(newTokenData.owner).to.equal(account2.address);
    })
  })

  describe('withdraw', () => {
    it('happy case', async () => {
      let iface = new ethers.utils.Interface([
        "function claim(bytes32 serialNumber, address newOwner, address tokenContractAddr, uint256 tokenId)"
      ])

      let message = iface.encodeFunctionData("claim", [
        serialNumber,
        account3.address,
        nft.address,
        tokenId
      ])

      console.log(message);

      await expect(destWrapperManager
        .connect(account2)
        .withdraw(serialNumber, account3.address)
        ).to.emit(destWrapperManager, 'Withdraw')
          .withArgs(message);

      expect(await destWrapperManager.serials(serialNumber)).to.equal(destWrapperManager.address);
    })
  })

  // it("Should return the new greeting once it's changed", async function () {
  //   const Greeter = await ethers.getContractFactory("Greeter");
  //   const greeter = await Greeter.deploy("Hello, world!");
  //   await greeter.deployed();

  //   expect(await greeter.greet()).to.equal("Hello, world!");

  //   const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

  //   // wait until the transaction is mined
  //   await setGreetingTx.wait();

  //   expect(await greeter.greet()).to.equal("Hola, mundo!");
  // });
});