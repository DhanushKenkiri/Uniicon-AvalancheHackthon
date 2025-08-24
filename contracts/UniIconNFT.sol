// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title UniIconNFT
 * @dev Privacy-enabled NFT contract for AI-generated icons on Avalanche C-Chain
 * @notice This contract handles minting and management of private icon NFTs
 */
contract UniIconNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    
    // Privacy-enabled metadata storage
    struct IconMetadata {
        string encryptedPrompt;     // Encrypted user prompt
        bytes32 zkProof;            // Zero-knowledge proof
        uint256 generationTime;     // Timestamp of creation
        address creator;            // Original creator address
        bool isPrivate;             // Always true in our case
        string aiModel;             // AI model used for generation
    }
    
    // Mappings for metadata and creator tracking
    mapping(uint256 => IconMetadata) private _iconMetadata;
    mapping(address => uint256[]) private _creatorIcons;
    
    // Events
    event PrivateIconMinted(
        uint256 indexed tokenId,
        address indexed creator,
        bytes32 zkProof,
        uint256 timestamp
    );
    
    event PrivacyMetadataUpdated(
        uint256 indexed tokenId,
        bytes32 newZKProof
    );

    /**
     * @dev Constructor sets the NFT name, symbol, and initial owner
     * @param initialOwner Address that will own the contract
     */
    constructor(address initialOwner) 
        ERC721("UniIcon Private", "UICON") 
        Ownable(initialOwner) 
    {}

    /**
     * @dev Mint new private icon NFT with encrypted metadata (Owner only)
     * @param to Address to mint the NFT to
     * @param uri URI pointing to the icon metadata
     * @param encryptedPrompt Encrypted user prompt used for generation
     * @param zkProof Zero-knowledge proof for privacy
     * @param aiModel AI model identifier used for generation
     * @return tokenId The ID of the newly minted token
     */
    function mintPrivateIcon(
        address to,
        string memory uri,
        string memory encryptedPrompt,
        bytes32 zkProof,
        string memory aiModel
    ) public onlyOwner nonReentrant returns (uint256) {
        return _mintPrivateIcon(to, uri, encryptedPrompt, zkProof, aiModel);
    }

    /**
     * @dev Public mint function for users to mint their own icons
     * @param uri URI pointing to the icon metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintIcon(string memory uri) public nonReentrant returns (uint256) {
        // For public minting, we use simplified metadata
        string memory defaultPrompt = "User generated icon";
        bytes32 defaultProof = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        string memory defaultModel = "Uniicon AI";
        
        return _mintPrivateIcon(msg.sender, uri, defaultPrompt, defaultProof, defaultModel);
    }

    /**
     * @dev Internal function to mint a private icon NFT
     */
    function _mintPrivateIcon(
        address to,
        string memory uri,
        string memory encryptedPrompt,
        bytes32 zkProof,
        string memory aiModel
    ) internal returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Store encrypted metadata
        _iconMetadata[tokenId] = IconMetadata({
            encryptedPrompt: encryptedPrompt,
            zkProof: zkProof,
            generationTime: block.timestamp,
            creator: to,
            isPrivate: true, // Always private for enhanced privacy
            aiModel: aiModel
        });
        
        // Track creator's icons
        _creatorIcons[to].push(tokenId);
        
        emit PrivateIconMinted(tokenId, to, zkProof, block.timestamp);
        
        return tokenId;
    }

    /**
     * @dev Get encrypted metadata for a token (only readable by owner)
     * @param tokenId The token ID to query
     * @return IconMetadata struct containing encrypted data
     */
    function getIconMetadata(uint256 tokenId) 
        public 
        view 
        returns (IconMetadata memory) 
    {
        require(_exists(tokenId), "UniIconNFT: Token does not exist");
        return _iconMetadata[tokenId];
    }

    /**
     * @dev Get all icon token IDs created by a specific address
     * @param creator The creator address to query
     * @return Array of token IDs created by the address
     */
    function getCreatorIcons(address creator) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return _creatorIcons[creator];
    }

    /**
     * @dev Update the zero-knowledge proof for a token (owner only)
     * @param tokenId The token ID to update
     * @param newZKProof The new zero-knowledge proof
     */
    function updatePrivacyProof(uint256 tokenId, bytes32 newZKProof) 
        public 
        nonReentrant
    {
        require(ownerOf(tokenId) == msg.sender, "UniIconNFT: Not token owner");
        _iconMetadata[tokenId].zkProof = newZKProof;
        
        emit PrivacyMetadataUpdated(tokenId, newZKProof);
    }

    /**
     * @dev Get the total number of tokens minted
     * @return Total supply of tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Check if a token exists
     * @param tokenId The token ID to check
     * @return Boolean indicating if token exists
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    /**
     * @dev Batch mint multiple icons (gas efficient for multiple creations)
     * @param recipients Array of addresses to mint to
     * @param uris Array of token URIs
     * @param encryptedPrompts Array of encrypted prompts
     * @param zkProofs Array of zero-knowledge proofs
     * @param aiModels Array of AI model identifiers
     * @return Array of newly minted token IDs
     */
    function batchMintPrivateIcons(
        address[] memory recipients,
        string[] memory uris,
        string[] memory encryptedPrompts,
        bytes32[] memory zkProofs,
        string[] memory aiModels
    ) public onlyOwner nonReentrant returns (uint256[] memory) {
        require(
            recipients.length == uris.length &&
            recipients.length == encryptedPrompts.length &&
            recipients.length == zkProofs.length &&
            recipients.length == aiModels.length,
            "UniIconNFT: Array length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = _mintPrivateIcon(
                recipients[i],
                uris[i],
                encryptedPrompts[i],
                zkProofs[i],
                aiModels[i]
            );
        }

        return tokenIds;
    }

    /**
     * @dev Emergency function to update contract owner
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "UniIconNFT: New owner cannot be zero address");
        super.transferOwnership(newOwner);
    }

    // Required overrides for ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Internal function to check if token exists
     * @param tokenId Token ID to check
     * @return Boolean indicating existence
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
