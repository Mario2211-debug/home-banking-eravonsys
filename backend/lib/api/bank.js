"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTransfer = exports.checkSubscription = exports.subscribe = exports.makePayment = exports.getPayments = exports.getTransfers = exports.getInternalMovements = exports.getMovements = exports.removeFunds = exports.addFunds = exports.getFunds = void 0;
const database_1 = require("../database");
const utils_1 = require("../utils");
const internalMovement_1 = require("../model/internalMovement");
const payment_1 = require("../model/payment");
const bankUtils_1 = require("./bankUtils");
const transfer_1 = require("../model/transfer");
const subscribe_1 = require("../model/subscribe");
/**
 * <p>Route | GET:funds</p>
 * <p>Gets user's wallet</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'wallet' property
 */
function getFunds(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const wallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
        if (!wallet) {
            return h.response({ feedback: 'Wallet not found' }).code(404);
        }
        return h.response({ feedback: 'Wallet found', wallet: wallet }).code(200);
    });
}
exports.getFunds = getFunds;
/**
 * <p>Route | PUT:funds</p>
 * <p>Adds funds to user's wallet</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'funds' property with the new wallet funds
 */
function addFunds(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        const transactionValue = (0, utils_1.setDecimalPlaces)(request.payload.funds);
        if (parseFloat(transactionValue) <= 0 ||
            isNaN(parseFloat(transactionValue))) {
            return h.response({ feedback: 'Invalid transaction value' }).code(400);
        }
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const wallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
        if (!wallet) {
            return h.response({ feedback: 'Wallet not found' }).code(404);
        }
        wallet.funds = (0, utils_1.addValues)(wallet.funds, transactionValue);
        const walletMovementList = database_1.db.data.movementLists.find((list) => list.walletId === wallet.id);
        if (!walletMovementList) {
            return h.response({ feedback: 'Movement list not found' }).code(404);
        }
        walletMovementList.internalMovements.unshift(new internalMovement_1.InternalMovement(transactionValue, wallet.funds, 'Deposited funds'));
        (0, bankUtils_1.updateWallet)(wallet);
        (0, bankUtils_1.updateMovementList)(walletMovementList);
        yield database_1.db.write(); //Required to write to database
        return h
            .response({ feedback: 'Added funds', funds: wallet.funds })
            .code(200);
    });
}
exports.addFunds = addFunds;
/**
 * <p>Route | DELETE:funds?{funds}</p>
 * <p>Removes funds to user's wallet</p>
 * <p>User is identified using JWT token credentials and value is passed as route query</p>
 *
 * @returns 'feedback' property and, if successful, 'funds' property with the new wallet funds
 */
function removeFunds(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        const transactionValue = (0, utils_1.setDecimalPlaces)(request.query.funds);
        if (parseFloat(transactionValue) <= 0 ||
            isNaN(parseFloat(transactionValue))) {
            return h.response({ feedback: 'Invalid transaction value' }).code(400);
        }
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const wallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
        if (!wallet) {
            return h.response({ feedback: 'Wallet not found' }).code(404);
        }
        wallet.funds = (0, utils_1.addValues)(wallet.funds, -transactionValue);
        if (parseFloat(wallet.funds) < 0) {
            return h.response({ feedback: 'Not enough funds' }).code(401);
        }
        const walletMovementList = database_1.db.data.movementLists.find((list) => list.walletId === wallet.id);
        if (!walletMovementList) {
            return h.response({ feedback: 'Movement list not found' }).code(404);
        }
        walletMovementList.internalMovements.unshift(new internalMovement_1.InternalMovement((0, utils_1.setDecimalPlaces)('-' + transactionValue), wallet.funds, 'Withdrew funds'));
        (0, bankUtils_1.updateWallet)(wallet);
        (0, bankUtils_1.updateMovementList)(walletMovementList);
        yield database_1.db.write(); //Required to write to database
        return h
            .response({ feedback: 'Removed funds', funds: wallet.funds })
            .code(200);
    });
}
exports.removeFunds = removeFunds;
/**
 * <p>Route | GET:movements</p>
 * <p>Gets all of user's movements, this includes internal movements, transfers and payments</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'movementList' property with the movement list
 */
function getMovements(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const wallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
        if (!wallet) {
            return h.response({ feedback: 'Wallet not found' }).code(404);
        }
        const movementList = database_1.db.data.movementLists.find((list) => list.walletId === wallet.id);
        if (!movementList) {
            return h.response({ feedback: 'Movement list not found' }).code(404);
        }
        return h
            .response({
            feedback: 'Movement list found',
            movementList: movementList,
        })
            .code(200);
    });
}
exports.getMovements = getMovements;
/**
 * <p>Route | GET:internalMovements</p>
 * <p>Gets all of user's internal movements</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'internalMovements' property with the internal movements
 */
