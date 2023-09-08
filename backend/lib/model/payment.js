"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const internalMovement_1 = require("./internalMovement");
class Payment extends internalMovement_1.InternalMovement {
    constructor(entity, reference, transactionValue, newWalletValue, description) {
        super(transactionValue, newWalletValue, description);
        this.entity = entity;
        this.reference = reference;
    }
}
exports.Payment = Payment;
