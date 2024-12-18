const {network}=require("hardhat")
const {developmentChains,DECIMALS,INITIAL_ANSWER}=require("../helper-hardhat-config")

module.exports=async({getNamedAccounts, deployments})=>{
    const {deploy, log}= deployments
    const {deployer}= await getNamedAccounts()
    const chainId = network.config.chainId.toString()
    
    //includes  用于检查数组中是否包含特定的元素
    if(developmentChains.includes(network.name)){
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks Deployed!")
        log("------------------------------------------------")
    }
}

//只运行这个文件的意思
module.exports.tags=["all","mocks"]