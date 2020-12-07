const { assert } = require("chai");

describe("Escrow", function() {
  let escrow;
  let aWETH;
  let depositor;
  let arbiter;
  let beneficiary;
  const deposit = ethers.utils.parseEther("1");
  beforeEach(async () => {
    const Escrow = await ethers.getContractFactory("Escrow");
    [depositor, arbiter, beneficiary] = await ethers.provider.listAccounts();
    escrow = await Escrow.deploy(arbiter, beneficiary, { value: deposit });
    await escrow.deployed();

    aWETH = await ethers.getContractAt("IERC20", "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e");
  });

  it("should not have an ether balance", async function() {
    const balance = await ethers.provider.getBalance(escrow.address);
    assert.equal(balance.toString(), "0");
  });

  it("should have aWETH", async function() {
    const balance = await aWETH.balanceOf(escrow.address);
    assert.equal(balance.toString(), deposit.toString());
  });

  describe('after a long time period', () => {
    beforeEach(async () => {
      const thousandDays = 1000 * 24 * 60 * 60;
      await hre.network.provider.request({
        method: "evm_increaseTime",
        params: [thousandDays]
      });
    });

    it('a withdrawal should transfer the initial deposit to the beneficiary', async () => {
      const balanceBefore = await ethers.provider.getBalance(beneficiary);
      const arbiterSigner = ethers.provider.getSigner(arbiter);
      await escrow.connect(arbiterSigner).withdraw();
      const balanceAfter = await ethers.provider.getBalance(beneficiary);
      assert(balanceAfter.sub(balanceBefore).eq(deposit));
    });

    it('a withdrawal should transfer interest to the depositor', async () => {
      const balanceBefore = await ethers.provider.getBalance(depositor);
      const arbiterSigner = ethers.provider.getSigner(arbiter);
      await escrow.connect(arbiterSigner).withdraw();
      const balanceAfter = await ethers.provider.getBalance(depositor);
      assert(balanceAfter.sub(balanceBefore).gt(0));
    });
  });
});
