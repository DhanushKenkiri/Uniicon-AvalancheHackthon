// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./UniIconNFT.sol";

contract AVAXPayments is Ownable, ReentrancyGuard {
    UniIconNFT public immutable nftContract;
    
    // Fixed pricing (privacy always enabled)
    uint256 public constant BASE_PRICE = 0.02 ether; // 0.02 AVAX (~$0.50 at $25/AVAX)
    uint256 public constant PRIVACY_MULTIPLIER = 150; // 1.5x = 150/100
    uint256 public constant TOTAL_PRICE = (BASE_PRICE * PRIVACY_MULTIPLIER) / 100;
    
    // Revenue distribution
    address public platformWallet;
    address public creatorWallet;
    uint256 public platformShare = 70; // 70%
    uint256 public creatorShare = 30;  // 30%
    
    // Payment tracking
    mapping(address => uint256) public userPayments;
    mapping(bytes32 => bool) public processedPayments;
    
    // Events
    event PrivateIconPaid(
        address indexed user,
        uint256 amount,
        bytes32 paymentHash,
        uint256 timestamp
    );
    
    event RevenueDistributed(
        address indexed platform,
        address indexed creator,
        uint256 platformAmount,
        uint256 creatorAmount
    );

    constructor(
        address _nftContract,
        address _platformWallet,
        address _creatorWallet,
        address initialOwner
    ) Ownable(initialOwner) {
        nftContract = UniIconNFT(_nftContract);
        platformWallet = _platformWallet;
        creatorWallet = _creatorWallet;
    }

    // Allow contract to receive AVAX
    receive() external payable {}

    // Pay for private icon generation
    function payForPrivateIcon(
        string memory encryptedPrompt,
        bytes32 /* zkProof */
    ) external payable nonReentrant {
        require(msg.value == TOTAL_PRICE, "Incorrect payment amount");
        
        bytes32 paymentHash = keccak256(
            abi.encodePacked(msg.sender, encryptedPrompt)
        );
        
        require(!processedPayments[paymentHash], "Payment already processed");
        processedPayments[paymentHash] = true;
        
        userPayments[msg.sender] += msg.value;
        
        emit PrivateIconPaid(msg.sender, msg.value, paymentHash, block.timestamp);
        
        // Distribute revenue immediately
        _distributeRevenue(msg.value);
    }

    // Internal revenue distribution
    function _distributeRevenue(uint256 amount) internal {
        uint256 platformAmount = (amount * platformShare) / 100;
        uint256 creatorAmount = amount - platformAmount;
        
        (bool platformSuccess, ) = platformWallet.call{value: platformAmount}("");
        (bool creatorSuccess, ) = creatorWallet.call{value: creatorAmount}("");
        
        require(platformSuccess && creatorSuccess, "Revenue distribution failed");
        
        emit RevenueDistributed(
            platformWallet, 
            creatorWallet, 
            platformAmount, 
            creatorAmount
        );
    }

    // Get current pricing (always includes privacy premium)
    function getCurrentPrice() external pure returns (uint256) {
        return TOTAL_PRICE;
    }

    // Check if user has paid
    function hasUserPaid(address user) external view returns (bool) {
        return userPayments[user] > 0;
    }

    // Admin functions
    function updateWallets(
        address _platformWallet,
        address _creatorWallet
    ) external onlyOwner {
        platformWallet = _platformWallet;
        creatorWallet = _creatorWallet;
    }

    // Emergency withdrawal
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
}
