"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalMovement = void 0;
const crypto_1 = require("crypto");
const utils_1 = require("../utils");
class InternalMovement {
    constructor(transactionValue, newWalletValue, description) {
        this.description = "No description provided";
        this.id = (0, crypto_1.randomUUID)();
        this.createdAt = (0, utils_1.currentDateAsUTCString)();
        this.transactionValue = transactionValue;
        this.newWalletValue = newWalletValue;
        this.description = description !== null && description !== void 0 ? description : this.description;
    }
}
exports.InternalMovement = InternalMovement;
