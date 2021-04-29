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

    function createMarketOrder(Side _side, bytes32 _ticker, uint _amount) public {
        
        if(_side == Side.SELL){
            require(balances[msg.sender][_ticker] >= _amount, "Not enough tokens to make trade");
        }

        uint orderBookSide;

        if(_side == Side.BUY){
            orderBookSide = 1;
        } else {
            orderBookSide = 0;
        }

        Order[] storage orders = orderBook[_ticker][orderBookSide];

        uint totalFilled;
        uint toFill;

        for (uint256 i = 0; i < orders.length && totalFilled < _amount; i++) {
            
            if(totalFilled + orders[i].amount <= _amount){
                toFill = orders[i].amount;
            } else if (totalFilled + orders[i].amount > _amount){
                toFill = orders[i].amount - totalFilled;
            }

            if(_side == Side.BUY){
                
                require(weiBalances[msg.sender] >= toFill * orders[i].price, "You don't have enough ETH to make trade");
                
                weiBalances[msg.sender] -= toFill * orders[i].price;
                weiBalances[orders[i].trader] += toFill * orders[i].price;

                balances[msg.sender][_ticker] += toFill;
                balances[orders[i].trader][_ticker] -= toFill;

            } else if (_side == Side.SELL) {
                
                require(weiBalances[orders[i].trader] >= toFill * orders[i].price, "LIMIT ORDER trader doesn't have enough ETH to make trade");
                
                weiBalances[msg.sender] += toFill * orders[i].price;
                weiBalances[orders[i].trader] -= toFill * orders[i].price;

                balances[msg.sender][_ticker] -= toFill;
                balances[orders[i].trader][_ticker] += toFill;

            }

            totalFilled += toFill;

            orders[i].amount = toFill;

        }
    
        // Removing filled orders
        while(orders.length > 0 && orders[0].amount == 0) { // Solidity first checks condition 1 then 2
            for (uint256 i = 0; i < orders.length-1; i++) {
                orders[i] = orders[i+1];
            }
            orders.pop();
        }

    }

    
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