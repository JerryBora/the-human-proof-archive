// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HumanProof {
    address public owner;
    uint256 public constant FRICTION_FEE = 0.0001 ether;

    event HandshakeInitiated(
        address indexed user,
        bytes32 indexed challengeHash,
        uint256 timestamp
    );

    mapping(bytes32 => bool) public usedChallenges;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function initiateHandshake(bytes32 challengeHash) external payable {
        require(msg.value >= FRICTION_FEE, "Insufficient fee");
        require(!usedChallenges[challengeHash], "Challenge already used");
        
        usedChallenges[challengeHash] = true;
        emit HandshakeInitiated(msg.sender, challengeHash, block.timestamp);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
