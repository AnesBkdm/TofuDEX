// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Wallet.sol";


contract Dex is Wallet {

    enum Side {
        BUY,
        SELL
    }

    struct Order {
        uint id;
        address trader;
        bool buyOrder;
        bytes32 ticker;
        uint amount;
        uint price;
    }

    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

    function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory){
        return orderBook[ticker][uint(side)];
    }

    function getOrderInfo (bytes32 i, uint j) public pure returns (uint id_, address trader_, bool buyOrder_, bytes32 ticker_, uint amount_, uint price_){
        return (orderBook[i][j].id, orderBook[i][j].trader, orderBook[i][j].buyOrder, orderBook[i][j].ticker, orderBook[i][j].amount, orderBook[i][j].price);
    }

    // function createLimitOrder(uint _side, bytes32 _ticker, uint _amount, uint _price) {

    // }

}