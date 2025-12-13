// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LoopBadges
 * @dev NFT contract for GG LOOP achievement badges
 * Badges: Rookie (0-9999 pts), Veteran (10K-24999), Champion (25K-49999), Elite (50K+)
 */
contract LoopBadges is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Badge tiers
    enum BadgeTier {
        Rookie,    // 0-9,999 points
        Veteran,   // 10,000-24,999 points
        Champion,  // 25,000-49,999 points
        Elite      // 50,000+ points
    }

    // Mapping from token ID to badge tier
    mapping(uint256 => BadgeTier) public tokenTier;

    // Mapping from user address to their current badge token ID
    mapping(address => uint256) public userBadge;

    // Events
    event BadgeMinted(address indexed user, uint256 indexed tokenId, BadgeTier tier);
    event BadgeUpgraded(address indexed user, uint256 indexed oldTokenId, uint256 indexed newTokenId, BadgeTier newTier);

    constructor() ERC721("GG LOOP Badge", "GGBADGE") Ownable(msg.sender) {}

    /**
     * @dev Mint a new badge for a user
     * @param to Address to mint the badge to
     * @param tier Badge tier to mint
     * @param uri Metadata URI for the badge
     */
    function mintBadge(address to, BadgeTier tier, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenTier[tokenId] = tier;
        userBadge[to] = tokenId;

        emit BadgeMinted(to, tokenId, tier);
        return tokenId;
    }

    /**
     * @dev Upgrade a user's badge to a higher tier
     * @param user User address
     * @param newTier New badge tier
     * @param uri New metadata URI
     */
    function upgradeBadge(address user, BadgeTier newTier, string memory uri) public onlyOwner returns (uint256) {
        require(userBadge[user] != 0, "User has no badge to upgrade");
        uint256 oldTokenId = userBadge[user];
        BadgeTier oldTier = tokenTier[oldTokenId];
        require(uint8(newTier) > uint8(oldTier), "New tier must be higher than current tier");

        // Burn old badge
        _burn(oldTokenId);

        // Mint new badge
        uint256 newTokenId = _nextTokenId++;
        _safeMint(user, newTokenId);
        _setTokenURI(newTokenId, uri);
        tokenTier[newTokenId] = newTier;
        userBadge[user] = newTokenId;

        emit BadgeUpgraded(user, oldTokenId, newTokenId, newTier);
        return newTokenId;
    }

    /**
     * @dev Get the badge tier for a user
     * @param user User address
     */
    function getUserBadgeTier(address user) public view returns (BadgeTier) {
        uint256 tokenId = userBadge[user];
        require(tokenId != 0, "User has no badge");
        return tokenTier[tokenId];
    }

    /**
     * @dev Check if a user has a badge
     * @param user User address
     */
    function hasBadge(address user) public view returns (bool) {
        return userBadge[user] != 0;
    }

    /**
     * @dev Get the points threshold for a badge tier
     * @param tier Badge tier
     */
    function getTierThreshold(BadgeTier tier) public pure returns (uint256) {
        if (tier == BadgeTier.Rookie) return 0;
        if (tier == BadgeTier.Veteran) return 10000;
        if (tier == BadgeTier.Champion) return 25000;
        if (tier == BadgeTier.Elite) return 50000;
        return 0;
    }

    /**
     * @dev Determine badge tier based on points
     * @param points User's total points
     */
    function determineTier(uint256 points) public pure returns (BadgeTier) {
        if (points >= 50000) return BadgeTier.Elite;
        if (points >= 25000) return BadgeTier.Champion;
        if (points >= 10000) return BadgeTier.Veteran;
        return BadgeTier.Rookie;
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
