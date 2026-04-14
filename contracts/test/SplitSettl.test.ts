import { expect } from "chai";
import { ethers } from "hardhat";
import { SplitSettl } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SplitSettl", function () {
  let contract: SplitSettl;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;

  beforeEach(async function () {
    [owner, alice, bob, carol] = await ethers.getSigners();
    const SplitSettl = await ethers.getContractFactory("SplitSettl");
    contract = await SplitSettl.deploy();
    await contract.waitForDeployment();
  });

  describe("Project Management", function () {
    it("should create a project with contributors", async function () {
      await contract.createProject(
        "Test Project",
        [alice.address, bob.address],
        [6000, 4000]
      );

      const [name, projOwner, count, totalPaid, , active] = await contract.getProject(0);
      expect(name).to.equal("Test Project");
      expect(projOwner).to.equal(owner.address);
      expect(count).to.equal(2);
      expect(totalPaid).to.equal(0);
      expect(active).to.be.true;
    });

    it("should reject splits not summing to 10000", async function () {
      await expect(
        contract.createProject("Bad", [alice.address], [5000])
      ).to.be.revertedWith("Splits must sum to 10000");
    });

    it("should update splits", async function () {
      await contract.createProject(
        "Test",
        [alice.address, bob.address],
        [6000, 4000]
      );
      await contract.updateSplits(0, [5000, 5000]);

      const [addrs, splits] = await contract.getProjectContributors(0);
      expect(splits[0]).to.equal(5000);
      expect(splits[1]).to.equal(5000);
    });
  });

  describe("Payment Processing", function () {
    beforeEach(async function () {
      await contract.createProject(
        "Payment Test",
        [alice.address, bob.address, carol.address],
        [5000, 3000, 2000]
      );
    });

    it("should split native HSK payments correctly", async function () {
      const amount = ethers.parseEther("1.0");

      const aliceBefore = await ethers.provider.getBalance(alice.address);
      const bobBefore = await ethers.provider.getBalance(bob.address);
      const carolBefore = await ethers.provider.getBalance(carol.address);

      await contract.submitPayment(0, "INV-001", { value: amount });

      const aliceAfter = await ethers.provider.getBalance(alice.address);
      const bobAfter = await ethers.provider.getBalance(bob.address);
      const carolAfter = await ethers.provider.getBalance(carol.address);

      expect(aliceAfter - aliceBefore).to.equal(ethers.parseEther("0.5"));
      expect(bobAfter - bobBefore).to.equal(ethers.parseEther("0.3"));
      expect(carolAfter - carolBefore).to.equal(ethers.parseEther("0.2"));
    });

    it("should emit PaymentSplit event", async function () {
      const amount = ethers.parseEther("1.0");
      await expect(contract.submitPayment(0, "INV-001", { value: amount }))
        .to.emit(contract, "PaymentSplit")
        .withArgs(0, amount, "INV-001");
    });

    it("should track payment history", async function () {
      await contract.submitPayment(0, "INV-001", { value: ethers.parseEther("1.0") });
      await contract.submitPayment(0, "INV-002", { value: ethers.parseEther("2.0") });

      const count = await contract.getProjectPaymentCount(0);
      expect(count).to.equal(2);
    });
  });

  describe("HSP Tracking", function () {
    beforeEach(async function () {
      await contract.createProject("HSP Test", [alice.address], [10000]);
    });

    it("should track full HSP lifecycle", async function () {
      await contract.emitPaymentRequest(0, ethers.parseEther("1.0"), "HSP-001");

      let [, , status] = await contract.getHSPStatus("HSP-001");
      expect(status).to.equal(1); // Requested

      await contract.emitPaymentConfirmation(0, "HSP-001");
      [, , status] = await contract.getHSPStatus("HSP-001");
      expect(status).to.equal(2); // Confirmed

      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx"));
      await contract.emitPaymentReceipt(0, "HSP-001", txHash);
      [, , status] = await contract.getHSPStatus("HSP-001");
      expect(status).to.equal(3); // ReceiptGenerated
    });

    it("should reject confirmation without request", async function () {
      await expect(
        contract.emitPaymentConfirmation(0, "HSP-NONE")
      ).to.be.revertedWith("Not in Requested state");
    });
  });

  describe("ERC20 (MockUSDT) + HSP on payment record", function () {
    let token: Awaited<ReturnType<typeof deployMockUsdt>>;

    async function deployMockUsdt() {
      const Mock = await ethers.getContractFactory("MockUSDT");
      const t = await Mock.deploy();
      await t.waitForDeployment();
      return t;
    }

    beforeEach(async function () {
      token = await deployMockUsdt();
      await contract.createProject(
        "ERC20 Project",
        [alice.address, bob.address],
        [5000, 5000]
      );
    });

    it("should split MockUSDT via submitPaymentERC20 and store HSP id on Payment", async function () {
      const amount = 1_000_000n; // 1 USDT (6 decimals)
      const hspId = "HSP-ERC20-001";

      await token.mint(alice.address, amount);
      await token.connect(alice).approve(await contract.getAddress(), amount);

      await expect(
        contract
          .connect(alice)
          .submitPaymentERC20(0, await token.getAddress(), amount, "INV-ERC20-1", hspId)
      )
        .to.emit(contract, "HSPRequestCreated")
        .and.to.emit(contract, "PaymentSplit");

      const hist = await contract.getProjectPaymentHistory(0);
      expect(hist.length).to.equal(1);
      expect(hist[0].invoiceRef).to.equal("INV-ERC20-1");
      expect(hist[0].hspRequestId).to.equal(hspId);
      expect(hist[0].token).to.equal(await token.getAddress());

      const balBob = await token.balanceOf(bob.address);
      const balAlice = await token.balanceOf(alice.address);
      expect(balBob).to.equal(500_000n);
      expect(balAlice).to.equal(500_000n);
    });
  });
});
