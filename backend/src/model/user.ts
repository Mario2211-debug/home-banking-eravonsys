import { randomUUID } from 'crypto';
import { currentDateAsUTCString } from '../utils';

// Definição de uma interface IUser que descreve a estrutura de um usuário.
export interface IUser {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    password: string;
    lastLogin?: string;
    name?: string;
    isSubscribed?:boolean;
}
export interface ISubscribed extends IUser {
    isSubscribed?: boolean;
        
}
// Classe User que implementa a interface IUser.
export class User implements IUser {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    password: string;
    lastLogin?: string;
    name?: string;
    isSubscribed?:boolean;


    // Construtor da classe User que cria uma instância de usuário.
    constructor(email: string, password: string, name?: string, isSubscribed?:boolean) {
        
        // Gera um ID de usuário único.
        this.id = randomUUID();
        
        // Define o email do usuário.
        this.email = email;
        // Remove espaços em branco extras do nome, se fornecido.
        this.name = name?.trim();
        // Define a data e hora de criação como a data atual em formato UTC.
        this.createdAt = currentDateAsUTCString();
        // Define a data e hora de atualização inicialmente como a data de criação.
        this.updatedAt = this.createdAt;
        // Define a senha do usuário (provavelmente, a senha está criptografada).
        this.password = password;

        this.isSubscribed = isSubscribed;

    }
}