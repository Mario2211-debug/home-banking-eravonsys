export interface IPaymentInfo {
    cardNumber: string;
    expirationDate: string;
    cvv: string;
}

export class PaymentInfo implements IPaymentInfo {
    cardNumber: string;
    expirationDate: string;
    cvv: string;

    constructor(cardNumber: string, expirationDate: string, cvv: string) {
        this.cardNumber = cardNumber;
        this.expirationDate = expirationDate;
        this.cvv = cvv;
    }
}