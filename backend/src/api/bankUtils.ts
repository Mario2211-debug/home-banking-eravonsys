import { currentDateAsUTCString } from '../utils';
import { db, Schema } from '../database';
import { IMovementList } from '../model/movementList';
import { IWallet } from '../model/wallet';
import { IUser, User } from '../model/user';

/**
 * Updates the given MovementList in the database
 * Requires db to have been read before
 * @param walletMovementList movementList to update
 */
export function updateMovementList(walletMovementList: IMovementList) {
    walletMovementList.updatedAt = currentDateAsUTCString();
    const movementListIndex = (<Schema>db.data).movementLists.findIndex(
        (temp) => temp.id === walletMovementList.id
    );
    (<Schema>db.data).movementLists[movementListIndex] = walletMovementList;
}

/**
 * Updates the given wallet in the database
 * Requires db to have been read before
 * @param wallet wallet to update
 */
export function updateWallet(wallet: IWallet) {
    wallet.updatedAt = currentDateAsUTCString();
    const walletIndex = (<Schema>db.data).wallets.findIndex(
        (temp) => temp.id === wallet.id
    );
    (<Schema>db.data).wallets[walletIndex] = wallet;
}

export function updateSubscriptionStatus(user: IUser) {
    user.isSubscribed = true;
    const userIndex = (<Schema>db.data).users.findIndex(
        (u) => u.id === user.id
    );
if(userIndex !== -1){
    (<Schema>db.data).users[userIndex].isSubscribed = true;
}
}