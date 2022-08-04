// const { assert } = require("console")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
// const { it } = require("node:test")
// const { describe, it } = require("node:test")
// const { describe } = require("node:test")
!developmentChains.includes(network.name) 
    ? describe.skip
    : describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function () {
        // deploy fundMe contract
        // using Hadhat-deploy
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]
       
        deployer  = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe")
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })

    describe("constructor", async function () {
        it("sets the aggregator addresses", async function (){
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("update amount funded data structure", async function () {
            await fundMe.fund({value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal( sendValue.toString(), response.toString())
        })
 //       it("Adds funder to array of funders", async function () {
 //           await fundMe.fund({value: sendValue })
 //           const funder = await fundMe.getFunder[0]
 //                   assert.equal( deployer, funder)

 //       })
    })
    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async function () {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
                )
            // gasCost
            //Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingDeployerBalance.add(startingFundMeBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            ) 
        })
        it("withdraw ETH from multiple funder", async function () {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({value:sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
            )
            
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            //Assert
            assert.equal(endingFundMeBalance, 0)
//            assert.equal(
//                startingDeployerBalance.add(startingFundMeBalance).toString(),
//                endingDeployerBalance.add(gasCost).toString()
//            ) 
            for (i = 1; i < 6; i++) {
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
            }

        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const notOwner = accounts[1]
            const fundMeConnectedContract = await fundMe.connect(notOwner)
            await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
                "FundMe__NotOwner"
            )
        })
    })
 
})