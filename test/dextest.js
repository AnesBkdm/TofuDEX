const Dex = artifacts.require("Dex");
const TestToken = artifacts.require("TestToken");
const truffleAssert = require("truffle-assertions");

contract("LimitOrder", accounts => {
    it("should be only possible to BUY if user has enough ETH", async() => {
        
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();

        // BUY = 0
        await truffleAssert.reverts(
            dex.createLimitOrder(0, web3.utils.fromUtf8("TST"), 10, 20, {from: accounts[0]})
        );

        await dex.depositWei({value:3000});

        await truffleAssert.passes(
            dex.createLimitOrder(0, web3.utils.fromUtf8("TST"), 10, 20, {from: accounts[0]})
        )
    })

    it("should be only possible to SELL if user has enough TOKEN", async() => {
        
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();

        dex.addToken(web3.utils.fromUtf8("TST"), tst.address, {from: accounts[0]});

        await truffleAssert.reverts(
            dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 10, 20, {from: accounts[0]})
        );

        await tst.approve(dex.address, 1000);
        await dex.depositToken(1000, web3.utils.fromUtf8("TST"));

        await truffleAssert.passes(
            dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 10, 20, {from: accounts[0]})
        );
    })

    it("should be that BUY orders are ORDERED from highest to lowest", async() => {
        
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();
        await tst.approve(dex.address, 1000);
        await dex.createLimitOrder(0, web3.utils.fromUtf8("TST"), 10, 20, {from: accounts[0]});
        await dex.createLimitOrder(0, web3.utils.fromUtf8("TST"), 3, 40, {from: accounts[0]});
        await dex.createLimitOrder(0, web3.utils.fromUtf8("TST"), 5, 15, {from: accounts[0]});
        
        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("TST"), 0);
        assert(orderBook.length > 0);

        console.log(orderBook);

        for (let i = 0; i < orderBook.length - 1; i++){
            await console.log(orderBook[i].price); 
        }

        for (let i = 0; i < orderBook.length - 1; i++){
            assert(orderBook[i].price >= orderBook[i+1].price, "Unordered BUY price in order book");
        }
    })

    it("should be that SELL orders are ORDERED from lowest to highest", async() => {
        
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();
        
        await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 200, {from: accounts[0]});
        await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 800, {from: accounts[0]});
        await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 400, {from: accounts[0]});

        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("TST"), 1);
        assert(orderBook.length > 0);

        for (let i = 0; i < orderBook.length - 1; i++){
            await console.log(orderBook[i].price); 
        }

        for (let i = 0; i < orderBook.length - 1; i++){
            assert(orderBook[i].price <= orderBook[i+1].price, "Unordered SELL price in order book");
        }

    })

    contract("MarketOrder", accounts => {
        it("Seller should have enough tokens when creating the SELL MARKET order for trading", async() => {
            
            let dex = await Dex.deployed();
            let tst = await TestToken.deployed();

            await tst.approve(dex.address, 1000);
            await dex.addToken(web3.utils.fromUtf8("TST"), tst.address, {from: accounts[0]});
            await dex.depositToken(1000, web3.utils.fromUtf8("TST"));
            await dex.depositWei({value:3000});

            await truffleAssert.reverts(
                dex.createMarketOrder(1, web3.utils.fromUtf8("TST"), 2000, {from: accounts[0]})
            )

            await truffleAssert.passes(
                dex.createMarketOrder(1, web3.utils.fromUtf8("TST"), 1000, {from: accounts[0]})
            )

        })
    
        it("Seller should have enough ETH when creating the BUY MARKET order for trading", async() => {

            await truffleAssert.reverts(
                dex.createMarketOrder(0, web3.utils.fromUtf8("TST"), 4000, {from: accounts[0]})
            )

            await truffleAssert.passes(
                dex.createMarketOrder(0, web3.utils.fromUtf8("TST"), 1000, {from: accounts[0]})
            )
        })
    
        it("should be possible to submit orders even when the order book is empty", async() => {
            await Dex.emptyOrderBook(0, web3.utils.fromUtf8("TST"));
            await Dex.emptyOrderBook(1, web3.utils.fromUtf8("TST"));

            await truffleAssert.passes(
                dex.createMarketOrder(0, web3.utils.fromUtf8("TST"), 1000, {from: accounts[0]})
            )

            await truffleAssert.passes(
                dex.createMarketOrder(1, web3.utils.fromUtf8("TST"), 1000, {from: accounts[0]})
            )
        })
    
        it("MARKET orders should not fill more limit orders than the market order amount", async() => {
            
            await Dex.emptyOrderBook(0, web3.utils.fromUtf8("TST"));
            await Dex.emptyOrderBook(1, web3.utils.fromUtf8("TST"));

            await tst.approve(dex.address, 1000, {from: accounts[1]});

            await dex.depositToken(1000, web3.utils.fromUtf8("TST"),{from: accounts[1]});
            await dex.depositWei({from: accounts[1], value:3000});
            
            await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 200, {from: accounts[1]});
            await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 800, {from: accounts[1]});
            await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 400, {from: accounts[1]});

            dex.createMarketOrder(1, web3.utils.fromUtf8("TST"), 10, {from: accounts[0]});

            let orderBook = await dex.orderBook(1, web3.utils.fromUtf8("TST"));

            assert(orderBook[0].amount != 0);

            await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 7, 200, {from: accounts[1]});

            assert(orderBook[0].amount == 0);

        })
    
        it("ETH balance of the buyer should decrease with the filled amount", async() => {

            let balance1 = await dex.weiBalances(accounts[0]);

            await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 400, {from: accounts[1]});
            dex.createMarketOrder(1, web3.utils.fromUtf8("TST"), 1, {from: accounts[0]});

            let balance2 = await dex.weiBalances(accounts[0]);

            assert(balance1>balance2);

        })
    
        it("Token balance of the limit order sellers should decrease with the filled amounts", async() => {
            
            await Dex.emptyOrderBook(0, web3.utils.fromUtf8("TST"));
            await Dex.emptyOrderBook(1, web3.utils.fromUtf8("TST"));

            let balance3 = await dex.balances(accounts[1]);

            await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 500, {from: accounts[1]});
            dex.createMarketOrder(1, web3.utils.fromUtf8("TST"), 1, {from: accounts[0]});

            let balance4 = await dex.balances(accounts[1]);

            assert(balance3>balance4);

        })
    
        it("Filled limit orders should be removed from the orderbook", async() => {

            await Dex.emptyOrderBook(0, web3.utils.fromUtf8("TST"));
            await Dex.emptyOrderBook(1, web3.utils.fromUtf8("TST"));

            await dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 1, 500, {from: accounts[1]});
            dex.createMarketOrder(1, web3.utils.fromUtf8("TST"), 1, {from: accounts[0]});

            let orderBook = await dex.balances(accounts[1]);

            assert(orderBook == 0);

        })
    })
})
