// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RewardPayout
 * @dev Smart contract stub for GG LOOP reward claim storage
 * @notice This is a Level 7 scaffold - no on-chain deployment yet
 */
contract RewardPayout {
    struct Claim {
        address user;
        uint256 rewardId;
        uint256 amount;
        uint256 timestamp;
        bool fulfilled;
    }

    mapping(uint256 => Claim) public claims;
    uint256 public claimCounter;

    event ClaimStored(
        uint256 indexed claimId,
        address indexed user,
        uint256 rewardId,
        uint256 amount,
        uint256 timestamp
    );

    event ClaimFulfilled(uint256 indexed claimId, uint256 timestamp);

    /**
     * @dev Store a reward claim on-chain
     * @param user Address of the user claiming the reward
     * @param rewardId ID of the reward being claimed
     * @param amount Points cost of the reward
     */
    function storeClaim(
        address user,
        uint256 rewardId,
        uint256 amount
    ) public returns (uint256) {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");

        claimCounter++;
        uint256 claimId = claimCounter;

        claims[claimId] = Claim({
            user: user,
            rewardId: rewardId,
            amount: amount,
            timestamp: block.timestamp,
            fulfilled: false
        });

        emit ClaimStored(claimId, user, rewardId, amount, block.timestamp);

        return claimId;
    }

    /**
     * @dev Mark a claim as fulfilled
     * @param claimId ID of the claim to fulfill
     */
    function fulfillClaim(uint256 claimId) public {
        require(claimId > 0 && claimId <= claimCounter, "Invalid claim ID");
        require(!claims[claimId].fulfilled, "Claim already fulfilled");

        claims[claimId].fulfilled = true;

        emit ClaimFulfilled(claimId, block.timestamp);
    }

    /**
     * @dev Get claim details
     * @param claimId ID of the claim
     */
    function getClaim(uint256 claimId)
        public
        view
        returns (
            address user,
            uint256 rewardId,
            uint256 amount,
            uint256 timestamp,
            bool fulfilled
        )
    {
        require(claimId > 0 && claimId <= claimCounter, "Invalid claim ID");
        Claim memory claim = claims[claimId];
        return (
            claim.user,
            claim.rewardId,
            claim.amount,
            claim.timestamp,
            claim.fulfilled
        );
    }

    /**
     * @dev Get total number of claims
     */
    function getTotalClaims() public view returns (uint256) {
        return claimCounter;
    }
}
