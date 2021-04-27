// SPDX-License-Identifier: MIT
/**
 * @author Nes B.
 * @dev Wallet implementation for TofuDEX.
 */

pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol/";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol/";

contract Wallet is Ownable {

    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    bytes32[] public tokenList;

    mapping (address => uint) public weiBalances;

    mapping(bytes32 => Token) public tokenMapping;
    mapping(address => mapping(bytes32 => uint256)) public balances;

    modifier isToken(bytes32 _ticker) {
        require(tokenMapping[_ticker].tokenAddress != address(0), "Token doesn't exist in Tofu.");
        _;
    }

    function addToken(bytes32 _ticker, address _tokenAddress) external onlyOwner {
        tokenMapping[_ticker] = Token(_ticker, _tokenAddress);
        tokenList.push(_ticker);
    }

    function depositToken(uint _amount, bytes32 _ticker) external isToken(_ticker) {
        IERC20(tokenMapping[_ticker].tokenAddress).transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender][_ticker] += _amount;
    }

    function depositWei() public payable {
        weiBalances[msg.sender] += msg.value;
    }

    function withdraw(uint _amount, bytes32 _ticker) external isToken(_ticker) {
        require(balances[msg.sender][_ticker] >= _amount, "Not enough money to withdraw.");
        balances[msg.sender][_ticker] -= _amount;
        IERC20(tokenMapping[_ticker].tokenAddress).transfer(msg.sender,_amount);
    }
}

