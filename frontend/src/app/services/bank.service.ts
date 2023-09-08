import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface RecipientData {
    recipientName?: string;
    recipientEmail?: string;
    description?: string;
}

export interface PaymentInfo {
    cardNumber?: string;
    expirationDate?:string
    cvv?: string;
}

@Injectable({
    providedIn: 'root',
})
export class BankService {
    constructor(
        private httpClient: HttpClient,
        private authService: AuthService
    ) {}

    profile() {
        const url = environment.apiUrl + 'profile';
        return this.httpClient.get(url, {
            headers: this.authService.getAuthHeader(),
        });
    }

    getFunds() {
        const url = environment.apiUrl + 'funds';
        return this.httpClient.get(url, {
            headers: this.authService.getAuthHeader(),
        });
    }

    withdrawFunds(value: number) {
        const url = environment.apiUrl + 'funds?funds=' + value;
        return this.httpClient.delete(url, {
            headers: this.authService.getAuthHeader(),
        });
    }

    depositFunds(value: number) {
        const url = environment.apiUrl + 'funds';
        return this.httpClient.put(
            url,
            { funds: value },
            { headers: this.authService.getAuthHeader() }
        );
    }

    getMovements() {
        const url = environment.apiUrl + 'movements';
        return this.httpClient.get(url, {
            headers: this.authService.getAuthHeader(),
        });
    }

    getInternalMovements() {
        const url = environment.apiUrl + 'internalMovements';
        return this.httpClient.get(url, {
            headers: this.authService.getAuthHeader(),
        });
    }

    getPayments() {
        const url = environment.apiUrl + 'payments';
        return this.httpClient.get(url, {
            headers: this.authService.getAuthHeader(),
        });
    }

    getTransfers() {
        const url = environment.apiUrl + 'transfers';
        return this.httpClient.get(url, {
            headers: this.authService.getAuthHeader(),
        });
    }

    makeTransfer(
        recipientWalletId: string,
        transactionValue: any,
        recipientData: RecipientData,
        type: string,
    ) {
        const url = environment.apiUrl + 'transfers';
        const data = { recipientWalletId, transactionValue, recipientData, type };
        return this.httpClient.post(url, data, {
            headers: this.authService.getAuthHeader(),
        });
    }

    makePayment(entity: string, reference: string, transactionValue: string) {
        const url = environment.apiUrl + 'payments';
        const data = { entity, reference, transactionValue };
        return this.httpClient.post(url, data, {
            headers: this.authService.getAuthHeader(),
        });
    }

    subscribe(
        name: string,
        email: string,
        paymentInfo: PaymentInfo
        ) {
        const url = environment.apiUrl + 'subscribe';
        const data = { name, email, paymentInfo };
        return this.httpClient.post(url, data, {
            headers: this.authService.getAuthHeader(),
        });
    }

    getsubscribe() {
        const url = environment.apiUrl + 'subscribe';
        return this.httpClient.get(url, {
            headers: this.authService.getAuthHeader(),
        });
    }

// Rota para verificar status de inscrição
updateSubscriptionStatus(){
    const url = environment.apiUrl + 'user'; // ajuste o endpoint conforme necessário
    return this.httpClient.get(url, {
        headers: this.authService.getAuthHeader(),
    });

};

checkSubscription() {
    const url = environment.apiUrl + 'checkSubscription'; // ajuste o endpoint conforme necessário
    return this.httpClient.get(url, {
        headers: this.authService.getAuthHeader(),
    });
}
}
