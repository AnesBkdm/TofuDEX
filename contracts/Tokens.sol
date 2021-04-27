// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("TestToken", "TST") {
        _mint(msg.sender, 100000); // Accounts[0]
        _mint(0xDd63FC28C8A87F5035995E6C960b819a3098543c, 100000); // Accounts[1]
    }
}

