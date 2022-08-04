// import
// 

const { network } = require("hardhat")

// async function deployFunc() {
//     console.log("Hi!")
// }

// module.exports.default = deployFunc
const { networkConfig } = require("../helper-hardhat-config")
const helperConfig = require("../helper-hardhat-config")
const { developmentChains, DECIMALS, INITIAL_ANSWER } 
    = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// const networkConfig = helperConfig.networkConfig



//module.exports = async(hre) => {
//    const { getNamedAccounts, deployments } = hre
//}
module.exports = async({ getNamedAccounts, deployments }) => { 
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

//    const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
// if chainId is X 
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
            // verify
        await verify(fundMe.address, args)

    }
    
    log("---------------------------------------")
    
}


// const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

module.exports.tags = ["all", "fundme"]