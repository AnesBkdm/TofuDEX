// SPDX-License-Identifier: MIT

/**
 * @author Nes B.
 * @dev ERC20 tokens implementation for TofuDEX.
 * @notice Developed using openzeppelin 4.0 and Truffle 5.3.2
 */
pragma solidity ^0.8.0;

import "./lib/ERC20.sol";

/**
 * @dev I've only made one token with a default mint for testing purposes.
 */
contract TestToken is ERC20 {
    constructor() ERC20("TestToken", "TST") {
        _mint(msg.sender, 100000); // Accounts[0]
        _mint(0xDd63FC28C8A87F5035995E6C960b819a3098543c, 100000); // Accounts[1]
    }
}

