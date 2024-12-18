const { run } = require("hardhat")

async function verify(contractAddress,args) {
    console.log("Verifying contract...")
      //在我们的代码中 可以使用"run"包来运行Hardhat中的所有任务
      //并且Hardhat运行在run中添加不同的参数
  
      //verify:verify 是一个任务，它接受两个参数，第一个参数是合约地址，第二个参数是合约构造函数的参数
      //验证工具需要这些参数来确保它正在验证与部署时相同的合约实例
      //验证工具（如 Hardhat 的 verify 插件）需要知道要验证哪个合约，因此必须提供合约的地址。
      try{
      await run("verify:verify",{
          address:contractAddress,
          constructorArguments:args
      })
    }catch(e){
      if(e.message.toLowerCase().includes(" already verified")){
          console.log("合约已经验证过了")
      }else{
          console.log(e)
      }
    }
  }

module.exports = { verify }
