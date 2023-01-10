const EthTx = require("ethereumjs-tx");
const Web3 = require("web3");
const daiExchangeAbi = require("./daiExchangeAbi.json"); // 合约Abi


// 合约地址
const daiExchangeAddress = "0x77dB9C915809e7BE439D2AB21032B1b8B58F6891";

const addressFrom = "0x494A93612a9654A4161fd5eBad4c1b8F30dB3D8E";  // 地址

const privKey = "bfbabfa55bd0daea367f9ab255f2b31b4c11053a0b0b933dfa4fbb2712c0c23b";  // 私钥

// 设置Web3
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/37faf2c74b5c48f6b5855f7e655d6cea")
);

// 实例化合约对象 - 通过address和abi
const daiExchangeContract = new web3.eth.Contract(daiExchangeAbi, daiExchangeAddress);

// 指定 以太币 数量
const ETH_SOLD = web3.utils.toHex(0.001 * 10 ** 18);



// 对合约中需要调用的函数，传入参数，并编码Abi
// 调用合约中的ethToTokenSwapInput方法，该方法需要两个参数：min_tokens和deadline。
// min_tokens参数指定购买的Dai的最小数量。
// deadline声明了交易的最后期限，意思是此交易只能在此时间之前执行。

const MIN_TOKENS = web3.utils.toHex(0.2 * 10 ** 18); // 0.2 DAI
const DEADLINE = Date.parse(new Date("2022/02/01 00:00:00")) / 1000; // unix 时间戳 - 以秒为单位
const exchangeEncodedABI = daiExchangeContract.methods.ethToTokenSwapInput(MIN_TOKENS, DEADLINE).encodeABI();


// 声明sendSignedTx函数 - 签名并广播到以太网络
const sendSignedTx = (TransactionObject, cb) => {

  let transaction = new EthTx(TransactionObject);  // new EthTx(transactionObject)
  const privateKey = new Buffer.from(privKey, "hex");
  transaction.sign(privateKey);
  const serializedEthTx = transaction.serialize().toString("hex");

  // 交易对象的包装：
  // 交易对象 = new EthTx(交易参数对象)
  // 交易对象.sign(new Buffer.from(privKey, "hex"))  // 私钥签名
  // 参数0 = '0x' + 交易对象.serialize().toString("hex")  // 交易对象转化为0x开头的加密字符串

  web3.eth.sendSignedTransaction(`0x${serializedEthTx}`, cb); // 实际的执行
}

// 从发起者账户获取交易编号，构造交易对象，并执行sendSignedTx函数
web3.eth.getTransactionCount(addressFrom).then(transactionNonce => {
  const transactionObject = {  // 交易参数对象
    chainId: 4,
    nonce: web3.utils.toHex(transactionNonce),
    gasLimit: web3.utils.toHex(6000000),
    gasPrice: web3.utils.toHex(10000),
    to: daiExchangeAddress,
    from: addressFrom,
    data: exchangeEncodedABI,
    value: ETH_SOLD
  }

  sendSignedTx(transactionObject, (error, result) => {  // 
    if (error) return console.log("error ===> ", error);
    console.log("sent ===> ", result);
  })
})






