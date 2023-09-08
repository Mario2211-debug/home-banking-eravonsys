"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementList = void 0;
const crypto_1 = require("crypto");
const utils_1 = require("../utils");
// Classe MovementList que implementa a interface IMovementList.
class MovementList {
    // Construtor da classe MovementList que cria uma instância de lista de movimentos.
    constructor(walletId) {
        // Gera um ID de lista de movimentos único.
        this.id = (0, crypto_1.randomUUID)();
        // Define o ID da carteira associada à lista de movimentos.
        this.walletId = walletId;
        // Define a data e hora de criação como a data atual em formato UTC.
        this.createdAt = (0, utils_1.currentDateAsUTCString)();
        // Define a data e hora de atualização inicialmente como a data de criação.
        this.updatedAt = this.createdAt;
        // Inicializa as listas de movimentos vazias.
        this.internalMovements = [];
        this.payments = [];
        this.transfers = [];
    }
}
exports.MovementList = MovementList;