function getInternalMovements(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const wallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
        if (!wallet) {
            return h.response({ feedback: 'Wallet not found' }).code(404);
        }
        const movementList = database_1.db.data.movementLists.find((list) => list.walletId === wallet.id);
        if (!movementList) {
            return h.response({ feedback: 'Movement list not found' }).code(404);
        }
        return h
            .response({
            feedback: 'Internal movements found',
            internalMovements: movementList.internalMovements,
        })
            .code(200);
    });
}
exports.getInternalMovements = getInternalMovements;
/**
 * <p>Route | GET:transfers</p>
 * <p>Gets all of user's transfers</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'transfers' property with the transfers
 */
function getTransfers(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const wallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
        if (!wallet) {
            return h.response({ feedback: 'Wallet not found' }).code(404);
        }
        const movementList = database_1.db.data.movementLists.find((list) => list.walletId === wallet.id);
        if (!movementList) {
            return h.response({ feedback: 'Movement list not found' }).code(404);
        }
        return h
            .response({
            feedback: 'Transfers found',
            transfers: movementList.transfers,
        })
            .code(200);
    });
}
exports.getTransfers = getTransfers;
/**
 * <p>Route | GET:payments</p>
 * <p>Gets all of user's payments</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'payments' property with the payments
 */
function getPayments(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const wallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
        if (!wallet) {
            return h.response({ feedback: 'Wallet not found' }).code(404);
        }
        const movementList = database_1.db.data.movementLists.find((list) => list.walletId === wallet.id);
        if (!movementList) {
            return h.response({ feedback: 'Movement list not found' }).code(404);
        }
        return h
            .response({
            feedback: 'Payments found',
            payments: movementList.payments,
        })
            .code(200);
    });
}
exports.getPayments = getPayments;
/**
 * <p>Route | POST:payments</p>
 * <p>Processes new payment</p>
 * <p>User is identified using JWT token credentials</p>
 * <p>Payload required: entity (string), reference (string), transactionValue (string|number)</>
 * <p>Payload optional: description (string)
 *
 * @returns 'feedback' property and, if successful, 'payment' property with the new payment
 */
function makePayment(request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        let { entity, reference, transactionValue, description } = (request.payload);
        if (entity === undefined) {
            return h.response({ feedback: 'Missing entity property' }).code(400);
        }
        if (reference === undefined) {
            return h.response({ feedback: 'Missing reference property' }).code(400);
        }
        if (transactionValue === undefined) {
            return h
                .response({ feedback: 'Missing transactionValue property' })
                .code(400);
        }
        if (parseFloat(transactionValue) <= 0 ||
            isNaN(parseFloat(transactionValue))) {
            return h.response({ feedback: 'Invalid transaction value' }).code(400);
        }
        transactionValue = (0, utils_1.setDecimalPlaces)(transactionValue);
        if (parseFloat(transactionValue) <= 0) {
            return h.response({ feedback: 'Invalid amount' }).code(400);
        }
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const wallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
        if (!wallet) {
            return h.response({ feedback: 'Wallet not found' }).code(404);
        }
        wallet.funds = (0, utils_1.addValues)(wallet.funds, -transactionValue);
        if (parseFloat(wallet.funds) < 0) {
            return h.response({ feedback: 'Not enough funds' }).code(401);
        }
        const payment = new payment_1.Payment(entity, reference, '-' + transactionValue, wallet.funds, 'Service payment processed' //TODO Use payload description
        );
        const movementList = database_1.db.data.movementLists.find((list) => list.walletId === wallet.id);
        if (!movementList) {
            return h.response({ feedback: 'Movement list not found' }).code(404);
        }
        movementList.payments.unshift(payment);
        (0, bankUtils_1.updateWallet)(wallet);
        (0, bankUtils_1.updateMovementList)(movementList);
        yield database_1.db.write(); //Required to write to database
        return h.response({ feedback: 'Payment processed', payment }).code(200);
    });
}
exports.makePayment = makePayment;
/**
 * <p>Route | POST:payments</p>
 * <p>Processes new payment</p>
 * <p>User is identified using JWT token credentials</p>
 * <p>Payload required: entity (string), reference (string), transactionValue (string|number)</>
 * <p>Payload optional: description (string)
 *
  'feedback' property and, if successful, 'payment' property with the new payment
 **/
