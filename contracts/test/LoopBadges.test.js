const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoopBadges", function () {
    let loopBadges;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const LoopBadges = await ethers.getContractFactory("LoopBadges");
        loopBadges = await LoopBadges.deploy();
        await loopBadges.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await loopBadges.owner()).to.equal(owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await loopBadges.name()).to.equal("GG LOOP Badge");
            expect(await loopBadges.symbol()).to.equal("GGBADGE");
        });
    });

    describe("Badge Minting", function () {
        it("Should mint a Rookie badge", async function () {
            const uri = "ipfs://QmRookieBadge";
            const tx = await loopBadges.mintBadge(user1.address, 0, uri); // 0 = Rookie
            await tx.wait();

            expect(await loopBadges.hasBadge(user1.address)).to.be.true;
            expect(await loopBadges.getUserBadgeTier(user1.address)).to.equal(0);
            expect(await loopBadges.balanceOf(user1.address)).to.equal(1);
        });

        it("Should mint a Veteran badge", async function () {
            const uri = "ipfs://QmVeteranBadge";
            await loopBadges.mintBadge(user1.address, 1, uri); // 1 = Veteran

            expect(await loopBadges.getUserBadgeTier(user1.address)).to.equal(1);
        });

        it("Should mint a Champion badge", async function () {
            const uri = "ipfs://QmChampionBadge";
            await loopBadges.mintBadge(user1.address, 2, uri); // 2 = Champion

            expect(await loopBadges.getUserBadgeTier(user1.address)).to.equal(2);
        });

        it("Should mint an Elite badge", async function () {
            const uri = "ipfs://QmEliteBadge";
            await loopBadges.mintBadge(user1.address, 3, uri); // 3 = Elite

            expect(await loopBadges.getUserBadgeTier(user1.address)).to.equal(3);
        });

        it("Should only allow owner to mint badges", async function () {
            const uri = "ipfs://QmRookieBadge";
            await expect(
                loopBadges.connect(user1).mintBadge(user2.address, 0, uri)
            ).to.be.reverted;
        });

        it("Should emit BadgeMinted event", async function () {
            const uri = "ipfs://QmRookieBadge";
            await expect(loopBadges.mintBadge(user1.address, 0, uri))
                .to.emit(loopBadges, "BadgeMinted")
                .withArgs(user1.address, 0, 0);
        });
    });

    describe("Badge Upgrading", function () {
        beforeEach(async function () {
            // Mint initial Rookie badge
            await loopBadges.mintBadge(user1.address, 0, "ipfs://QmRookieBadge");
        });

        it("Should upgrade badge to higher tier", async function () {
            const newUri = "ipfs://QmVeteranBadge";
            await loopBadges.upgradeBadge(user1.address, 1, newUri); // Upgrade to Veteran

            expect(await loopBadges.getUserBadgeTier(user1.address)).to.equal(1);
            expect(await loopBadges.balanceOf(user1.address)).to.equal(1); // Still only 1 badge
        });

        it("Should burn old badge when upgrading", async function () {
            const oldTokenId = await loopBadges.userBadge(user1.address);
            await loopBadges.upgradeBadge(user1.address, 1, "ipfs://QmVeteranBadge");

            // Old token should be burned
            await expect(loopBadges.ownerOf(oldTokenId)).to.be.reverted;
        });

        it("Should not allow downgrade", async function () {
            // Upgrade to Veteran first
            await loopBadges.upgradeBadge(user1.address, 1, "ipfs://QmVeteranBadge");

            // Try to downgrade to Rookie
            await expect(
                loopBadges.upgradeBadge(user1.address, 0, "ipfs://QmRookieBadge")
            ).to.be.revertedWith("New tier must be higher than current tier");
        });

        it("Should emit BadgeUpgraded event", async function () {
            const oldTokenId = await loopBadges.userBadge(user1.address);
            await expect(loopBadges.upgradeBadge(user1.address, 1, "ipfs://QmVeteranBadge"))
                .to.emit(loopBadges, "BadgeUpgraded");
        });

        it("Should only allow owner to upgrade badges", async function () {
            await expect(
                loopBadges.connect(user1).upgradeBadge(user1.address, 1, "ipfs://QmVeteranBadge")
            ).to.be.reverted;
        });
    });

    describe("Tier Determination", function () {
        it("Should determine Rookie tier for 0-9999 points", async function () {
            expect(await loopBadges.determineTier(0)).to.equal(0);
            expect(await loopBadges.determineTier(5000)).to.equal(0);
            expect(await loopBadges.determineTier(9999)).to.equal(0);
        });

        it("Should determine Veteran tier for 10K-24999 points", async function () {
            expect(await loopBadges.determineTier(10000)).to.equal(1);
            expect(await loopBadges.determineTier(15000)).to.equal(1);
            expect(await loopBadges.determineTier(24999)).to.equal(1);
        });

        it("Should determine Champion tier for 25K-49999 points", async function () {
            expect(await loopBadges.determineTier(25000)).to.equal(2);
            expect(await loopBadges.determineTier(35000)).to.equal(2);
            expect(await loopBadges.determineTier(49999)).to.equal(2);
        });

        it("Should determine Elite tier for 50K+ points", async function () {
            expect(await loopBadges.determineTier(50000)).to.equal(3);
            expect(await loopBadges.determineTier(100000)).to.equal(3);
            expect(await loopBadges.determineTier(1000000)).to.equal(3);
        });
    });

    describe("Tier Thresholds", function () {
        it("Should return correct thresholds", async function () {
            expect(await loopBadges.getTierThreshold(0)).to.equal(0);      // Rookie
            expect(await loopBadges.getTierThreshold(1)).to.equal(10000);  // Veteran
            expect(await loopBadges.getTierThreshold(2)).to.equal(25000);  // Champion
            expect(await loopBadges.getTierThreshold(3)).to.equal(50000);  // Elite
        });
    });

    describe("Badge Queries", function () {
        it("Should return false for users without badges", async function () {
            expect(await loopBadges.hasBadge(user1.address)).to.be.false;
        });

        it("Should revert when querying tier for user without badge", async function () {
            await expect(
                loopBadges.getUserBadgeTier(user1.address)
            ).to.be.revertedWith("User has no badge");
        });

        it("Should track multiple users' badges", async function () {
            await loopBadges.mintBadge(user1.address, 0, "ipfs://QmRookie1");
            await loopBadges.mintBadge(user2.address, 2, "ipfs://QmChampion2");

            expect(await loopBadges.getUserBadgeTier(user1.address)).to.equal(0);
            expect(await loopBadges.getUserBadgeTier(user2.address)).to.equal(2);
        });
    });
});
