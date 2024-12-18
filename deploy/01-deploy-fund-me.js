//1.import

//写法1
// function deployFunc(){
//     console.log("deploying")
// }
//导出
//module.exports.default= deployFunc()


//写法2
//每当我们运行部署脚本时，hardhat-deploy都会自动调用这个函数 并将hardhat对象传递给它
// module.exports=async(hre)=>{
//     //hre就是hardhat运行环境  
//     //这个语法就是从hre中解构出我们需要的变量和函数  =hre.getNamedAccounts和hre.deployments
//     const {getNamedAccounts, deployments}= hre
// }


const {networkConfig, developmentChains}=require("../helper-hardhat-config");
//=const helperConfig=require("../helper-hardhat-config");
//const networkConfig=helperConfig.networkConfig
const {network}=require("hardhat")
const {verify}=require("../utils/verify")

//写法3 换在一行里写
module.exports=async({getNamedAccounts, deployments})=>{
    const {deploy, log}= deployments
    const {deployer}= await getNamedAccounts()
    const chainId = network.config.chainId.toString()
    //当使用本地主机或"Hardhat Network"时，我们需要使用mock  修改合约

    //我们需要根据不同的链ID来决定使用哪个priceFeedAddress
    //要实现这个功能需要用到aave的库
    let ethUsdPriceFeedAddress
    if(developmentChains.includes(network.name)){
        //在使用hardhat deploy情况下 我们可以使用get命令来获取近期的部署
        const ethUsdPriceAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress=ethUsdPriceAggregator.address
    }else{
        //networkConfig 是一个对象，chainId 是一个变量，它的值将被用作 networkConfig 对象属性的键。
        // "ethUsdPriceFeed" 是另一个键，用于访问嵌套在 networkConfig[chainId] 对象中的属性。
        // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
        ethUsdPriceFeedAddress=networkConfig[chainId]["ethUsdPriceFeedAddress"]
        //ethUsdPriceFeedAddress="0x694AA1769357215DE4FAC081bf1f309aDC325306"
        console.log(ethUsdPriceFeedAddress)
    }
    const args=[ethUsdPriceFeedAddress]
    //以及覆盖选项的列表
    const fundMe=await deploy("FundMe",{
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,//自定义日志
        waitConfirmations: network.config.blockConfirmations || 1,//自定义确认数
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        //进行验证  不再把验证放在脚本里  创建一个新的文件夹
        await verify(fundMe.target,args)
    }
    log("------------------------------------")


}

module.exports.tags=["all","fundme"]
//hardhat-deploy不需要下面这两步
//2.main function
//3.main()  calling of main function