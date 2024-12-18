//进行网络配置  跟踪不同喂价数据在不同链上的不同合约地址
 const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
 }
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000
module.exports = {
    networkConfig,developmentChains,DECIMALS,INITIAL_ANSWER
} 