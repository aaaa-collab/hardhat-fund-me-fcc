const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { config } = require("process")
const { assert ,expect} = require("chai");


describe("FundMe",async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue=ethers.utils.parseEther("1") //将1 ether转为1000000000000000000

    beforeEach(async function(){
        //使用hardhat-deploy部署合约 如果使用hardhat-deploy部署合约  会部署其它的内容 所以要指定文件
        //如果运行await deployments.fixture("all")，会自动部署所有部署文件中的合约，在本地网络中运行部署脚本   调用 deployments.fixture() 来重新部署所有标签为 "all" 的部署脚本
        
        //方法1：获取账户
        const deployer = (await getNamedAccounts()).deployer

        //方法2：获取账户
        // const accounts=await ethers.getSigners()
        // const accountZero=account[0]

        //总之 可以直接部署deploy文件夹里的所有内容
        await deployments.fixture("all")  //部署所有脚本

        //getContract函数将获取我们告诉它的任意合约的最新部署
        //为我们提供最新部署的FundMe合约

        console.log("-----------------",ethers)
        //每次调用FundMe合约的时候 都会自动连接到deployer账户
        fundMe = await ethers.getContract("FundMe",deployer)
        
        mockV3Aggregator=await ethers.getContract("MockV3Aggregator",deployer)
    })

    describe("constructor",async function(){
        it("sets the aggregator addresses correctly",async function(){
            const response = await fundMe.PriceFeed()
            assert.equal(response,mockV3Aggregator.target)
        })
    })

    describe("fund",async function(){
        it("Fails if you don't send enough ETH",async function(){
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })
        it("updated the amount funded data structure",async function(){
            await fundMe.fund({value:sendValue})
            const response=await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(),sendValue.toString())
        })
        it("Adds funder to array of funders",async function(){
            await fundMe.fund({value:sendValue})
            const funder=await fundMe.funders(0)
            assert.equal(funder,deployer)
        })  
    })


    describe("withdraw",async function(){
        beforeEach(async function(){
            await fundMe.fund({value:sendValue})//在测试之前先给里面存钱 要不然没办法进行这一步的测试
        })
        it("withdraw ETH from single founder",async function(){
            //这个测试比较长  将它设置为
            // Arrange 设置这个测试，确保我们从单个资助者处正确的提取以太币
            // Arrange Act Assert 只是一种编写测试的思路  需要先准备测试  接着执行测试  然后进行断言
             
            //获取"fundMe"合约的初始余额
            const startingFundMeBalance=await fundMe.provider.getBalance(fundMe.address)


            //deployer的初始余额
            const startingDeployerBalance=await fundMe.provider.getBalance(deployer)


            // Act  搞清楚怎么从交易中获取gasCost 
            const transactionResponse=await fundMe.withdraw()
            const transactionReceipt=await transactionResponse.wait(1)
            const {gasUsed,effectiveGasPrice}=transactionReceipt
            const GasCost=gasUsed.mul(effectiveGasPrice)
            
            const endingFundMeBalance=await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance=await fundMe.provider.getBalance(deployer)

            // Assert
            assert.equal(endingFundMeBalance,0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance),endingDeployerBalance.add(GasCost.toString))

        })


        //存在多个资助者时提取以太币的情况
        it("allows us to withdraw with multiple funders",async function(){
            //首先需要有一大堆账户  让这里面的每一个账户都调用fund函数 需要写一个for循环
            const accounts=await ethers.getSigners()
            //从账户1开始  账户0是部署者
            for(i=1;i<accounts.length;i++){
                const fundMEConnectedContract=await fundMe.connect(account[i])
            }
            //让每一个账户去调用fund方法
            await fundMEConnectedContract.fund({value:sendValue})
            //获取"fundMe"合约的初始余额
            const startingFundMeBalance=await fundMe.provider.getBalance(fundMe.address)

            //deployer的初始余额
            const startingDeployerBalance=await fundMe.provider.getBalance(deployer)

            //调用提取方法 
            const transactionResponse=await fundMe.withdraw()
            const transactionReceipt=await transactionResponse.wait(1)
            const {gasUsed,effectiveGasPrice}=transactionReceipt
            const GasCost=gasUsed.mul(effectiveGasPrice)
            
            const endingFundMeBalance=await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance=await fundMe.provider.getBalance(deployer)

            // Assert
            assert.equal(endingFundMeBalance,0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance),endingDeployerBalance.add(GasCost.toString))


            //希望funders可以正确重置
            //await expect(fundMe.funders(0)).to.be.reverted; 
            // 的目的是测试：如果尝试访问 funders 数组的第 0 个元素（即索引为 0 的地址）时，
            // 是否会触发回滚（revert）
            await expect(fundMe.funders(0)).to.be.reverted

            for(i=1;i<6;i++){
                assert.equal(
                    await fundMe.addressToAmountFunded(accounts[i].address),
                    0
                )
            }
        }) 


        //测试是不是只有合约拥有者能够调用withdraw函数 提取资金
        it("only allows the owner to withdraw",async function(){
            const accounts=await ethers.getSigners()
            const attacker=accounts[1]//假设第一个账户将成为一个随机的攻击者
            //需要把这个账户连接到一个新的合约上
            //connect 是 ethers.Contract 对象提供的一个方法，目的是 改变合约的调用者（即连接的账户）。
            // 在默认情况下，合约与部署它的账户（通常是测试中第一个账户）连接。
            const attackerConnectedContract=await fundMe.connect(attacker)
            expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")
        })
    })

})