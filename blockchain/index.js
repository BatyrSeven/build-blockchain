const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    /**
     * Add new blocks to the chain
     * @param {Object} param An object with `data` field which contains an array of blocks to be added
     */
    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
    }

    /**
     * Replace the old chain with a new one
     * @param {Array} chain New chain
     * @param {Boolean} validateTransactions Flag to enable transactions validation (set `false` for tests only)
     * @param {Function} onSuccess Callback function on successful replacement
     */
    replaceChain(chain, validateTransactions, onSuccess) {
        if (this.chain.length >= chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        if (validateTransactions && !this.validTransactionData({ chain })) {
            console.error('The incoming chain has invalid transaction data');
            return;
        }

        if (onSuccess) onSuccess();
        
        console.log('replacing chain with', chain);
        this.chain = chain;
    }

    /**
     * Validate the transactions data of the passed chain
     * @param {Object} param An object with `chain` field which contains the Array of blocks to be validated
     */
    validTransactionData({ chain }) {
        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount++;

                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit');
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amonut is invalid');
                        return false;
                    }
                } else {
                    if (!Transaction.validate(transaction)) {
                        console.error('Invalid transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount');
                        return false;
                    }
                }

                if (transactionSet.has(transaction)) {
                    console.error('An identical transaction appears more than once in the block');
                    return false;
                }

                transactionSet.add(transaction);
            }
        }

        return true;
    }

    /**
     * Validation of a chain by hash and difficulty
     * @param {Array} chain Chain to be validated
     */
    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
            const actualHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            
            if (lastHash !== actualHash) {
                return false;
            }

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

            if (validatedHash !== hash) {
                return false;
            }

            if (Math.abs(difficulty - lastDifficulty) > 1) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Blockchain;