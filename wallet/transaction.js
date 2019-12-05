const uuidv1 = require('uuid/v1');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Transaction {
    constructor({ senderWallet, recipient, amount, outputMap, input }) {
        this.id = uuidv1();
        this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
        this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount

        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        const input = {};

        input.timestamp = Date.now();
        input.amount = senderWallet.balance;
        input.address = senderWallet.publicKey;
        input.signature = senderWallet.sign(outputMap);

        return input;
    }

    update({ senderWallet, recipient, amount  }) {
        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }

        if (this.outputMap[recipient]) {
            this.outputMap[recipient] += amount;
        } else {
            this.outputMap[recipient] = amount;
        }

        this.outputMap[senderWallet.publicKey] -= amount;
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    static validate(transaction) {
        const { input: { address, amount, signature }, outputMap } = transaction;

        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);

        if (amount !== outputTotal) {
            console.error(`Invalid transactoin from ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }

        return true;
    }

    static rewardTransaction({ minerWallet }) {
        return new this({
            input: REWARD_INPUT,
            outputMap: {
                [minerWallet.publicKey]: MINING_REWARD
            }
        });
    }
}

module.exports = Transaction;