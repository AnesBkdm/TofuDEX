//npm install truffle-assertions
const Dex = artifacts.require("Dex");
const TestToken = artifacts.require("TestToken");
const truffleAssert = require("truffle-assertions");

contract("Dex", accounts => {
    it("should only be possible for owner to add tokens", async () => {
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();

        await truffleAssert.passes(
            dex.addToken(web3.utils.fromUtf8("TST"), tst.address, {from: accounts[0]})
        );

        await truffleAssert.reverts(
            dex.addToken(web3.utils.fromUtf8("TST"), tst.address, {from: accounts[1]})
        );
    })

    it("should handle deposits correctly", async () => {
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();

        await tst.approve(dex.address, 5000);
        await dex.depositToken(1000, web3.utils.fromUtf8("TST"));
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("TST"));
        assert.equal(balance.toNumber(),1000);
    })

    it("should handle faulty withdrawals correctly", async () => {
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();

        await truffleAssert.reverts(
            dex.withdraw(356487, web3.utils.fromUtf8("TST"))
        );
    })

    it("should handle correct withdrawals correctly", async () => {
        let dex = await Dex.deployed();
        let tst = await TestToken.deployed();
        await truffleAssert.passes(
            dex.withdraw(100, web3.utils.fromUtf8("TST"))
        );
    })
})