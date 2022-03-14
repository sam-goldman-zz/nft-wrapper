const { expect } = require("chai");
const { getContractDefinition } = require('@eth-optimism/contracts');

const destAddr = '0xda942df265D37ffb0d040A41f47a83B67C35A213';
const sourceAddr = '0x1e782D924bB6B918Ef2DE20899CAd871595AB8c6'
const nftAddr = '0xbD03ECB7f7e949270F79CD7095D4e3497a31212D'

const l2CrossDomainMessengerAddr = "0x4200000000000000000000000000000000000007";

describe("DestWrapperManager", () => {
  let destWrapperManager, tokenData, serialNumber, l2CrossDomainMessenger;
  let tokenId = 1;

  before('connect contracts', async () => {
    [account1, account2, account3] = await ethers.getSigners();

    const DestWrapperManager = await ethers.getContractFactory('DestWrapperManager');
    destWrapperManager = await DestWrapperManager.attach(destAddr);

    const artifact = getContractDefinition('L2CrossDomainMessenger');
    l2CrossDomainMessenger = new ethers.Contract(
      l2CrossDomainMessengerAddr,
      artifact.abi,
      account1
    );
  })

  before('get serial number', async () => {
    let serialArgs = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256"],
      [nftAddr, account1.address, tokenId]
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
      await expect(destWrapperManager.makeWrapper(nftAddr, tokenId))
        .to.emit(destWrapperManager, 'NewWrapper')
        .withArgs(serialNumber);

      tokenData = await destWrapperManager.serials(serialNumber);
      expect(tokenData.tokenContractAddr).to.equal(nftAddr);
      expect(tokenData.owner).to.equal(account1.address);
      expect(tokenData.tokenId).to.equal(tokenId);
    })
  })

  describe('transfer', () => {
    it('happy case', async () => {
      const transferTx = await destWrapperManager.transfer(account2.address, serialNumber);

      await transferTx.wait();

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
        nftAddr,
        tokenId
      ])

      const withdrawTx = await destWrapperManager
        .connect(account2)
        .withdraw(serialNumber, account3.address, { gasLimit: 1000000 })

      const messageNonce = await l2CrossDomainMessenger.messageNonce();
      expect(withdrawTx)
        .to.emit(l2CrossDomainMessenger, 'SentMessage')
        .withArgs(
          sourceAddr,
          account2.address,
          message,
          messageNonce,
          1000000
        );

      await withdrawTx.wait();

      tokenData = await destWrapperManager.serials(serialNumber);
      expect(tokenData.owner).to.equal(destWrapperManager.address);
    })
  })
});