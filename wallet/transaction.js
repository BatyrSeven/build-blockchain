const uuidv1 = require('uuid/v1');
const { verifySignature } = require('../util');

class Transaction {
    constructor({ senderWallet, recipient, amount }) {
        this.id = uuidv1();
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
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
}

module.exports = Transaction;