function subscribe(request, h) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        const user = (_a = database_1.db.data) === null || _a === void 0 ? void 0 : _a.users.find((user) => user.id === userId);
        let { paymentInfo, subscribed } = (request.payload);
        // Verifique se os dados de pagamento são válidos
        if (!paymentInfo.cardNumber || !paymentInfo.expirationDate || !paymentInfo.cvv) {
            return h.response({ feedback: 'Todos os detalhes de pagamento são obrigatórios' }).code(400);
        }
        yield database_1.db.read(); //Required to get up-to-date database data
        if (!database_1.db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
        const name = user === null || user === void 0 ? void 0 : user.name;
        const email = user.email;
        subscribed = new subscribe_1.Subscribed(userId, email, paymentInfo, name);
        // Lógica para salvar o usuário inscrito no banco de dados
        try {
            if (user) {
                (database_1.db.data.subscribes || []).unshift(subscribed);
                (0, bankUtils_1.updateSubscriptionStatus)(user);
                // Adiciona o usuário inscrito à lista de inscritos
                // Agora você pode usar user.name com segurança.
                console.log("usuarios:", subscribed);
                console.log(user.isSubscribed);
                yield database_1.db.write(); //Required to write to database
                // Salvar 'subscribed' no banco de dados
                return h.response({ feedback: 'Inscrição realizada com sucesso' }).code(200);
                console.log("usuarios:", subscribed);
            }
            // ...
        }
        catch (error) {
            console.error(error);
            return h.response({ feedback: 'Ocorreu um erro ao processar a inscrição' }).code(500);
        }
    });
}
exports.subscribe = subscribe;
// Verifica o status de inscrição do usuário no banco de dados
function checkSubscription(request, h) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        const user = (_a = database_1.db.data) === null || _a === void 0 ? void 0 : _a.users.find((user) => user.id === userId);
        yield database_1.db.read(); //Required to get up-to-date database data
        try {
            if (!user) {
                return h.response({ feedback: 'Usuário não encontrado' }).code(403);
            }
            if (user.isSubscribed == true)
                return h.response({ feedback: 'Usuario inscrito' });
            {
            }
        }
        catch (error) {
            console.error(error);
            return h.response({ feedback: 'Ocorreu um erro ao atualizar o status de inscrição' }).code(500);
        }
    });
}
exports.checkSubscription = checkSubscription;
;
/**
 * <p>Route | POST:transfers</p>
 * <p>Processes new transfer</p>
 * <p>User is identified using JWT token credentials</p>
 * <p>Payload required: recipientWalletId (string), transactionValue (string|number)</>
 * <p>Payload optional: description (string)
 *
 * @returns 'feedback' property and, if successful, 'transfer' property with the new transfer
 */
