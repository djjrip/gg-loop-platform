const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardPayout", function () {
    let rewardPayout;
    let owner;
    let user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();
        const RewardPayout = await ethers.getContractFactory("RewardPayout");
        rewardPayout = await RewardPayout.deploy();
        await rewardPayout.deployed();
    });

    describe("storeClaim", function () {
        it("Should store a claim successfully", async function () {
            const rewardId = 1;
            const amount = 1000;

            const tx = await rewardPayout.storeClaim(user1.address, rewardId, amount);
            const receipt = await tx.wait();

            const claimId = await rewardPayout.claimCounter();
            expect(claimId).to.equal(1);

            const claim = await rewardPayout.getClaim(claimId);
            expect(claim.user).to.equal(user1.address);
            expect(claim.rewardId).to.equal(rewardId);
            expect(claim.amount).to.equal(amount);
            expect(claim.fulfilled).to.equal(false);
        });

        it("Should emit ClaimStored event", async function () {
            await expect(rewardPayout.storeClaim(user1.address, 1, 1000))
                .to.emit(rewardPayout, "ClaimStored")
                .withArgs(1, user1.address, 1, 1000, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
        });

        it("Should revert with invalid user address", async function () {
            await expect(
                rewardPayout.storeClaim(ethers.constants.AddressZero, 1, 1000)
            ).to.be.revertedWith("Invalid user address");
        });

        it("Should revert with zero amount", async function () {
            await expect(
                rewardPayout.storeClaim(user1.address, 1, 0)
            ).to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("fulfillClaim", function () {
        it("Should fulfill a claim successfully", async function () {
            await rewardPayout.storeClaim(user1.address, 1, 1000);

            await rewardPayout.fulfillClaim(1);

            const claim = await rewardPayout.getClaim(1);
            expect(claim.fulfilled).to.equal(true);
        });

        it("Should emit ClaimFulfilled event", async function () {
            await rewardPayout.storeClaim(user1.address, 1, 1000);

            await expect(rewardPayout.fulfillClaim(1))
                .to.emit(rewardPayout, "ClaimFulfilled");
        });

        it("Should revert when fulfilling already fulfilled claim", async function () {
            await rewardPayout.storeClaim(user1.address, 1, 1000);
            await rewardPayout.fulfillClaim(1);

            await expect(rewardPayout.fulfillClaim(1))
                .to.be.revertedWith("Claim already fulfilled");
        });
    });

    describe("getTotalClaims", function () {
        it("Should return correct total claims", async function () {
            expect(await rewardPayout.getTotalClaims()).to.equal(0);

            await rewardPayout.storeClaim(user1.address, 1, 1000);
            expect(await rewardPayout.getTotalClaims()).to.equal(1);

            await rewardPayout.storeClaim(user1.address, 2, 2000);
            expect(await rewardPayout.getTotalClaims()).to.equal(2);
        });
    });
});
