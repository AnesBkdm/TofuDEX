const Dex = artifacts.require("Dex");
const TestToken = artifacts.require("TestToken");
const truffleAssert = require("truffle-assertions");

contract("Dex", accounts => {
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
        await dex.deposit(1000, web3.utils.fromUtf8("TST"));

        await truffleAssert.passes(
            dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 10, 20, {from: accounts[0]})
        );
    })

    it("should be that BUY orders are ORDERED (lol) from highest to lowest", async() => {
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();

        dex.createLimitOrder(0, web3.utils.fromUtf8("TST"), 10, 20, {from: accounts[0]});
        dex.createLimitOrder(0, web3.utils.fromUtf8("TST"), 3, 40, {from: accounts[0]});
        dex.createLimitOrder(0, web3.utils.fromUtf8("TST"), 5, 15, {from: accounts[0]});

        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("TST"), 0);
        assert(orderBook.length > 0);

        for (let i = 0; i < orderBook.length - 1; i++){
            assert(orderBook[i].price >= orderBook[i+1].price, "Unordered BUY price in order book");
        }
    })

    it("should be that SELL orders are ORDERED (lol) from lowest to highest", async() => {
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();

        dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 5, 32, {from: accounts[0]});
        dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 3, 58, {from: accounts[0]});
        dex.createLimitOrder(1, web3.utils.fromUtf8("TST"), 5, 22, {from: accounts[0]});

        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("TST"), 0);
        assert(orderBook.length > 0);

        console.log(orderBook);
        
        for (let i = 0; i < orderBook.length - 1; i++){
            assert(orderBook[i].price <= orderBook[i+1].price, "Unordered SELL price in order book");
        }

        console.log(orderBook);
    })
})
