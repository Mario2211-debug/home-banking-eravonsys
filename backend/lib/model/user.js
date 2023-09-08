"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const crypto_1 = require("crypto");
const utils_1 = require("../utils");
// Classe User que implementa a interface IUser.
class User {
    // Construtor da classe User que cria uma instância de usuário.
    constructor(email, password, name, isSubscribed) {
        // Gera um ID de usuário único.
        this.id = (0, crypto_1.randomUUID)();
        // Define o email do usuário.
        this.email = email;
        // Remove espaços em branco extras do nome, se fornecido.
        this.name = name === null || name === void 0 ? void 0 : name.trim();
        // Define a data e hora de criação como a data atual em formato UTC.
        this.createdAt = (0, utils_1.currentDateAsUTCString)();
        // Define a data e hora de atualização inicialmente como a data de criação.
        this.updatedAt = this.createdAt;
        // Define a senha do usuário (provavelmente, a senha está criptografada).
        this.password = password;
        this.isSubscribed = isSubscribed;
    }
}
exports.User = User;
