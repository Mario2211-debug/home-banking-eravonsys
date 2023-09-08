import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MainComponent } from './components/main/main.component';
import { HomeComponent } from './components/home/home.component';
import { RootComponent } from './components/root/root.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MovementsComponent } from './components/movements/movements.component';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransfersPageComponent } from './components/transfers-page/transfers-page.component';
import { PaymentsPageComponent } from './components/payments-page/payments-page.component';
import { AccountPageComponent } from './components/account-page/account-page.component';
//import { SidenavComponent } from './sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Routes }   from '@angular/router';
import { NgIf } from '@angular/common';
import { SideNavService } from './services/sidenav.service';
import { MatSelectModule } from '@angular/material/select';
import { SubscribePageComponent } from './components/subscribe/subscribe.component';
import{MatSnackBarModule} from '@angular/material/snack-bar'
import { MatDialogModule } from '@angular/material/dialog';
import { CustomDialogComponent } from './components/custom-dialog/custom-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';




@NgModule({
    declarations: [
        LoginComponent,
        NavbarComponent,
        RegisterComponent,
        MainComponent,
        HomeComponent,
        RootComponent,
        MovementsComponent,
        TransfersPageComponent,
        PaymentsPageComponent,
        AccountPageComponent,
        SubscribePageComponent,
        CustomDialogComponent,
        //SidenavComponent,
    ],
    imports: [
        MatSnackBarModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatToolbarModule,
        MatIconModule,
        NgbModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatListModule,
        MatTooltipModule,
        MatSidenavModule,
MatDialogModule,
MatSelectModule,
MatExpansionModule,
FormsModule,
MatButtonModule,
MatMenuModule,
NgIf,
MatFormFieldModule

    ],


    providers: [SideNavService],
    bootstrap: [RootComponent],
})

export class AppModule {}
