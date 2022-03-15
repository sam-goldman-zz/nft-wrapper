require("dotenv").config();
const { expect } = require('chai');
const { ethers } = require("hardhat");
const { getContractDefinition } = require('@eth-optimism/contracts');

const l2CrossDomainMessengerAddr = "0x4200000000000000000000000000000000000007";

describe('contracts', () => {
  let l1Bridge,
    l2Bridge,
    nft,
    serialNumber,
    ethProvider;

  let tokenId = 1;

  let l1Account1, l1Account3;
  let l1Address1, l1Address3;
  let l2Account1, l2Account2, l2Account3;


  before('deploy contracts', async () => {
    [l2Account1, l2Account2, l2Account3] = await ethers.getSigners();

    const L2Bridge = await ethers.getContractFactory('L2Bridge');
    l2Bridge = await L2Bridge.deploy();
    await l2Bridge.deployed();

    ethProvider = new ethers.providers.JsonRpcProvider(process.env.ETH_LOCAL_URL);

    [l1Account1, l1Account3] = [
      ethProvider.getSigner(0),
      ethProvider.getSigner(2)
    ];

    [l1Address1, l1Address3] = [
      await l1Account1.getAddress(),
      await l1Account3.getAddress()
    ]

    let L1Bridge = await ethers.getContractFactory('L1Bridge');
    L1Bridge = L1Bridge.connect(l1Account1);
    l1Bridge = await L1Bridge.deploy(l2Bridge.address);
    await l1Bridge.deployed();
  
    let NFT = await ethers.getContractFactory('ExampleNFT');
    NFT = NFT.connect(l1Account1);
    nft = await NFT.deploy();
    await nft.deployed();

    const artifact = getContractDefinition('L2CrossDomainMessenger');
    l2CrossDomainMessenger = new ethers.Contract(
      l2CrossDomainMessengerAddr,
      artifact.abi,
      l2Account1
    );
  });

  before('mint an nft', async () => {
    await nft.mint(l1Address1);
  })

  before('get serial number', async () => {
    let serialArgs = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256"],
      [nft.address, l1Address1, tokenId]
    );
    serialNumber = ethers.utils.keccak256(serialArgs);
  })

  describe('l1 send', () => {
    it('happy case', async () => {
      const approveTx = await nft.approve(l1Bridge.address, tokenId);
      await approveTx.wait();

      const sendTx = await l1Bridge.send(nft.address, tokenId)

      await expect(sendTx)
        .to.emit(l1Bridge, 'NewSerialNumber')
        .withArgs(serialNumber);

      expect(await nft.ownerOf(tokenId)).to.equal(l1Bridge.address);

      expect(await l1Bridge.owners(serialNumber)).to.equal(l1Address1);
    })
  })

  describe('l2 initialize', () => {
    it('happy case', async () => {
      await l2Bridge.initialize(l1Bridge.address);

      expect(await l2Bridge.l1BridgeAddr()).to.equal(l1Bridge.address);
    })
  })

  describe('l2 makeWrapper', () => {
    it('happy case', async () => {
      await expect(l2Bridge.makeWrapper(nft.address, tokenId))
        .to.emit(l2Bridge, 'NewWrapper')
        .withArgs(serialNumber);

      tokenData = await l2Bridge.serials(serialNumber);
      expect(tokenData.tokenContractAddr).to.equal(nft.address);
      expect(tokenData.owner).to.equal(l2Account1.address);
      expect(tokenData.tokenId).to.equal(tokenId);
    })
  })

  describe('l2 transfer', () => {
    it('happy case', async () => {
      const transferTx = await l2Bridge.transfer(l2Account2.address, serialNumber);

      await transferTx.wait();

      const newTokenData = await l2Bridge.serials(serialNumber);
      expect(newTokenData.owner).to.equal(l2Account2.address);
    })
  })

  describe('l2 withdraw', () => {
    it('happy case', async () => {
      let iface = new ethers.utils.Interface([
        "function claim(bytes32 serialNumber, address newOwner, address tokenContractAddr, uint256 tokenId)"
      ])
      let message = iface.encodeFunctionData("claim", [
        serialNumber,
        l1Address3,
        nft.address,
        tokenId
      ])

      const messageNonce = await l2CrossDomainMessenger.messageNonce();

      const withdrawTx = await l2Bridge
        .connect(l2Account2)
        .withdraw(
          serialNumber,
          l1Address3,
          { gasLimit: 1000000 }
        )

      await expect(withdrawTx)
        .to.emit(l2CrossDomainMessenger, 'SentMessage')
        .withArgs(
          l1Bridge.address,
          l2Bridge.address,
          message,
          messageNonce,
          1000000
        );

      await withdrawTx.wait();

      let tokenData = await l2Bridge.serials(serialNumber);
      expect(tokenData.owner).to.equal(l2Bridge.address);
    })
  })

  describe('l1 claim', () => {
    it('l1Bridge releases nft to account3', async () => {
      expect(await nft.ownerOf(tokenId)).to.equal(l1Address3);
    })
  })
})