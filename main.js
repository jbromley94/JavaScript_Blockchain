const SHA256 = require("crypto-js/sha256")

class Block {
  constructor( timestamp, transactions, previousHash = '') {
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.previousHash = "0";
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + this.nonce + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("BLOCK MINED: " + this.hash);
  }
}

class Transaction{
  constructor(fromAddress, toAddress, amount){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesis()]
    this.difficulty = 2;
    //storage for trans Btween block creation
    this.pendingTransactions = [];
    //Amt of coins a miner will get as reward for efforts
    this.miningReward = 100;
  }
  createGenesis() {
    return new Block(0, "01/01/2018", "Genesis block", '0')
  }
  latestBlock() {
    return this.chain[this.chain.length - 1]
  }
  createTransaction(transaction){
    this.pendingTransactions.push(transaction)
  }
  minePendingTransactions(miningRewardAddress){
    //create block with all oending trans and then mine:
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);
    //add newly mined to the chain:
    this.chain.push(block);
    //reset pending trans and send reward to miner:
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }
  getBalanceOfAddress(address) {
    let balance = 0;

    // Loop over each block and each transaction inside the block
    for (const block of this.chain) {
      for (const trans of block.transactions) {

        // If the given address is the sender -> reduce the balance
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        // If the given address is the receiver -> increase the balance
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }
  checkValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true
  }
}

let savjeeCoin = new Blockchain();

console.log('Creating some transactions...');
savjeeCoin.createTransaction(new Transaction('address1', 'address2', 100));
savjeeCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('Starting the miner...');
savjeeCoin.minePendingTransactions('xaviers-address');
console.log('Balance of Xaviers address is', savjeeCoin.getBalanceOfAddress('xaviers-address'));
console.log('Starting the miner again!');
savjeeCoin.minePendingTransactions("xaviers-address");
console.log('Balance of Xaviers address is', savjeeCoin.getBalanceOfAddress('xaviers-address'));
console.log('Starting the miner again!');
savjeeCoin.minePendingTransactions("xaviers-address");
console.log('Balance of Xaviers address is', savjeeCoin.getBalanceOfAddress('xaviers-address'));