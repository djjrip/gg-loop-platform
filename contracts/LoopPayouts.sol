// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LoopPayouts
 * @dev Manages creator payouts with admin approval
 */
contract LoopPayouts is Ownable, ReentrancyGuard {
    struct PayoutRequest {
        address creator;
        uint256 amount;
        bool approved;
        bool paid;
        uint256 requestedAt;
        uint256 approvedAt;
    }

    mapping(uint256 => PayoutRequest) public payoutRequests;
    uint256 public nextRequestId;
    
    event PayoutRequested(uint256 indexed requestId, address indexed creator, uint256 amount);
    event PayoutApproved(uint256 indexed requestId, address indexed approver);
    event PayoutPaid(uint256 indexed requestId, address indexed creator, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function requestPayout(uint256 amount) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 requestId = nextRequestId++;
        payoutRequests[requestId] = PayoutRequest({
            creator: msg.sender,
            amount: amount,
            approved: false,
            paid: false,
            requestedAt: block.timestamp,
            approvedAt: 0
        });

        emit PayoutRequested(requestId, msg.sender, amount);
        return requestId;
    }

    function approvePayout(uint256 requestId) external onlyOwner {
        PayoutRequest storage request = payoutRequests[requestId];
        require(request.creator != address(0), "Request does not exist");
        require(!request.approved, "Already approved");
        require(!request.paid, "Already paid");

        request.approved = true;
        request.approvedAt = block.timestamp;

        emit PayoutApproved(requestId, msg.sender);
    }

    function executePayout(uint256 requestId) external onlyOwner nonReentrant {
        PayoutRequest storage request = payoutRequests[requestId];
        require(request.approved, "Not approved");
        require(!request.paid, "Already paid");
        require(address(this).balance >= request.amount, "Insufficient balance");

        request.paid = true;
        
        (bool success, ) = request.creator.call{value: request.amount}("");
        require(success, "Transfer failed");

        emit PayoutPaid(requestId, request.creator, request.amount);
    }

    function batchApprovePay(uint256[] calldata requestIds) external onlyOwner nonReentrant {
        for (uint256 i = 0; i < requestIds.length; i++) {
            uint256 requestId = requestIds[i];
            PayoutRequest storage request = payoutRequests[requestId];
            
            if (request.creator != address(0) && !request.paid && address(this).balance >= request.amount) {
                if (!request.approved) {
                    request.approved = true;
                    request.approvedAt = block.timestamp;
                    emit PayoutApproved(requestId, msg.sender);
                }
                
                request.paid = true;
                (bool success, ) = request.creator.call{value: request.amount}("");
                if (success) {
                    emit PayoutPaid(requestId, request.creator, request.amount);
                }
            }
        }
    }

    receive() external payable {}
}
