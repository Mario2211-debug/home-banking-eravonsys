"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const crypto_1 = require("crypto");
const utils_1 = require("../utils");
// Classe Wallet que implementa a interface IWallet.
class Wallet {
    // Construtor da classe Wallet que cria uma instância de carteira.
    constructor(userId) {
        // Gera um ID de carteira único.
        this.id = (0, crypto_1.randomUUID)();
        // Define o ID do usuário associado à carteira.
        this.userId = userId;
        // Define a data e hora de criação como a data atual em formato UTC.
        this.createdAt = (0, utils_1.currentDateAsUTCString)();
        // Define a data e hora de atualização inicialmente como a data de criação.
        this.updatedAt = this.createdAt;
        // Define o saldo inicial da carteira como "0.00".
        this.funds = "0.00";
    }
}
exports.Wallet = Wallet;