function makeTransfer(request, h) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.auth.credentials.userId; //UserID from JWT token
        const user = (_a = database_1.db.data) === null || _a === void 0 ? void 0 : _a.users.find((user) => user.id === userId);
        let { recipientWalletId, transactionValue, recipientData, type } = (request.payload);
        if (!user || user.isSubscribed === false) {
            return h.response({ feedback: 'Usuário não está inscrito para transferências internacionais' }).code(403);
        }
        // Verifica se o usuário está inscrito para transferências internacionais
        if (type === 'international') {
            if (type === undefined) {
                return h
                    .response({ feedback: 'Missing recipientWalletId property' })
                    .code(400);
            }
            if (recipientWalletId === undefined) {
                return h
                    .response({ feedback: 'Missing recipientWalletId property' })
                    .code(400);
            }
            if (transactionValue === undefined) {
                return h
                    .response({ feedback: 'Missing transactionValue property' })
                    .code(400);
            }
            const cost = transactionValue / 15; // Custo fixo da transferência internacional
            const exchangeRate = 0.8; // Taxa de câmbio fictícia
            const totalCost = cost + transactionValue + exchangeRate; // Custo total da transação
            if (parseFloat(transactionValue) <= 0 ||
                isNaN(parseFloat(transactionValue))) {
                return h.response({ feedback: 'Invalid transaction value' }).code(400);
            }
            transactionValue = (0, utils_1.setDecimalPlaces)(transactionValue);
            if (parseFloat(transactionValue) <= 0) {
                return h.response({ feedback: 'Invalid amount' }).code(422);
            }
            yield database_1.db.read(); //Required to get up-to-date database data
            if (!database_1.db.data) {
                return h.response({ feedback: 'Database error' }).code(500);
            }
            //Get wallet of the user that's making the transfer and updating it
            const originWallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
            if (!originWallet) {
                return h.response({ feedback: 'Origin Wallet not found' }).code(404);
            }
            originWallet.funds = (0, utils_1.addValues)(originWallet.funds, -totalCost);
            //Get wallet of the user that's getting the transfer and updating it
            const recipientWallet = database_1.db.data.wallets.find((wallet) => wallet.id === recipientWalletId);
            if (!recipientWallet) {
                return h.response({ feedback: 'Recipient Wallet not found' }).code(404);
            }
            recipientWallet.funds = (0, utils_1.addValues)(recipientWallet.funds, transactionValue);
            if (parseFloat(originWallet.funds) < 0) {
                return h.response({ feedback: 'Not enough funds' }).code(401);
            }
            // Cria os objetos de Transferência para o remetente e o destinatário
            const originTransfer = new transfer_1.Transfer(originWallet.id, recipientWalletId, '-' + transactionValue, originWallet.funds, recipientData, 'international');
            const recipientTransfer = new transfer_1.Transfer(originWallet.id, recipientWalletId, transactionValue, recipientWallet.funds, recipientData, 'international');
            // Atualiza as listas de movimento do remetente e do destinatário
            const originMovementList = database_1.db.data.movementLists.find((list) => list.walletId === originWallet.id);
            if (!originMovementList) {
                return h.response({ feedback: 'Movement list not found' }).code(404);
            }
            originMovementList.transfers.unshift(originTransfer);
            //Get movement list of the user that's getting the transfer
            const recipientMovementList = database_1.db.data.movementLists.find((list) => list.walletId === recipientWallet.id);
            if (!recipientMovementList) {
                return h.response({ feedback: 'Movement list not found' }).code(404);
            }
            recipientMovementList.transfers.unshift(recipientTransfer);
            (0, bankUtils_1.updateWallet)(originWallet);
            (0, bankUtils_1.updateWallet)(recipientWallet);
            (0, bankUtils_1.updateMovementList)(originMovementList);
            (0, bankUtils_1.updateMovementList)(recipientMovementList);
            yield database_1.db.write(); //Required to write to database
            return h
                .response({ feedback: 'Transfer processed', transfer: originTransfer })
                .code(200);
        }
        else {
            if (type === undefined) {
                return h
                    .response({ feedback: 'Missing recipientWalletId property' })
                    .code(400);
            }
            if (recipientWalletId === undefined) {
                return h
                    .response({ feedback: 'Missing recipientWalletId property' })
                    .code(400);
            }
            if (transactionValue === undefined) {
                return h
                    .response({ feedback: 'Missing transactionValue property' })
                    .code(400);
            }
            if (parseFloat(transactionValue) <= 0 ||
                isNaN(parseFloat(transactionValue))) {
                return h.response({ feedback: 'Invalid transaction value' }).code(400);
            }
            transactionValue = (0, utils_1.setDecimalPlaces)(transactionValue);
            if (parseFloat(transactionValue) <= 0) {
                return h.response({ feedback: 'Invalid amount' }).code(422);
            }
            yield database_1.db.read(); //Required to get up-to-date database data
            if (!database_1.db.data) {
                return h.response({ feedback: 'Database error' }).code(500);
            }
            //Get wallet of the user that's making the transfer and updating it
            const originWallet = database_1.db.data.wallets.find((wallet) => wallet.userId === userId);
            if (!originWallet) {
                return h.response({ feedback: 'Origin Wallet not found' }).code(404);
            }
            originWallet.funds = (0, utils_1.addValues)(originWallet.funds, -transactionValue);
            //Get wallet of the user that's getting the transfer and updating it
            const recipientWallet = database_1.db.data.wallets.find((wallet) => wallet.id === recipientWalletId);
            if (!recipientWallet) {
                return h.response({ feedback: 'Recipient Wallet not found' }).code(404);
            }
            recipientWallet.funds = (0, utils_1.addValues)(recipientWallet.funds, transactionValue);
            if (parseFloat(originWallet.funds) < 0) {
                return h.response({ feedback: 'Not enough funds' }).code(401);
            }
            const originTransfer = new transfer_1.Transfer(originWallet.id, recipientWalletId, '-' + transactionValue, originWallet.funds, recipientData, type);
            const recipientTransfer = new transfer_1.Transfer(originWallet.id, recipientWalletId, transactionValue, recipientWallet.funds, recipientData, type);
            //Get movement list of the user that's making the transfer
            const originMovementList = database_1.db.data.movementLists.find((list) => list.walletId === originWallet.id);
            if (!originMovementList) {
                return h.response({ feedback: 'Movement list not found' }).code(404);
            }
            originMovementList.transfers.unshift(originTransfer);
            //Get movement list of the user that's getting the transfer
            const recipientMovementList = database_1.db.data.movementLists.find((list) => list.walletId === recipientWallet.id);
            if (!recipientMovementList) {
                return h.response({ feedback: 'Movement list not found' }).code(404);
            }
            recipientMovementList.transfers.unshift(recipientTransfer);
            (0, bankUtils_1.updateWallet)(originWallet);
            (0, bankUtils_1.updateWallet)(recipientWallet);
            (0, bankUtils_1.updateMovementList)(originMovementList);
            (0, bankUtils_1.updateMovementList)(recipientMovementList);
            yield database_1.db.write(); //Required to write to database
            return h
                .response({ feedback: 'Transfer processed', transfer: originTransfer })
                .code(200);
        }
    });
}
exports.makeTransfer = makeTransfer;
