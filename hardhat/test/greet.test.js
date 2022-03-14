const { expect } = require('chai');

describe('Greet', () => {
  let greet;

  before('deploy contract', async () => {
    const Greet = await ethers.getContractFactory('Greet');
    greet = await Greet.deploy();
  })

  describe('change greeting', async () => {
    it('happy case', async () => {
      // console.log(await expect(greet
      //   .greeting("yo"))
      //     .to.emit(greet, 'NewGreeting')
      //     .withArgs("yo"))

      const tx = await greet.greeting('yo');

      console.log(tx);
      expect(tx)
          .to.emit(greet, 'NewGreeting')
          .withArgs("yo");
      


      // console.log('tx', (expect(greet
      //   .greeting("yo"))
      //     .to.emit(greet, 'NewGreeting')
      //     .withArgs("yo").contract.deployTransaction));
      })
  })
})