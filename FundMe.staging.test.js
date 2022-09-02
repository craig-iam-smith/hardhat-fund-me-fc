const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
// const { describe, it } = require("node:test")

developmentChains.includes(network.name) 
    ? describe.skip
    : describe("FundMe", async function () {
        let fundMe
        let deployer
        const sendValue = ethers.utils.parseEther("0.1")

        beforeEach(async function () {
            // deploy fundMe contract
            // using Hadhat-deploy
            // const accounts = await ethers.getSigners()
            // const accountZero = accounts[0]
       
            deployer  = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe")
        })
        it("allows to fund and withdraw", async function() {
            const fundTxResponse = await fundMe.fund({ value: sendValue })
            await fundTxResponse.wait(1)
            const withdrawTxResponse = await fundMe.withdraw()
            await withdrawTxResponse.wait(1) 
            const endingBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            assert.equal(endingBalance.toString(), "0")
        })
    })
