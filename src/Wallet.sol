// SPDX-License-Identifier: MIT

/**
 * @author Nes B.
 * @dev Wallet implementation for TofuDEX.
 * @notice Developed using openzeppelin 4.0 and Truffle 5.3.2
 */

pragma solidity ^0.8.0;

import "./lib/IERC20.sol/";
import "./lib/Ownable.sol/";

contract Wallet is Ownable {

    /**
    * @dev Token structure for the entire DEX.
    */
    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    bytes32[] public tokenList;

    mapping(bytes32 => Token) public tokenMapping;

    /**
    * @dev Separated token and ETH balances.
    */
    mapping(address => mapping(bytes32 => uint)) public balances;
    mapping(address => uint) public weiBalances;

    /**
    * @dev Token checker.
    */
    modifier isToken(bytes32 _ticker) {
        require(tokenMapping[_ticker].tokenAddress != address(0), "Token doesn't exist in Tofu.");
        _;
    }

    /**
    * @dev Token adder.
    */
    function addToken(bytes32 _ticker, address _tokenAddress) external onlyOwner {
        tokenMapping[_ticker] = Token(_ticker, _tokenAddress);
        tokenList.push(_ticker);
    }

    /**
    * @dev Token depositer.
    */
    function depositToken(uint _amount, bytes32 _ticker) external isToken(_ticker) {
        IERC20(tokenMapping[_ticker].tokenAddress).transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender][_ticker] += _amount;
    }

    /**
    * @dev ETH adder.
    */
    function depositWei() public payable {
        weiBalances[msg.sender] += msg.value;
    }

    /**
    * @dev Token withdrawer.
    */
    function withdraw(uint _amount, bytes32 _ticker) external isToken(_ticker) {
        require(balances[msg.sender][_ticker] >= _amount, "Not enough money to withdraw.");
        balances[msg.sender][_ticker] -= _amount;
        IERC20(tokenMapping[_ticker].tokenAddress).transfer(msg.sender,_amount);
    }

    /**
    * @dev Token balance getter.
    */
    function getTokenBalance(bytes32 _ticker) public view returns (uint) {
        return balances[msg.sender][_ticker];
    }

    /**
    * @dev ETH balance getter.
    */
    function getWeiBalance() public view returns (uint){
        return weiBalances[msg.sender];
    }
}

