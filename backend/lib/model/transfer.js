"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = void 0;
const internalMovement_1 = require("./internalMovement");
class Transfer extends internalMovement_1.InternalMovement {
    constructor(originWalletId, recipientWalletId, transactionValue, newWalletValue, recipientData, type) {
        var _a;
        super(transactionValue, newWalletValue, (_a = recipientData === null || recipientData === void 0 ? void 0 : recipientData.description) === null || _a === void 0 ? void 0 : _a.trim());
        this.originWalletId = originWalletId;
        this.recipientWalletId = recipientWalletId;
        this.recipientEmail = recipientData === null || recipientData === void 0 ? void 0 : recipientData.recipientEmail;
        this.recipientName = recipientData === null || recipientData === void 0 ? void 0 : recipientData.recipientName;
        this.type = type;
    }
}
exports.Transfer = Transfer;
