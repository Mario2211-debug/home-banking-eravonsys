import { IInternalMovement, InternalMovement } from './internalMovement';

export interface IRecipientData {
    recipientEmail?: string;
    recipientName?: string;
    description?: string;
}

export interface ITransfer extends IInternalMovement, IRecipientData {
    originWalletId: string;
    recipientWalletId: string;
    
}

export class Transfer extends InternalMovement implements ITransfer {
    originWalletId: string;
    recipientWalletId: string;
    recipientEmail?: string;
    recipientName?: string;
    type?: string;

    constructor(
        originWalletId: string,
        recipientWalletId: string,
        transactionValue: string,
        newWalletValue: string,
        recipientData?: IRecipientData,
        type?: string,

    ) {
        super(transactionValue, newWalletValue, recipientData?.description?.trim());
        this.originWalletId = originWalletId;
        this.recipientWalletId = recipientWalletId;
        this.recipientEmail = recipientData?.recipientEmail;
        this.recipientName = recipientData?.recipientName;
        this.type = type;
    }
}
