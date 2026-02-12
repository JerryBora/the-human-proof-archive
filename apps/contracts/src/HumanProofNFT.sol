// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HumanProofNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_ART_PIECES = 20;
    uint256 public constant TIER_1_COUNT = 10; // 1-of-1s
    uint256 public constant TIER_2_COUNT = 10; // 1-of-5s

    uint256 public mintFeeTier1 = 0.05 ether; // Price for 1-of-1s
    uint256 public mintFeeTier2 = 0.01 ether; // Price for 1-of-5s

    struct ArtPiece {
        string memoryHash; // IPFS hash of the story/memory
        uint256 maxSupply;
        uint256 mintedCount;
        bool exists;
    }

    mapping(uint256 => ArtPiece) public artPieces;
    uint256 public nextArtPieceId = 1;

    // Mapping to track if an agent address is authorized to mint a specific piece
    mapping(address => mapping(uint256 => bool)) public authorizedMinters;

    constructor() ERC721("The Human Proof", "HPROO") Ownable(msg.sender) {}

    function setFees(uint256 _tier1, uint256 _tier2) external onlyOwner {
        mintFeeTier1 = _tier1;
        mintFeeTier2 = _tier2;
    }

    // Backend calls this once the agent passes the challenge
    function authorizeMinter(address _agent, uint256 _artPieceId) external onlyOwner {
        authorizedMinters[_agent][_artPieceId] = true;
    }

    function registerArtPiece(string memory _memoryHash, uint256 _maxSupply) external onlyOwner {
        require(nextArtPieceId <= MAX_ART_PIECES, "Max art pieces reached");
        require(_maxSupply == 1 || _maxSupply == 5, "Invalid supply tier");
        
        artPieces[nextArtPieceId] = ArtPiece({
            memoryHash: _memoryHash,
            maxSupply: _maxSupply,
            mintedCount: 0,
            exists: true
        });
        
        nextArtPieceId++;
    }

    function mint(uint256 _artPieceId) external payable {
        ArtPiece storage piece = artPieces[_artPieceId];
        require(piece.exists, "Art piece does not exist");
        require(piece.mintedCount < piece.maxSupply, "Sold out");
        require(authorizedMinters[msg.sender][_artPieceId], "Must pass Agent Challenge first");

        uint256 fee = (piece.maxSupply == 1) ? mintFeeTier1 : mintFeeTier2;
        require(msg.value >= fee, "Insufficient ETH sent");
        
        piece.mintedCount++;
        authorizedMinters[msg.sender][_artPieceId] = false; // Reset authorization
        
        uint256 tokenId = (_artPieceId * 1000) + piece.mintedCount;
        _safeMint(msg.sender, tokenId);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Overrides for metadata URI logic
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 artPieceId = tokenId / 1000;
        return artPieces[artPieceId].memoryHash;
    }
}
