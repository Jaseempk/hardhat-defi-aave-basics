const { ethers, getNamedAccounts } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");

async function main() {
    await getWeth();
    const { deployer } = await getNamedAccounts();
    const lendingPool = await getLendingPool(deployer);
    console.log(`LendingPool address:${lendingPool.address}`);
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    await erc20Approval(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log("depositing...");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("deposited..");
    let { totalCollateralETH, availableBorrowsETH } = await getBorrowUserData(
        lendingPool,
        deployer
    );
    const daiPrice = await getDaiPrice();
    const daiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
    console.log(`you can borrow ${daiToBorrow} DAI`);
    const daiToBorrowWei = await ethers.utils.parseEther(daiToBorrow.toString());
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    await daiBorrow(daiTokenAddress, lendingPool, daiToBorrowWei, deployer);
    await getBorrowUserData(lendingPool, deployer);
    await repay(daiTokenAddress, daiToBorrowWei, lendingPool, 1, deployer);
    await getBorrowUserData(lendingPool, deployer);
}
async function repay(daiAddress, amount, lendingPool, rateMode, account) {
    await erc20Approval(daiAddress, lendingPool.address, amount, account);

    const tx = await lendingPool.repay(daiAddress, amount, rateMode, account);
    await tx.wait(1);
    console.log("repaid..");
}
//5
async function daiBorrow(daiAddress, lendingPool, daiToBorrowWei, account) {
    const borrowtx = await lendingPool.borrow(daiAddress, daiToBorrowWei, 1, 0, account);
    await borrowtx.wait(1);
    console.log("you have borrowed");
}
//4
async function getDaiPrice() {
    const daiEthPrice = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616e4d11a78f511299002da57a0a94577f1f4"
    );
    const price = (await daiEthPrice.latestRoundData())[1];
    console.log(`this the DAi/ETH price:${price}`);
    return price;
}
//3
async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, availableBorrowsETH, totalDebtETH } =
        await lendingPool.getUserAccountData(account);
    console.log(`your have ${totalCollateralETH} depositted`);
    console.log(`you have borrowed ${totalDebtETH} ETH`);
    console.log(`you can borrow ${availableBorrowsETH} of ETH`);
    return { totalCollateralETH, availableBorrowsETH };
}
//1
async function getLendingPool(account) {
    //0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5:LendingPoolAddressesProvider
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    );
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);
    return lendingPool;
}
//2
async function erc20Approval(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account);
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("approved...");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
