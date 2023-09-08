import { randomUUID } from 'crypto';
import { currentDateAsUTCString } from '../utils';
import { IInternalMovement } from './internalMovement';
import { IPayment } from './payment';
import { ITransfer } from './transfer';

// Definição de uma interface IMovementList que descreve a estrutura de uma lista de movimentos.
export interface IMovementList {
    id: string;
    walletId: string;
    createdAt: string;
    updatedAt: string;
    internalMovements: IInternalMovement[];
    payments: IPayment[];
    transfers: ITransfer[];
}

// Classe MovementList que implementa a interface IMovementList.
export class MovementList implements IMovementList {
    id: string;
    walletId: string;
    createdAt: string;
    updatedAt: string;
    internalMovements: IInternalMovement[];
    payments: IPayment[];
    transfers: ITransfer[];

    // Construtor da classe MovementList que cria uma instância de lista de movimentos.
    constructor(walletId: string) {

        // Gera um ID de lista de movimentos único.
        this.id = randomUUID();

        // Define o ID da carteira associada à lista de movimentos.
        this.walletId = walletId;

        // Define a data e hora de criação como a data atual em formato UTC.
        this.createdAt = currentDateAsUTCString();

        // Define a data e hora de atualização inicialmente como a data de criação.
        this.updatedAt = this.createdAt;
        
        // Inicializa as listas de movimentos vazias.
        this.internalMovements = [];
        this.payments = [];
        this.transfers = [];
    }
}