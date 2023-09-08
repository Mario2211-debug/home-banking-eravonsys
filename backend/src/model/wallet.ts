import { randomUUID } from 'crypto';
import { currentDateAsUTCString } from '../utils';

// Definição de uma interface IWallet que descreve a estrutura de uma carteira.
export interface IWallet {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    funds: string;
}

// Classe Wallet que implementa a interface IWallet.
export class Wallet implements IWallet {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    funds: string;

    // Construtor da classe Wallet que cria uma instância de carteira.
    constructor(userId: string) {
        // Gera um ID de carteira único.
        this.id = randomUUID();
        // Define o ID do usuário associado à carteira.
        this.userId = userId;
        // Define a data e hora de criação como a data atual em formato UTC.
        this.createdAt = currentDateAsUTCString();
        // Define a data e hora de atualização inicialmente como a data de criação.
        this.updatedAt = this.createdAt;
        // Define o saldo inicial da carteira como "0.00".
        this.funds = "0.00";
    }
}