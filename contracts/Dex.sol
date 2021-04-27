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
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
    }

    uint nextOrderId = 0;

    mapping(bytes32 => mapping(uint => Order[])) public orderBook; // uint is for the side

    function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory){
        return orderBook[ticker][uint(side)];
    }

    // function getOrderInfo (bytes32 i, uint j) public pure returns (uint id_, address trader_, bool buyOrder_, bytes32 ticker_, uint amount_, uint price_){
    //     return (orderBook[i][j].id, orderBook[i][j].trader, orderBook[i][j].buyOrder, orderBook[i][j].ticker, orderBook[i][j].amount, orderBook[i][j].price);
    // }

    function emptyOrderBook(Side _side, bytes32 _ticker) public {
        Order[] memory o;
        orderBook[_ticker][uint(_side)] = o;
    }

    // function createMarketOrder(Side _side, bytes32 _ticker, uint _amount) public {
    //     _;
    // }

    function createLimitOrder(Side _side, bytes32 _ticker, uint _amount, uint _price) public {
        if(_side == Side.BUY){
            require(weiBalances[msg.sender] >= _amount * _price);
        }

        if(_side == Side.SELL){
            require(balances[msg.sender][_ticker] >= _amount);
        }

        Order[] storage orders = orderBook[_ticker][uint(_side)];

        orders.push(
            Order(nextOrderId, msg.sender, _side, _ticker, _amount, _price)
        );

        // Bubble sort

        uint j = orders.length > 0 ? orders.length-1 : 0;

        if(_side == Side.BUY){
            while(j>0){
                if(orders[j-1].price > orders[j].price){
                    break;
                }
                Order memory o = orders[j-1];
                orders[j-1] = orders[j];
                orders[j] = o;
                j--;
            }
        } else if(_side == Side.SELL){
            while(j>0){
                if(orders[j-1].price < orders[j].price){
                    break;
                }
                Order memory o = orders[j-1];
                orders[j-1] = orders[j];
                orders[j] = o;
                j--;
            }
        }

        nextOrderId++;

    }

}