import { randomUUID } from 'crypto';
import { currentDateAsUTCString } from '../utils';
import { IPaymentInfo } from './paymentinfo';

export interface ISubscribed  {
    id: string;
    userId: string;
    name?: string;
    email: string;
    paymentInfo: IPaymentInfo;
    createdAt: string;
    updatedAt: string;
    
}

export class Subscribed implements ISubscribed {
    id: string;
    userId: string;
    name?: string;
    email: string;
    paymentInfo: IPaymentInfo;
    createdAt: string;
    updatedAt: string;

    constructor(userId: string, email: string, paymentInfo: IPaymentInfo, name?: string,) {
        this.id = randomUUID();
        this.userId = userId;
        this.name = name?.trim();
        this.email = email;
        this.paymentInfo = paymentInfo;
        this.createdAt = currentDateAsUTCString() || '';
        this.updatedAt = currentDateAsUTCString() || '';
    }
}