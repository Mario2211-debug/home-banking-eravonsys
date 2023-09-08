"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentInfo = void 0;
class PaymentInfo {
    constructor(cardNumber, expirationDate, cvv) {
        this.cardNumber = cardNumber;
        this.expirationDate = expirationDate;
        this.cvv = cvv;
    }
}
exports.PaymentInfo = PaymentInfo;
