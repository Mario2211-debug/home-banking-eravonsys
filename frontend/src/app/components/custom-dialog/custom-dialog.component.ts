import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'homebanking-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent {
    constructor(public dialog: MatDialog, public router: Router) { }

    subscribe() {
        this.router.navigateByUrl('subscribe');
    }
}
