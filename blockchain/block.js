const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } = require('../util');


class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    /**
     * Used to generate the first block in a chain with `GENESIS_DATA`
     */
    static genesis() {
        return new this(GENESIS_DATA);
    }

    /**
     * Proof of work which is done to find a valid hash to add a new block
     * @param {Object} param0 An object with params:
     *   `lastBlock` - Last block in the chain which is used for hash and difficulty calculation
     *   `data` - Data of a new block to be mined
     */
    static mineBlock({ lastBlock, data }) {
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;
        let hash, timestamp;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({
                originalBlock: lastBlock,
                timestamp
            });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({ timestamp, lastHash, data, difficulty, nonce, hash });
    }

    /**
     * Used to increase the difficulty (expensiveness of computations) to prevent 51% attack
     * @param {Object} param0 An object with params:
     *   `originalBlock` - An original block used for difficulty calculation
     *   `timestamp` - current timestamp to calculate mine rate
     */
    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock;

        if (difficulty < 1) {
            return 1;
        }

        if ((timestamp - originalBlock.timestamp) > MINE_RATE) {
            return difficulty - 1;
        }

        return difficulty + 1;
    }
}

module.exports = Block;