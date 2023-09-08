"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscribed = void 0;
const crypto_1 = require("crypto");
const utils_1 = require("../utils");
class Subscribed {
    constructor(userId, email, paymentInfo, name) {
        this.id = (0, crypto_1.randomUUID)();
        this.userId = userId;
        this.name = name === null || name === void 0 ? void 0 : name.trim();
        this.email = email;
        this.paymentInfo = paymentInfo;
        this.createdAt = (0, utils_1.currentDateAsUTCString)() || '';
        this.updatedAt = (0, utils_1.currentDateAsUTCString)() || '';
    }
}
exports.Subscribed = Subscribed;
