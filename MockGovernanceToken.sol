// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockGovernanceToken is ERC20 {
    constructor() ERC20("Mock Governance Token", "MGT") {
        _mint(msg.sender, 1_000_000 ether); // Mint 1 million tokens to deployer
    }
}// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockGovernanceToken is ERC20 {
    constructor() ERC20("Mock Governance Token", "MGT") {
        _mint(msg.sender, 1_000_000 ether); // Mint 1 million tokens to deployer
    }
}