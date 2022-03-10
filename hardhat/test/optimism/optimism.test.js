const { expect } = require('chai');
const { BigNumber } = require('ethers');

describe('Dest works', () => {
  let dest;

  before(async () => {
    [owner] = await ethers.getSigners();

    const Dest = await ethers.getContractFactory('Dest');
    dest = await Dest.deploy();
    await dest.deployed();
  });

  it('yay', async () => {
    console.log(dest.address);
  })
})