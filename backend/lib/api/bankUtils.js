"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionStatus = exports.updateWallet = exports.updateMovementList = void 0;
const utils_1 = require("../utils");
const database_1 = require("../database");
/**
 * Updates the given MovementList in the database
 * Requires db to have been read before
 * @param walletMovementList movementList to update
 */
function updateMovementList(walletMovementList) {
    walletMovementList.updatedAt = (0, utils_1.currentDateAsUTCString)();
    const movementListIndex = database_1.db.data.movementLists.findIndex((temp) => temp.id === walletMovementList.id);
    database_1.db.data.movementLists[movementListIndex] = walletMovementList;
}
exports.updateMovementList = updateMovementList;
/**
 * Updates the given wallet in the database
 * Requires db to have been read before
 * @param wallet wallet to update
 */
function updateWallet(wallet) {
    wallet.updatedAt = (0, utils_1.currentDateAsUTCString)();
    const walletIndex = database_1.db.data.wallets.findIndex((temp) => temp.id === wallet.id);
    database_1.db.data.wallets[walletIndex] = wallet;
}
exports.updateWallet = updateWallet;
function updateSubscriptionStatus(user) {
    user.isSubscribed = true;
    const userIndex = database_1.db.data.users.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
        database_1.db.data.users[userIndex].isSubscribed = true;
    }
}
exports.updateSubscriptionStatus = updateSubscriptionStatus;
