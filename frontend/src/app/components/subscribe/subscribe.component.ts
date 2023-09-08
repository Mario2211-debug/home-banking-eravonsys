import { AfterViewInit, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, fromEvent, takeUntil } from 'rxjs';
import { BankService } from '../../services/bank.service';

@Component({
  selector: 'homebanking-subscribe-page',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss'],
})
export class SubscribePageComponent implements AfterViewInit {
  private readonly destroy$ = new Subject();

  nameForm: FormControl = new FormControl();
    emailForm: FormControl = new FormControl();
    cardNumberForm: FormControl = new FormControl();
    cvvForm: FormControl = new FormControl();
    expirationDateForm: FormControl = new FormControl();

  subscribeForm: FormControl = new FormControl();
  paymentButtonEnabled = true;

  constructor(private bankService: BankService, private router: Router) {}

  ngAfterViewInit() {
    //Prevents button click spam
    const refreshButton = document.getElementById('subscribeRefresh');
    if (refreshButton) {
      fromEvent(refreshButton, 'click')
        .pipe(
          debounceTime(250),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }

  }

  goToHome() {
    this.router.navigateByUrl('home');
  }

// Método para atualizar o status de inscrição

  makeSubscription() {
    this.paymentButtonEnabled = false;
    this.bankService
    
        .subscribe(this.nameForm.value, this.emailForm.value,{
            cardNumber: this.cardNumberForm.value,
            cvv: this.cvvForm.value,
            expirationDate: this.expirationDateForm.value,
        })
        .subscribe({
            next: () => {
                this.nameForm.reset();
                this.emailForm.reset();
                this.cardNumberForm.reset();
                this.cvvForm.reset();
                this.expirationDateForm.reset();
            },
            error: (error) => {
                if (error) {
                    // Exibir pop-up com mensagem e link de inscrição
                    alert(error.error.feedback);

                  }
            },

        });
        this.goToHome();

  }


  //Map subscribe objects to better display on the table
  private mapSubscribes(subscribes: any) {
    return subscribes.map((subscribe: any) => {
      subscribe.createdAt = new Date(subscribe.createdAt).toLocaleString();
      // Add more mappings if needed.
      return subscribe;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
